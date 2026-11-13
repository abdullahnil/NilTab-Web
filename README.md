# NilTab Web 🌙

Modern, şık ve özelleştirilebilir dinamik ekran koruyucu ve başlangıç sekmesi (New Tab / Dashboard) uygulaması.

---

## 🚀 Özellikler

- 🕌 **Diyanet & Aladhan Namaz Vakitleri:** Diyanet REST API desteği ve konum tabanlı namaz vakti hesabı.
- 🌤️ **Detaylı Hava Durumu:** Şehir tabanlı ve konum erişimli 24 saatlik/7 günlük hava durumu tahmini.
- 🎨 **Çizim Tahtası (Whiteboard):** Not almak ve çizim yapmak için dahili beyaz tahta modu.
- 🎙️ **Sesli Asistan & Gemini AI Entegrasyonu:** Türkçe sesli komutlar ve Gemini AI desteği.
- 🖼️ **Dinamik Arka Planlar:** Doğadan manzaralar, uzay videoları ve renk geçişli (gradient) temalar.
- 🌐 **Çoklu Dil Desteği:** Türkçe, İngilizce, Almanca, Rusça, Arapça ve Makedonca.
- 🔒 **Güvenli Node.js Proxy:** Diyanet REST API istekleri için özel Whitelist (İzin Listesi) korumalı proxy sunucusu.

---

## 🛠️ Kurulum & Çalıştırma

### 1. Frontend (İstemci)

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/kullaniciadi/nilsaver.git
   cd nilsaver
   ```
2. Herhangi bir statik web sunucusunda veya doğrudan `index.html` dosyasını tarayıcınızda açarak çalıştırabilirsiniz.

---

### 2. Diyanet API Proxy Sunucusu (`diyanet-proxy.js`)

Diyanet REST API CORS ve kimlik doğrulama gereksinimlerini güvenli şekilde karşılamak için Node.js proxy sunucusunu çalıştırın:

1. Bağımlılık gerektirmez (Node.js dahili `http` ve `fetch` modüllerini kullanır).
2. Ortam değişkenlerini ayarlayın (veya `.env` dosyası oluşturun):
   ```bash
   export DIYANET_EMAIL="ornek@email.com"
   export DIYANET_PASSWORD="diyanet_sifreniz"
   export PORT=3000
   export ALLOWED_ORIGINS="https://niltab-alan-adiniz.com"   # virgülle birden fazla verilebilir
   export TRUST_PROXY=1          # yalnızca nginx/Cloudflare arkasında çalışıyorsa
   export RATE_LIMIT_PER_MIN=30  # IP başına dakikada Diyanet'e iletilen istek sınırı
   ```
3. Proxy sunucusunu başlatın:
   ```bash
   node diyanet-proxy.js
   ```
   *Veya PM2 ile arka planda çalıştırın:*
   ```bash
   DIYANET_EMAIL="ornek@email.com" DIYANET_PASSWORD="diyanet_sifreniz" pm2 start diyanet-proxy.js --name diyanet-proxy
   ```

---

## 🛡️ Güvenlik & Whitelist Koruması

Proxy sunucusu (`diyanet-proxy.js`), botların veya yetkisiz isteklerin Diyanet API'ye geçersiz istek atarak hesabınızı riske atmasını önlemek için dahili **Whitelist (İzin Listesi)** korumasına sahiptir:
- Yalnızca izin verilen API yollarına (`/api/Place/*`, `/api/PrayerTime/*`) izin verilir.
- Tanımlanmayan diğer tüm istekler Diyanet'e iletilmeden `404 Not Found` olarak engellenir.
- Yollar birebir eşleştirilir (yalnızca sayısal ID'ler kabul edilir) ve query string iletilmez.
- `ALLOWED_ORIGINS` ile yalnızca kendi alan adınızdan gelen tarayıcı istekleri kabul edilir.
- Yanıtlar sunucu belleğinde önbelleğe alınır (yer listeleri 7 gün, namaz vakitleri 6 saat). Diyanet'e giden istekler IP başına hız sınırına tabidir.
- Diyanet giriş bilgileri yalnızca sunucudaki ortam değişkenlerinde tutulmalıdır; tarayıcı tarafına asla koymayın.

---

## 📄 Lisans

Bu proje [MIT](LICENSE) lisansı altında sunulmaktadır.
