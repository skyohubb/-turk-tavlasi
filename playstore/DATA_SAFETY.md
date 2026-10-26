# DATA SAFETY — Düşeş Tavla v1.0.0 (Capacitor, gerçek AdMob)

Play Console → Uygulama içeriği → Veri Güvenliği formu için birebir cevaplar (vc12, TEST_MODE=false):

## Form soruları ve cevapları

- **Veri topluyor mu?** Evet.
- **Toplanan veri türleri:**
  - **Cihaz kimliği** → Google reklam kimliği (Advertising ID / AAID)
  - **Diğer bilgiler** → Uygulama etkileşim verileri (reklam gösterimi/tıklama, AdMob SDK)
  - **IP adresi** (yaklaşık konum olarak AdMob işler)
- **Toplama amacı:** Reklam (kişiselleştirilmiş reklam gösterimi) + Sahtekârlık önleme/güvenlik
- **Toplanıyor mu?** Evet, cihazdan toplanıyor
- **Üçüncü tarafla paylaşım?** Evet → Google LLC / AdMob yayıncı ortakları (yalnızca reklam amaçlı)
- **Satış?** Hayır
- **Konum, kişiler, fotoğraf, dosya, kamera, mikrofon toplanıyor mu?** Hayır (IP'den yaklaşık konum hariç, o da reklam amaçlı Cihaz kimliği kapsamında)
- **Hesap/e-posta girişi var mı?** Hayır
- **Şifreleme iletim sırasında:** Evet (AdMob SDK TLS kullanır)
- **Veri silme talebi:** Kullanıcı silebilir → uygulama içi Profil → Verilerimi Sil (oyun verileri) + [Google Reklam Ayarları](https://adssettings.google.com) (reklam verileri). Ayrıntılar: `/privacy`.
- **Çocuk hedefleme:** Hedef kitle 13+, çocuklar için tasarlanmamış, kumar yok, sanal akçe gerçek paraya çevrilemez.

## Play Console adımları

1. Uygulama içeriği → Veri Güvenliği → formu yukarıdaki cevaplarla doldur
2. Gizlilik politikası URL: `https://inquisitive-dieffenbachia-91c987.netlify.app/privacy`
3. Gönder → inceleme (sahte beyan politika ihlalidir — AdMob gerçek ID'li AAB'de bu işaretler zorunlu)

> Eskiden "Hayır (veri yok)" yazıyordu — vc12 gerçek AdMob'a geçince bu CEVAP GEÇERSİZ ve Play ret sebebidir.
