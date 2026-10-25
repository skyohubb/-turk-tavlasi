# RELEASE CHECKLIST — v1.0.0 (versionCode 12, CAPACITOR)

## 1. Sürüm bilgileri
- package.json: `1.0.0`, appId: `com.duses.tavla`, appName: `Düşeş Tavla`
- Android: `versionCode 12`, `versionName 1.0.0`, `targetSdk 36` ✅ (Play'in 35 şartını karşılıyor), `minSdk 24`
- `android/app/src/main/AndroidManifest.xml` AdMob App ID girildi ✅

## 2. İmzalanmış AAB ✅ üretildi (2026-10-25)
- Güncel dosya: `playstore/duses-tavla-v1.0.0-vc12.aab` (15.4 MB, CAPACITOR, **versionCode 12**, sürüm adı 1.0.0) — **GÜNCEL**: yeni banner (7032594932) + native banner entegrasyonu, privacy v1.2, TEST_MODE=false (gerçek reklam)
- İçerik: vc11 + NativeAdBanner (alt kenar, uyarlanabilir, layout boşluğu), privacy v1.2, banner birimi 7032594932 (eskisi 3475354268 geçersizdi)
- Reklam modu: TEST_MODE=false → **Gerçek AdMob ID'ler** (kapalı test için test cihazını AdMob'a kaydet!)
- Yöntem: Capacitor (`android/`), ASCII kopyada derlendi (`C:\duses-aab-build`), JDK 21 + build-tools 36.1.0, şifreler env'den (dosyada sır yok)
- Doğrulandı: imza parmak izi `75:57:4E:19:…:FD:A8` ✅, yeni JS AAB içinde ✅ (`NativeAdBanner`, `showBannerNative`, `7032594932`, `isTestMode!1`)
- Eski vc2/vc1/vc10/vc11 dosyaları geçersiz, Play'e yükleme
- Yöntem: Bubblewrap (`playstore/twa/twa-manifest.json`), JDK 17 + build-tools 36.1.0
- İmza: `playstore/keys/duses-release.keystore` (alias `duses`) — şifreler `playstore/keys/KEYSTORE_BILGILERI.txt` içinde
- ⚠️ Keystore + bilgi dosyası repoya girmez (.gitignore) — USB + buluta yedekle, kaybolursa güncelleme yapamazsın
- Not: derleme ASCII yolda yapıldı (`C:\duses-twa-build`), proje yolu `ö` içerdiği için Gradle reddediyordu

## 3. AdMob ✅ girildi (test ID kalmadı)
- App ID: `ca-app-pub-6440512201259891~6791782749` (manifest + env)
- Banner (sabit): `ca-app-pub-6440512201259891/7032594932` (25.10 yeni birim; eskisi `3475354268` "Geçerli değil" idi)
- Geçiş: `ca-app-pub-6440512201259891/4812486667`
- Ödüllü: `ca-app-pub-6440512201259891/2186323326`
- Yedek ödüllü geçiş: `ca-app-pub-6440512201259891/5893459039`
- Not: yeni birimlerin reklam göstermesi ~1 saat sürebilir. Yayın öncesi test cihazında
  `admobService.isTestMode === false` olduğunu doğrula.
- Web placeholder kartlar gerçek reklam gibi gösterilmemeli (üzerinde "Sponsor" yazıyor, yeterli)

## 4. Mağaza girişi
- Başlık/kısa/tam açıklama: `PLAYSTORE_LISTING.md` (küresel lig iddiası kaldırıldı)
- İkon: `public/icons/icon-512.png` (512x512 PNG) → Play'e yükle
- Feature graphic 1024x500 + en az 2 telefon ekran görüntüsü + 1 tablet
- Kategori: Oyunlar > Masa Oyunları, IARC anketi: PEGI 3 / Herkes
- Gizlilik URL'si (Play Console'a gir): `https://inquisitive-dieffenbachia-91c987.netlify.app/privacy`
- Reklam Kimliği beyanı (Play Console): **Evet** → `Reklam veya pazarlama` + `Sahtekarlığı önleme, güvenlik ve kanunlara uygunluk`. AD_ID izni GMA SDK'dan otomatik birleşir (vc6'da doğrulandı, ek manifest işi yok). "Hataları devre dışı bırak" kutusu İŞARETLENMEZ
- Netlify env'de `APP_URL` aynı adres olmalı
- Veri silme beyanı: uygulama içi Verilerimi Sil + privacy sayfası

## 5. Test
- Kapalı test: en az 12 tester × 14 gün (yeni hesap kuralı)
- Blitz timer, enerji bitmesi, ödüllü video, uçak modu (offline) senaryolarını işlet
- `npm run build` + `npx tsc --noEmit` temiz

## 6. Yayın sonrası
- ANR/crash (Android vitals), AdMob doluluk oranı, D1/D7 retention takibi
- Çevrimiçi lig ancak gerçek backend + KVKK metni güncellenince açılmalı
