# DATA SAFETY — Düşeş Tavla v1.0.0 (çevrimdışı)

Play Console → Uygulama içeriği → Veri Güvenliği formu için birebir cevaplar:

- **Veri topluyor mu?** Hayır (v1.0 cihaz-içi mod). AdMob gerçek ID ile açılırsa: Evet → Cihaz kimliği (reklam amaçlı, Google SDK işler).
- **Konum, kişiler, fotoğraf, dosya toplanıyor mu?** Hayır.
- **Hesap/e-posta girişi var mı?** Hayır.
- **Üçüncü tarafla paylaşım?** Web placeholder reklamda yok. Android + gerçek AdMob'ta Google ile paylaşılır (reklam gösterimi).
- **Veri silme:** Uygulama içi Profil → Verilerimi Sil. Web: tarayıcı site verilerini temizle. Ayrıntılar: `/privacy`.
- **Çocuk hedefleme:** Hedef kitle 13+, kumar yok, sanal akçe gerçek paraya çevrilemez.
- **Şifreleme:** Yerel depolama; ağa kişisel veri gönderilmez.

Form doldurulurken "reklam kimliği" satırını yalnızca gerçek AdMob'lu AAB'de işaretleyin.
