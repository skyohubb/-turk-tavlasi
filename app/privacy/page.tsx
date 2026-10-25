import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — Düşeş Tavla',
  description: 'Düşeş: Efsanevi Türk Tavlası gizlilik politikası ve veri silme talimatları.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#120b07] text-[#fef3c7] px-5 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-amber-500/30 bg-white/[0.04] p-6 sm:p-8">
        <h1 className="font-serif-tavla text-2xl font-black text-white">Gizlilik Politikası</h1>
        <p className="mt-1 text-xs text-amber-200/70">Son güncelleme: 25 Ekim 2026 · v1.2</p>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-amber-100/85">
          <p>
            <strong className="text-white">Düşeş: Efsanevi Türk Tavlası</strong> oyun profili ve
            oyun ilerlemesi tamamen <strong className="text-white">cihazınızda</strong> saklanır.
            Hesap açmanız, e-posta vermeniz veya konum izni vermeniz gerekmez. Profil adı, avatar,
            oyun istatistikleri ve akçe bakiyesi yalnızca sizin cihazınızdaki yerel depolamada tutulur;
            sunucuya gönderilmez ve üçüncü taraflarla paylaşılmaz.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">Toplanan veriler</h2>
          <ul className="list-disc pl-5">
            <li>Oyuncu takma adı (isteğe bağlı, siz yazarsanız)</li>
            <li>Oyun istatistikleri: maç sayısı, galibiyet, mars, reyting, seviye</li>
            <li>Uygulama içi satın alım dekontları (varsa; ödeme Google Play üzerinden işlenir)</li>
          </ul>
          <p>
            Üçüncü taraflara kişisel veri satışı veya reklam profili paylaşımı yoktur.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">Reklamlar ve reklam kimliği</h2>
          <p>
            Android sürümünde <strong className="text-white">Google AdMob</strong> ile reklam
            gösterilir. AdMob, reklam kişiselleştirmesi için{' '}
            <strong className="text-white">Google reklam kimliğini</strong> (Advertising ID) ve
            cihaz/uygulama tanıtım bilgilerini işleyebilir. Bu bilgiler Google LLC ve reklam
            ortakları tarafından reklam ölçümü ve kişiselleştirme amacıyla kullanılır.
          </p>
          <ul className="list-disc pl-5">
            <li>
              Android uygulamasında alt kenarda <strong className="text-white">banner</strong>,
              oyun arasında <strong className="text-white">geçiş</strong> ve izleyerek ödül
              aldığınız <strong className="text-white">ödüllü</strong> reklamlar gösterilir;
              reklamları Google ve reklam ortakları sağlar.
            </li>
            <li>
              Reklam kimliğini Android ayarlarınızdan sıfırlayabilir veya kişiselleştirmeyi
              kapatabilirsiniz (Ayarlar → Google → Reklamlar).
            </li>
            <li>Uygulama, izniniz olmadan konum, kişi listesi veya dosyalara erişmez.</li>
            <li>Web sürümünde gösterilen sponsor kartları yer tutucudur; tıklamada dış site açılmaz.</li>
          </ul>

          <h2 className="font-serif-tavla text-base font-bold text-white">Veri silme</h2>
          <p>
            Uygulama içinden: Profil → Ayarlar → <strong className="text-white">Verilerimi Sil</strong>.
            Bu işlem cihazınızdaki tüm oyun profilini sıfırlar. Web&apos;de tarayıcı site
            verilerini temizlemek de aynı sonucu verir. Reklam kimliği verileri Google tarafında
            tutulur; onları Google&apos;ın reklam ayarları sayfasından silebilirsiniz.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">Çocuklar</h2>
          <p>
            Uygulama çocuklar da dahil her yaştan kullanıcıya açıktır ancak çocuklara özel
            pazarlama yapılmaz ve çocuklardan bilerek kişisel veri toplanmaz.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">Bu politikanın güncellenmesi</h2>
          <p>
            Politika değişirse aynı sayfada en güncel hali yayınlanır; son güncelleme tarihi
            sayfanın başında belirtilir.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">İletişim</h2>
          <p>
            Sorularınız için Play Store&apos;daki geliştirici iletişim adresine veya uygulama
            içi geri bildirim kanalına yazabilirsiniz.
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-stone-950"
        >
          ← Oyuna Dön
        </Link>
      </div>
    </main>
  );
}
