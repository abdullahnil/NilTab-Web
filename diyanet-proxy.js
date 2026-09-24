const http = require('http');

const PORT = process.env.PORT || 3000;
const DIYANET_EMAIL = process.env.DIYANET_EMAIL || "";
const DIYANET_PASSWORD = process.env.DIYANET_PASSWORD || "";
const DIYANET_API_BASE = "https://awqatsalah.diyanet.gov.tr";

let accessToken = "";
let tokenExpiry = 0;

// Helper to decode JWT expiry (Unix epoch in milliseconds)
function getJwtExpiry(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return 0;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return (payload.exp * 1000) || 0;
    } catch (e) {
        return 0;
    }
}

// Authenticate with Diyanet and cache the token in memory
async function getDiyanetToken() {
    if (accessToken && Date.now() < (tokenExpiry - 5 * 60 * 1000)) {
        return accessToken;
    }
    
    if (!DIYANET_EMAIL || !DIYANET_PASSWORD) {
        throw new Error("DIYANET_EMAIL and DIYANET_PASSWORD environment variables are required.");
    }
    
    console.log(`[${new Date().toISOString()}] Authenticating with Diyanet REST API...`);
    const response = await fetch(`${DIYANET_API_BASE}/Auth/Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: DIYANET_EMAIL,
            password: DIYANET_PASSWORD
        })
    });
    
    if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
    }
    
    const res = await response.json();
    if (res.success && res.data && res.data.accessToken) {
        accessToken = res.data.accessToken;
        tokenExpiry = getJwtExpiry(accessToken);
        console.log(`[${new Date().toISOString()}] Auth Successful. Token expires at:`, new Date(tokenExpiry));
        return accessToken;
    } else {
        throw new Error(res.message || "Authentication response parsing failed");
    }
}

// HTTP Server listening for incoming requests
const server = http.createServer(async (req, res) => {
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Whitelist check: Only allow valid Diyanet API routes used by NilTab
    const allowedPrefixes = [
        '/api/Place/Countries',
        '/api/Place/States',
        '/api/Place/Cities',
        '/api/PrayerTime/Monthly'
    ];

    const isAllowed = allowedPrefixes.some(prefix => url.pathname.startsWith(prefix));

    if (!isAllowed) {
        console.log(`[${new Date().toISOString()}] Blocked unwhitelisted request: ${req.method} ${url.pathname}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: "Invalid or unwhitelisted API endpoint." }));
        return;
    }

    try {
        const token = await getDiyanetToken();
        
        // Construct target request url
        const targetUrl = `${DIYANET_API_BASE}${url.pathname}${url.search}`;
        console.log(`[${new Date().toISOString()}] Proxying: ${req.method} ${url.pathname} -> ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const status = response.status;
        const contentType = response.headers.get('content-type') || 'application/json';
        const data = await response.text();

        res.writeHead(status, { 'Content-Type': contentType });
        res.end(data);
    } catch (e) {
        console.error(`[${new Date().toISOString()}] Proxy Error:`, e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message || "Internal Proxy Server Error" }));
    }
});

server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Diyanet REST API Proxy Server Running!`);
    console.log(`Port: ${PORT}`);
    console.log(`Email account: ${DIYANET_EMAIL}`);
    console.log(`URL schema example: http://localhost:${PORT}/api/Place/Countries`);
    console.log(`=========================================`);
});
