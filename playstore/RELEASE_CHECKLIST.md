# RELEASE CHECKLIST — v1.0.0 (versionCode 10, CAPACITOR)

## 1. Sürüm bilgileri
- package.json: `1.0.0`, appId: `com.duses.tavla`, appName: `Düşeş Tavla`
- Android: `versionCode 10`, `versionName 1.0.0`, `targetSdk 36` ✅ (Play'in 34 şartını karşılıyor), `minSdk 24`
- `android/app/src/main/AndroidManifest.xml` AdMob App ID girildi ✅

## 2. İmzalanmış AAB ✅ üretildi (2026-10-09)
- Güncel dosya: `playstore/duses-tavla-v1.0.0-vc10.aab` (15.3 MB, CAPACITOR, **versionCode 10**, sürüm adı 1.0.0) — vc6/vc7 Play'de "kod kullanıldı" hatası verdi (6-9 dolu), içerik aynı, kod 10'a alındı
- İçerik: vc5 + gerçek launcher ikonu (5 yoğunluk, koyu zemin), yedek-rozeti silindi, privacy uygulama-içi, iki-dokunuş silme onayı, kart seçim-only, venue kimlik eşleşmesi
- İçerik: vc4 + reklam hang düzeltmeleri (Dismissed yarışı, Loaded bekleme, sebepli sonuç), ödül/cooldown tutarlılıkları, Victory sahte-onay düzeltmesi
- Reklam modu: TEST_MODE=true → Google test reklamları (güvenli). Gerçek ID testi için `.env.local` false + test cihazını AdMob'a kaydet + yeniden `build:mobile` + AAB
- Eski vc4 (TWA) dosyası web hattı yedeği olarak duruyor; Play'e vc5 (Capacitor) yüklenir
- Yöntem: Capacitor (`android/`), ASCII kopyada derlendi (`C:\duses-aab-build`), JDK 21 + build-tools 36.1.0, şifreler env'den (dosyada sır yok)
- Doğrulandı: imza parmak izi `75:57:4E:19:…:FD:A8` ✅, yeni JS AAB içinde ✅ (`dismissed-early`, `rewardNonce`)
- İçerik: pullar/hedefler büyütüldü, bildirim yağmuru kesildi, gerçek AdMob ödül/geçiş akışı, mağaza %50 indirim çekleri, alt bar odaları, kayıt zırhı, 2 kişilik siyah taraf düzeltmeleri
- Eski vc2/vc1 dosyaları geçersiz, Play'e yükleme
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
