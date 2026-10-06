# NETLIFY YAYINI — Adım adım (5 dakika)

Bu repo Netlify'a hazır: `netlify.toml` Next.js plugin ile API route'larını
destekler. Ben senin Netlify hesabına girip deploy edemem, ama şunları yapman yeterli:

## 1. Site adresi (canlı): `https://inquisitive-dieffenbachia-91c987.netlify.app`

> ⚠️ 5 Ekim kontrolü: site şu an `out/` yer tutucu sayfasını gösteriyor
> (manuel sürükle-bırak static deploy yapılmış). Aşağıdaki **Git bağlantısı**
> adımını yapmadan `/privacy` 404 verir. Repo bağlanınca gerçek uygulama gelir.

## 1. Siteyi Git'e bağla (zorunlu — şu an bağlı değil)
1. Netlify → siten (`inquisitive-dieffenbachia`) → Site settings → Build & deploy → **Link repository**
2. `turk-tavlasi` repo'nu seç, ayarlar OTOMATİK gelir (`netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Environment variables (Site settings → Environment variables) — AdMob gerçek ID'ler:
   - `NEXT_PUBLIC_ADMOB_APP_ID` = `ca-app-pub-6440512201259891~6791782749`
   - `NEXT_PUBLIC_ADMOB_BANNER_ID` = `ca-app-pub-6440512201259891/3475354268`
   - `NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID` = `ca-app-pub-6440512201259891/4812486667`
   - `NEXT_PUBLIC_ADMOB_REWARDED_ID` = `ca-app-pub-6440512201259891/2186323326`
   - `NEXT_PUBLIC_ENABLE_ONLINE_LEAGUE` = `false`
   - `APP_URL` = `https://inquisitive-dieffenbachia-91c987.netlify.app`
5. Deploy → Trigger deploy → gerçek uygulama yayınlanır.

## 2. Play Store için bu URL'ler kullanılır
- Gizlilik politikası URL'i (Play Console'a gir): `https://inquisitive-dieffenbachia-91c987.netlify.app/privacy`
- Veri silme beyanı: aynı sayfa + uygulama içi Profil → Verilerimi Sil
- Test et (hepsi 200 dönmeli): `/`, `/privacy`, `/manifest.json`, `/sw.js`, `/.well-known/assetlinks.json`

## 3. TWA (Play Store AAB) için parmak izi
1. Play Console → Uygulaman → Kurulum → Uygulama bütünlüğü → SHA-256 parmak izini kopyala
2. `public/.well-known/assetlinks.json` içindeki `BURAYA_PLAY_CONSOLE_SHA256_PARMAK_IZI_GELECEK`
   yerine yapıştır, commit + push (Netlify otomatik redeploy eder)
3. Bubblewrap ile AAB üret (repo kökünde çalıştır):
   ```
   npx @bubblewrap/cli init --manifest https://inquisitive-dieffenbachia-91c987.netlify.app/manifest.json
   npx @bubblewrap/cli build
   ```
   Detay: `playstore/RELEASE_CHECKLIST.md`

## 4. Neden `out/` static export yapmadık?
- `output: 'export'` açılsa `/api/*` (lig, sync, SSE sohbet) çalışmazdı.
- Mevcut `output: 'standalone'` + Netlify Next plugin = hem web hem API yaşar.
- Capacitor tarafı için `out/` yerine TWA öneriyoruz (tek kod, tek URL, Play kabul eder).
  Yine de istersen `android/` iskeleti repo'ya eklendi (`npx cap add android` çıktısı).

## 5. Yayın öncesi kontrol
- [ ] `/privacy` açılıyor
- [ ] AdMob gerçek ID'ler girildi (`isTestMode === false`)
- [ ] `assetlinks.json` parmak izi gerçek
- [ ] Kapalı test 12 kişi × 14 gün
