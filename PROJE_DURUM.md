# DÜŞEŞ TAVLA — PROJE DURUM BELGESİ

> Bu dosya projenin hafızasıdır. Her önemli işten sonra güncellenir.
> Son güncelleme: 2026-10-24 · Sürüm adı 1.0.0 · Sürüm kodu 4 (vc4 yayında)

## 1. Proje nedir?
- Ad: **Düşeş: Efsanevi Türk Tavlası** · Paket: `com.duses.tavla`
- Next.js 15 + React 19 + Tailwind v4, tek dilli (TR), çevrimdışı-öncelikli tavla oyunu
- Web (Netlify) + Android (TWA/Bubblewrap AAB) — Capacitor iskeleti durur ama Play yolu TWA'dır
- Oyun modları: Klasik AI (7 usta), Blitz 15sn, 2 kişilik (local_2p, pass-and-play)

## 2. Canlı adresler
- Site: `https://inquisitive-dieffenbachia-91c987.netlify.app`
- Gizlilik (Play'e verilen URL): `.../privacy`
- GitHub kod: `skyohubb/-turk-tavlasi` · Netlify'nin derlediği depo: `skyohubb/inquisitive-dieffenbachia-91c987`
- İkisi de aynı kodda tutulur (iki repoya da push yapılır)

## 3. Sürüm geçmişi (AAB)
| Kod | Dosya | İçerik |
|-----|-------|--------|
| vc1 | `playstore/duses-tavla-v1.0.0.aab` | İlk TWA (geçersiz, kod çakışması değil yedek) |
| vc2 | `playstore/duses-tavla-v1.0.0-vc2.aab` | Kapalı teste yüklenen ilk sürüm |
| vc3 | (ara derleme, dosyası saklanmadı) | Performans turu (blitz yalıtım, hafif mod, resim sıkıştırma) |
| vc4 | `playstore/duses-tavla-v1.0.0-vc4.aab` | **GÜNCEL**: büyük pullar, gerçek AdMob akışı, mağaza %50 çekleri, alt bar odaları, kayıt zırhı, 2P siyah düzeltmeleri |
| vc5 | `playstore/duses-tavla-v1.0.0-vc5.aab` | İLK CAPACITOR AAB (native AdMob!). Reklam hang düzeltmeleri içinde (Dismissed yarışı + Loaded bekleme + sebepli sonuç). TEST_MODE=true (Google test reklamı gösterir). 15MB, versionCode 5, yükleme anahtarıyla imzalı |
| vc6 | `playstore/duses-tavla-v1.0.0-vc6.aab` | (09.10) Gerçek ikon, rozet temizliği, privacy içerde, iki-dokunuş silme, kart seçim-only, venue kimlik eşleşmesi. versionCode 6 — Play "kullanıldı" dedi, yüklenemedi |
| vc7 | `playstore/duses-tavla-v1.0.0-vc7.aab` | vc6 ile aynı içerik, versionCode 7 — Play "kullanıldı" dedi, yüklenemedi |
| vc10 | `playstore/duses-tavla-v1.0.0-vc10.aab` | (09.10): vc6/vc7 ile aynı içerik, versionCode 10 (6-9 Play'de dolu — eski taslaklar kapmış, detaya girilmedi, üste zıplandı) |
| vc11 | `playstore/duses-tavla-v1.0.0-vc11.aab` | **GÜNCEL (10.10)**: AD_ID izni eklendi (`com.google.android.gms.permission.AD_ID`) — Play "reklam kimliği beyanı" hatası düzeltmesi. versionCode 11, imzalı, merged manifest doğrulandı |
| vc12 | `playstore/duses-tavla-v1.0.0-vc12.aab` | **GÜNCEL (25.10)**: Yeni banner birimi (7032594932) + native AdMob banner (alt kenar, uyarlanabilir), privacy v1.2, TEST_MODE=false (gerçek reklam). versionCode 12, imzalı, JDK 21, ASCII build. |

## 4. İmza ve kimlikler (dosyalar repoya GİRMEZ)
- Keystore: `playstore/keys/duses-release.keystore` (alias `duses`) — USB+bulut yedeği ŞART
- Şifreler: `playstore/keys/KEYSTORE_BILGILERI.txt` (sadece bu PC'de)
- Yükleme anahtarı SHA-256: `75:57:4E:19:...:FD:A8` (detay bilgi dosyasında)
- AdMob gerçek kimlikleri: `.env.local` + `AndroidManifest.xml` + `NETLIFY_DEPLOY.md` içinde (TEST_MODE=false → gerçek reklam)
  - App: `...~6791782749` · Banner: `.../7032594932` (25.10, eskisi 3475354268 "geçersiz" idi)
  - Geçiş: `.../4812486667` · Ödüllü: `.../2186323326` · Yedek ödüllü geçiş: `.../5893459039`
- assetlinks.json: 3 parmak izi (noktalı format!) yayında, Google doğruladı

## 5. Yapılan büyük işler (özet)
1. Derleme yeşil (tsc + next build), ölü Gemini kodu silindi, `npm run clean` düzeltildi
2. Capacitor kurulu ama Play yolu TWA (statik export API'leri öldürürdü diye yapılmadı)
3. Sahte "küresel lig" iddiaları temizlendi → çevrimdışı Kahvehane Ligi (dürüst metinler)
4. `/privacy` sayfası + Profilde "Verilerimi Sil" + DATA_SAFETY.md
5. Manifest PNG-only, sw.js çevrimdışı önbellek, ikonlar düzeltildi
6. Oyun bugları: zar-yenileme takılması, 2P siyah oynayamama/undo, büyük-zar zorunluluğu (seçim+kontrol+AI+danışman), AI zamanlayıcı
7. Sohbet sunucudan koparıldı → cihaz-içi hazır kalıplar (sıfır sunucu masrafı, `/api/tavla/chat` silindi)
8. Ekran uyumu: `xs` kırılımı tanımlandı (ölüydü!), tahta min-w-0/shrink, tüm modallara max-h+kaydırma
9. Performans: 22.6MB→~2MB resim, 7MB kopya silindi, SafeImage lazy, 1sn'lik kör render durduruldu, sonsuz animasyonlar statikleştirildi, blitz saati harici store'a alındı (`lib/tavla/blitzClock.ts`), Hafif Mod (Ses ayarlarında 🪶)
10. Mağaza: çift fiyat (tuzlu normal + %50 reklam indirimi), satır içi SATIN AL/KUŞAN, sabit footer, kasa her ekranda, indirim çeki 10dk (`boardDiscounts`)
11. Profil: isim düzenleme (Enter=Kaydet) + telefondan fotoğraf (256px, cihazda, sunucusuz)
12. Alt bar 5 oda (Oyna/Mağaza/İkram/Lig/Profil, Lucide ikonlu) — aktif olmayan oda DOM'a girmez
13. Kayıt zırhı: çift slot (ana+yedek), ASCII anahtar + eski anahtardan otomatik taşıma, bozuk veride ezmeme
14. Ortak `useToast` + `lib/format` (tekrarlar silindi), Lig odası çökmesi düzeltildi
15. Fontlar yerelleştirildi (09.10): `next/font/google` → `@fontsource` (Cinzel 600-900 + Jakarta 400-700). Build artık Google Fonts ağına bağlı değil, çevrimdışı/TWA'da çalışır
16. Reklam denetimi + düzeltmeler (09.10): ödül listener yarışı (tam izlenen videoda "yarım kaldı" hatası) düzeltildi — listener'lar gösterimden ÖNCE, karar promise'te, finally'de temizlik; native takılmaya 60sn timeout; günlük limit tek kaynak (8, eskiden 6/8 karışıktı); cooldown modal-parent senkronu; Victory sahte "Alındı" rozeti artık gerçek ödülde (rewardNonce); mağaza Escape'i indirim videosu açıkken mağazayı kapatmıyor; interstitial sayaç başarısız gösterimde yanmıyor; `describeActiveUnits()` debug eklendi
17. AAB beyaz-ekran kök nedeni (09.10, Java kanıtlı): plugin v8'de rewarded `show` sözü ödülsüz kapatmada ASLA çözülmüyor → modal donuyordu. Düzeltme: prepare çözülmeden show YOK (20sn yükleme sınırı, hazır değilse pencere açılmıyor), show Dismissed/FailedToShow sinyaliyle yarışıyor (kapatınca UI anında dönüyor), sonuç sebepli nesne (`completed/dismissed-early/load-failed/show-failed/timeout`), show/interstitial'a açık `adId`. `npm run build:mobile` android/assets'i tazeledi (doğrulandı)
18. Gizlilik politikası Play ret düzeltmesi (24.10): Play Console'a kök URL girilmiş, Google "geçersiz gizlilik politikası" demiş. `/privacy` sayfası zaten yayındaydı ama ana sayfa statik HTML'inde bağlantı yoktu. Yapılan: (a) privacy sayfası v1.1 — AdMob/Advertising ID/Google LLC/çocuklar/madde madde yenilendi, (b) KahvehaneLobby altına her lobide görünen `/privacy` bağlantısı eklendi (statik HTML'de doğrulandı), (c) Netlify'a push edilince yayına girecek. Play Console'da Gizlilik politikası URL'si `https://inquisitive-dieffenbachia-91c987.netlify.app/privacy` olmalı (kök değil!)
19. Yeni banner birimi + native banner entegrasyonu (25.10): AdMob yeni banner (7032594932, eskisi 3475354268 "Geçerli değil" idi). NativeAdBanner bileşeni eklendi (alt kenar, uyarlanabilir, layout boşluğu `--admob-banner-h`), LobbyBottomNav bottom offset, TEST_MODE=false → gerçek reklam ID'leri. AAB vc12 (versionCode 12) ASCII build ile basıldı (JDK 21, C:\duses-aab-build), imza parmak izi doğrulandı.
20. Gizlilik politikası ret düzeltmesi v1.3 (26.10): Play "mağazada gizlilik politikası ekle/eksik" ret mesajı + Data Safety formunda "veri toplamıyorum" (AdMob ile çelişki). Yapılan: (a) privacy sayfası v1.3 — gerçek iletişim e-postası (turkanimerkan@gmail.com), AdMob'un işlediği veriler madde madde (AAID, IP, cihaz bilgisi, reklam etkileşimi), paylaşım tarafı açık (Google LLC + AdMob ortakları), yanlış IAP iddiası silindi, adssettings.google.com çıkış linki, TLS/saklama/silme bölümleri, "paylaşılmaz" çelişkisi giderildi (oyun verisi ≠ reklam verisi), (b) DATA_SAFETY.md + PLAYSTORE_LISTING.md §5 gerçek form cevaplarıyla yenilendi (Cihaz kimliği toplanıyor + paylaşılıyor). KALAN: Play Console'da Veri Güvenliği formunu yeniden doldur + Gizlilik URL alanını /privacy olarak teyit et.

## 6. Kalan / sıradaki işler
- [ ] **Play Console**: (1) Veri Güvenliği formu YENİDEN doldurulacak — Cihaz kimliği (AAID) toplanıyor + Google/AdMob ile paylaşılıyor (reklam), satılmıyor, iletimde şifreli (`DATA_SAFETY.md` birebir cevaplar), (2) Gizlilik politikası URL `https://inquisitive-dieffenbachia-91c987.netlify.app/privacy` teyit edilecek (kök değil), (3) App content → Privacy policy gönderilecek (26.10 ret mesajı: "politika ekle/eksik")
- [ ] Play incelemesi sonucu bekleniyor (kapalı test, vc2 yüklü — vc12 test bitince yükle)
- [ ] Adres çubuğu: assetlinks Google-onaylı; uygulamada test edilecek (sil → yeniden kur)
- [ ] "Powered by Netlify" rozeti (08.10 teşhisi): sayfa HTML'inde + uygulama kodunda YOK (taranan: tüm `fixed` öğeler, sponsor kartları, bottom-nav, canlı site HTML'i). İkon platform katmanından geliyor: ya Custom Tab fallback (assetlinks o cihazda doğrulanmamış) ya da cihaz UI'ı. Kaldırma = kodla değil, cihazda "Varsayılan olarak aç → bağlantılar doğrulandı mı" kontrolü + ekran görüntüsüyle teşhis. Kalıcı çözüm: özel alan adı (netlify.app damgası tamamen biter).
- [ ] İkinci remote eksik: `git remote` çıktısında sadece `skyohubb/-turk-tavlasi` var; Netlify deposu (`.../inquisitive-dieffenbachia-91c987`) remote olarak ekli değil — "iki repoya push" kuralı şu an işlemiyor
- [ ] Capacitor yolu kırık-ölü: `capacitor.config.ts` webDir `out` bekler ama `next.config.ts` output `standalone` (out/ klasörü eski kalıntı). TWA yolu etkilenmez; Capacitor APK basılacaksa karar verilip düzeltilmeli
- [x] Küçük tutarlılıklar (08.10): RELEASE_CHECKLIST başlığı vc1→vc4, `.env.example` APP_URL canlı adrese, `build:mobile` scripti cross-platform (`&&`) yapıldı
- [ ] Web AdSense (isteğe bağlı, ayrı başvuru — AdMob webde YASAK)
- [ ] Oyna odası diyeti (legacy lobi hâlâ ağır — odalar hafif, oyna eski halde duruyor)
- [ ] next/image geçişi (düşük öncelik)

## 7. AAB basma talimatı (kopyala-çalıştır)
0. ÖNCE `npm run build:mobile` (web `out/` tazelenir + `npx cap sync` android/assets'e kopyalar — atlanırsa Play'e ESKİ JS gider!)
1. `playstore/twa/twa-manifest.json` → `appVersionCode` +1
2. Manifesti `C:\duses-twa-build\twa\` içine kopyala
3. `update --skipVersionUpgrade` → `build` (şifreler `KEYSTORE_BILGILERI.txt` içinde, env ile verilir)
4. AAB'yi `playstore/duses-tavla-v1.0.0-vcN.aab` adıyla kopyala
5. `RELEASE_CHECKLIST.md` güncelle, commit + iki repoya push
- Bilinen tuzaklar: proje yolu Türkçe harf içeremez (ASCII yolda derle), Bubblewrap ayar `~/.bubblewrap/config.json`, JSON'larda BOM olmamalı, JDK yolu boşluksuz olmalı (`C:\jdk17` bağlantısı)

### 7b. CAPACITOR AAB (native AdMob'lu, vc5'ten beri — TWA'da gerçek reklam YOK)
1. `npm run build:mobile` (taze JS → android/assets) — ÖNEMLİ: `cap sync` eski hash'li dosyaları silmez, `android/app/src/main/assets/public` klasörünü ÖNCE silip sonra sync yap (bayat chunk AAB'ye gömülmesin)
2. `android/app/build.gradle` → `versionCode` +1 (imza ayarı env'den okur, dosyada sır YOK)
3. TEST_MODE kararı: `.env.local` → `true` = Google test reklamı (güvenli test), `false` = gerçek ID'ler (kapalı testte test cihazını AdMob'a kaydet!) — değiştirildiyse 1. adıma dön
4. ASCII kopya: `android/` → `C:\duses-aab-build\android` (build/.gradle hariç), plugin android klasörleri → `C:\duses-aab-build\plugin-src/` (capacitor-android, admob, preferences, app-update), kopyadaki `capacitor.settings.gradle` mutlak ASCII yollara çevrilir (BOM'suz!)
5. Derle (JDK **21**, SDK kısa yolu, şifreler env'den):
   `$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"; $env:ANDROID_HOME="C:\Users\KADNM~1\AppData\Local\Android\Sdk"; $env:GRADLE_USER_HOME="C:\duses-gradle-home"; $env:DUSES_KEYSTORE_FILE="<repo>/playstore/keys/duses-release.keystore"; $env:DUSES_STORE_PASSWORD="<bilgi-dosyasından>"; $env:DUSES_KEY_PASSWORD=$env:DUSES_STORE_PASSWORD; gradlew.bat -p C:\duses-aab-build\android app:bundleRelease`
6. Çıktı: `C:\duses-aab-build\android\app\build\outputs\bundle\release\app-release.aab` → `playstore/duses-tavla-v1.0.0-vcN.aab`
7. Doğrula: keytool ile META-INF/DUSES.RSA parmak izi `75:57:4E:19:…:FD:A8` olmalı + AAB içindeki page JS'te yeni kod (`dismissed-early`) var mı bak
- Neden kopya? Kotlin derleyicisi `ö/ı` geçen yolları bozuyor (`D:\u00F6zel`, `Kadu0131n`) → "No variants exist" / "source file not found". SDK yolu da kısa adla (KADNM~1) verilir. `backup_rules.xml` exclude'ları include'suz yazılmaz (lintVital patlar).

## 8. Netlify notları
- Repo bağlandı, push → otomatik derleme. "Drop deployment" görülürse Git bağlı değildir!
- Env'ler dashboardda: AdMob ID'ler + `NEXT_PUBLIC_ENABLE_ONLINE_LEAGUE=false` + `APP_URL`
- Sohbet yerelleştiği için fonksiyon kotası rahat; lig/sync önbellekli
