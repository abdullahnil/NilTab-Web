const http = require('http');

const PORT = process.env.PORT || 3000;
const DIYANET_EMAIL = process.env.DIYANET_EMAIL || "";
const DIYANET_PASSWORD = process.env.DIYANET_PASSWORD || "";
const DIYANET_API_BASE = "https://awqatsalah.diyanet.gov.tr";

// Comma-separated list of origins allowed to call this proxy from a browser,
// e.g. "https://niltab.example.com,http://localhost:5500". "*" allows any origin.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

// Set TRUST_PROXY=1 only when running behind a reverse proxy (nginx, Cloudflare)
// that sets X-Forwarded-For; otherwise clients could spoof their IP.
const TRUST_PROXY = process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true';

// Max upstream (Diyanet) requests per client IP per minute. Cache hits do not count.
const RATE_LIMIT_PER_MIN = parseInt(process.env.RATE_LIMIT_PER_MIN, 10) || 30;

const UPSTREAM_TIMEOUT_MS = 10 * 1000;
const PLACE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // Countries/States/Cities change very rarely
const PRAYER_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5000;

// Exact allowed routes. Numeric IDs only; anything else is rejected without contacting Diyanet.
const ALLOWED_ROUTES = [
    { re: /^\/api\/Place\/Countries$/, ttl: PLACE_CACHE_TTL_MS },
    { re: /^\/api\/Place\/States\/\d{1,7}$/, ttl: PLACE_CACHE_TTL_MS },
    { re: /^\/api\/Place\/Cities\/\d{1,7}$/, ttl: PLACE_CACHE_TTL_MS },
    { re: /^\/api\/PrayerTime\/Monthly\/\d{1,7}$/, ttl: PRAYER_CACHE_TTL_MS }
];

let accessToken = "";
let tokenExpiry = 0;
let tokenPromise = null;

const responseCache = new Map(); // path -> { expires, contentType, body }
const rateBuckets = new Map();   // ip -> { windowStart, count }

function log(...args) {
    console.log(`[${new Date().toISOString()}]`, ...args);
}

// Helper to decode JWT expiry (Unix epoch in milliseconds)
function getJwtExpiry(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return 0;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        return (payload.exp * 1000) || 0;
    } catch (e) {
        return 0;
    }
}

async function login() {
    if (!DIYANET_EMAIL || !DIYANET_PASSWORD) {
        throw new Error("DIYANET_EMAIL and DIYANET_PASSWORD environment variables are required.");
    }

    log("Authenticating with Diyanet REST API...");
    const response = await fetch(`${DIYANET_API_BASE}/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: DIYANET_EMAIL, password: DIYANET_PASSWORD }),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });

    if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
    }

    const res = await response.json();
    if (res.success && res.data && res.data.accessToken) {
        accessToken = res.data.accessToken;
        // If the expiry cannot be decoded, assume a short lifetime instead of re-logging in on every request.
        tokenExpiry = getJwtExpiry(accessToken) || (Date.now() + 30 * 60 * 1000);
        log("Auth successful. Token expires at:", new Date(tokenExpiry).toISOString());
        return accessToken;
    }
    throw new Error("Authentication response parsing failed");
}

// Authenticate with Diyanet and cache the token in memory.
// Concurrent callers share a single in-flight login request.
async function getDiyanetToken() {
    if (accessToken && Date.now() < (tokenExpiry - 5 * 60 * 1000)) {
        return accessToken;
    }
    if (!tokenPromise) {
        tokenPromise = login().finally(() => { tokenPromise = null; });
    }
    return tokenPromise;
}

function getClientIp(req) {
    if (TRUST_PROXY) {
        const fwd = req.headers['x-forwarded-for'];
        if (typeof fwd === 'string' && fwd.length > 0) {
            return fwd.split(',')[0].trim();
        }
    }
    return req.socket.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
    const now = Date.now();
    let bucket = rateBuckets.get(ip);
    if (!bucket || now - bucket.windowStart >= 60 * 1000) {
        bucket = { windowStart: now, count: 0 };
        rateBuckets.set(ip, bucket);
    }
    bucket.count++;
    return bucket.count > RATE_LIMIT_PER_MIN;
}

// Periodically drop stale rate-limit buckets and expired cache entries.
setInterval(() => {
    const now = Date.now();
    for (const [ip, bucket] of rateBuckets) {
        if (now - bucket.windowStart >= 60 * 1000) rateBuckets.delete(ip);
    }
    for (const [key, entry] of responseCache) {
        if (entry.expires <= now) responseCache.delete(key);
    }
}, 60 * 1000).unref();

function setCache(key, entry) {
    if (responseCache.size >= MAX_CACHE_ENTRIES) {
        // Evict the oldest inserted entry
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
    }
    responseCache.set(key, entry);
}

function applyCors(req, res) {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

// HTTP Server listening for incoming requests
const server = http.createServer(async (req, res) => {
    applyCors(req, res);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET') {
        sendJson(res, 405, { success: false, message: "Method not allowed." });
        return;
    }

    // Reject browser requests from origins that are not on the allowlist.
    const origin = req.headers.origin;
    if (origin && !ALLOWED_ORIGINS.includes('*') && !ALLOWED_ORIGINS.includes(origin)) {
        log(`Blocked origin: ${origin}`);
        sendJson(res, 403, { success: false, message: "Origin not allowed." });
        return;
    }

    let pathname;
    try {
        pathname = new URL(req.url, 'http://localhost').pathname;
    } catch (e) {
        sendJson(res, 400, { success: false, message: "Bad request." });
        return;
    }

    // Whitelist check: only exact Diyanet API routes used by NilTab. Query strings are dropped.
    const route = ALLOWED_ROUTES.find(r => r.re.test(pathname));
    if (!route) {
        log(`Blocked unwhitelisted request: ${req.method} ${pathname}`);
        sendJson(res, 404, { success: false, message: "Invalid or unwhitelisted API endpoint." });
        return;
    }

    const cached = responseCache.get(pathname);
    if (cached && cached.expires > Date.now()) {
        res.writeHead(200, { 'Content-Type': cached.contentType, 'X-Cache': 'HIT' });
        res.end(cached.body);
        return;
    }

    // Only requests that would reach Diyanet count toward the rate limit.
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
        log(`Rate limited: ${ip} ${pathname}`);
        res.setHeader('Retry-After', '60');
        sendJson(res, 429, { success: false, message: "Too many requests. Please try again later." });
        return;
    }

    try {
        const token = await getDiyanetToken();
        const targetUrl = `${DIYANET_API_BASE}${pathname}`;
        log(`Proxying: GET ${pathname} (client ${ip})`);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
        });

        if (response.status === 401) {
            // Token was revoked/expired early; force a fresh login next time.
            accessToken = "";
            tokenExpiry = 0;
        }

        const status = response.status;
        const contentType = response.headers.get('content-type') || 'application/json';
        const body = await response.text();

        if (status === 200) {
            setCache(pathname, { expires: Date.now() + route.ttl, contentType, body });
        }

        res.writeHead(status, { 'Content-Type': contentType, 'X-Cache': 'MISS' });
        res.end(body);
    } catch (e) {
        // Log details server-side only; do not leak internal error messages to clients.
        console.error(`[${new Date().toISOString()}] Proxy Error:`, e.message);
        sendJson(res, 502, { success: false, message: "Upstream request failed." });
    }
});

server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Diyanet REST API Proxy Server Running!`);
    console.log(`Port: ${PORT}`);
    console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
    console.log(`Trust proxy (X-Forwarded-For): ${TRUST_PROXY}`);
    console.log(`Rate limit: ${RATE_LIMIT_PER_MIN} upstream req/min per IP`);
    console.log(`URL schema example: http://localhost:${PORT}/api/Place/Countries`);
    console.log(`=========================================`);
    if (ALLOWED_ORIGINS.includes('*')) {
        console.warn(`WARNING: ALLOWED_ORIGINS is "*". Set it to your NilTab domain to stop other sites from using this proxy.`);
    }
});
