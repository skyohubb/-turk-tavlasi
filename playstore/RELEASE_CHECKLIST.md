# RELEASE CHECKLIST — v1.0.0 (versionCode 1)

## 1. Sürüm bilgileri
- package.json: `1.0.0`, appId: `com.duses.tavla`, appName: `Düşeş Tavla`
- Android: `versionCode 1`, `versionName 1.0.0`, `targetSdk 36` ✅ (Play'in 34 şartını karşılıyor), `minSdk 24`
- `android/app/src/main/AndroidManifest.xml` AdMob App ID girildi ✅

## 2. İmzalanmış AAB ✅ üretildi (2026-10-06)
- Güncel dosya: `playstore/duses-tavla-v1.0.0-vc4.aab` (5 MB, TWA, **versionCode 4**, sürüm adı 1.0.0)
- İçerik: pullar/hedefler büyütüldü, bildirim yağmuru kesildi, gerçek AdMob ödül/geçiş akışı, mağaza %50 indirim çekleri, alt bar odaları, kayıt zırhı, 2 kişilik siyah taraf düzeltmeleri
- Eski vc2/vc1 dosyaları geçersiz, Play'e yükleme
- Yöntem: Bubblewrap (`playstore/twa/twa-manifest.json`), JDK 17 + build-tools 36.1.0
- İmza: `playstore/keys/duses-release.keystore` (alias `duses`) — şifreler `playstore/keys/KEYSTORE_BILGILERI.txt` içinde
- ⚠️ Keystore + bilgi dosyası repoya girmez (.gitignore) — USB + buluta yedekle, kaybolursa güncelleme yapamazsın
- Not: derleme ASCII yolda yapıldı (`C:\duses-twa-build`), proje yolu `ö` içerdiği için Gradle reddediyordu

## 3. AdMob ✅ girildi (test ID kalmadı)
- App ID: `ca-app-pub-6440512201259891~6791782749` (manifest + env)
- Banner (sabit): `ca-app-pub-6440512201259891/3475354268`
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
- Netlify env'de `APP_URL` aynı adres olmalı
- Veri silme beyanı: uygulama içi Verilerimi Sil + privacy sayfası

## 5. Test
- Kapalı test: en az 12 tester × 14 gün (yeni hesap kuralı)
- Blitz timer, enerji bitmesi, ödüllü video, uçak modu (offline) senaryolarını işlet
- `npm run build` + `npx tsc --noEmit` temiz

## 6. Yayın sonrası
- ANR/crash (Android vitals), AdMob doluluk oranı, D1/D7 retention takibi
- Çevrimiçi lig ancak gerçek backend + KVKK metni güncellenince açılmalı
