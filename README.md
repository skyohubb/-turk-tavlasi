<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Düşeş: Efsanevi Türk Tavlası (v1.0.0)

Çevrimdışı oynanabilen modern Türk tavlası oyunu (Next.js + Capacitor).

## Run Locally

**Prerequisites:** Node.js 20 veya 22 (Node 26 desteklenmez, bkz. firebase-tools uyarısı)

1. Install dependencies:
   `npm install`
2. Ortam dosyasını kopyalayın:
   `cp .env.example .env.local` ve AdMob ID'lerinizi yazın (yoksa test ID'ler kullanılır)
3. Run the app:
   `npm run dev`
4. Build doğrulama:
   `npm run build`

## Mobil (Play Store AAB)

1. `npm run build`
2. Web çıktısını `out/` klasörüne alın (TWA/Capacitor için statik export gerekir)
3. `npx cap sync` sonra Android Studio'da açın: `npx cap open android`
4. Gerçek AdMob ID'leri `.env.local` içine girilmeden production AAB üretmeyin.
5. Detaylı yayın adımları: `playstore/RELEASE_CHECKLIST.md`
6. Gizlilik politikası rotası: `/privacy` (bu URL'i Play Console'a girin)
7. Veri silme: uygulama içi Profil → Verilerimi Sil

## Lig modu

Varsayılan `NEXT_PUBLIC_ENABLE_ONLINE_LEAGUE=false` = tamamen çevrimdışı yerel lig.
Gerçek sunucu kurmadan `true` yapmayın ve mağaza açıklamasında küresel lig vadetmeyin.
