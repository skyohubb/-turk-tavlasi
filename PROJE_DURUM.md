# DÜŞEŞ TAVLA — PROJE DURUM BELGESİ

> Bu dosya projenin hafızasıdır. Her önemli işten sonra güncellenir.
> Son güncelleme: 2026-10-06 · Sürüm adı 1.0.0 · Sürüm kodu 4 (vc4 yayında)

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

## 4. İmza ve kimlikler (dosyalar repoya GİRMEZ)
- Keystore: `playstore/keys/duses-release.keystore` (alias `duses`) — USB+bulut yedeği ŞART
- Şifreler: `playstore/keys/KEYSTORE_BILGILERI.txt` (sadece bu PC'de)
- Yükleme anahtarı SHA-256: `75:57:4E:19:...:FD:A8` (detay bilgi dosyasında)
- AdMob gerçek kimlikleri: `.env.local` + `AndroidManifest.xml` + `NETLIFY_DEPLOY.md` içinde
  - App: `...~6791782749` · Banner: `.../3475354268` · Geçiş: `.../4812486667`
  - Ödüllü: `.../2186323326` · Yedek ödüllü geçiş: `.../5893459039`
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

## 6. Kalan / sıradaki işler
- [ ] Play incelemesi sonucu bekleniyor (kapalı test, vc2 yüklü — vc4'ü test bitince yükle)
- [ ] Adres çubuğu: assetlinks Google-onaylı; uygulamada test edilecek (sil → yeniden kur)
- [ ] "Powered by Netlify" rozeti: sayfa HTML'inde yok; ekran görüntüsüyle teşhis edilecek
- [ ] Web AdSense (isteğe bağlı, ayrı başvuru — AdMob webde YASAK)
- [ ] Oyna odası diyeti (legacy lobi hâlâ ağır — odalar hafif, oyna eski halde duruyor)
- [ ] next/image geçişi (düşük öncelik)

## 7. AAB basma talimatı (kopyala-çalıştır)
1. `playstore/twa/twa-manifest.json` → `appVersionCode` +1
2. Manifesti `C:\duses-twa-build\twa\` içine kopyala
3. `update --skipVersionUpgrade` → `build` (şifreler `KEYSTORE_BILGILERI.txt` içinde, env ile verilir)
4. AAB'yi `playstore/duses-tavla-v1.0.0-vcN.aab` adıyla kopyala
5. `RELEASE_CHECKLIST.md` güncelle, commit + iki repoya push
- Bilinen tuzaklar: proje yolu Türkçe harf içeremez (ASCII yolda derle), Bubblewrap ayar `~/.bubblewrap/config.json`, JSON'larda BOM olmamalı, JDK yolu boşluksuz olmalı (`C:\jdk17` bağlantısı)

## 8. Netlify notları
- Repo bağlandı, push → otomatik derleme. "Drop deployment" görülürse Git bağlı değildir!
- Env'ler dashboardda: AdMob ID'ler + `NEXT_PUBLIC_ENABLE_ONLINE_LEAGUE=false` + `APP_URL`
- Sohbet yerelleştiği için fonksiyon kotası rahat; lig/sync önbellekli
