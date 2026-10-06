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
        <p className="mt-1 text-xs text-amber-200/70">Son güncelleme: 5 Ekim 2026 · v1.0.0</p>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-amber-100/85">
          <p>
            <strong className="text-white">Düşeş: Efsanevi Türk Tavlası</strong> v1.0 sürümünde
            tamamen <strong className="text-white">çevrimdışı</strong> çalışır. Hesap, e-posta,
            konum veya reklam kimliği toplamayız. Profil adı, avatar seçimi, oyun istatistikleri
            ve akçe bakiyesi yalnızca sizin cihazınızda (tarayıcı/app yerel depolama) saklanır.
          </p>
          <h2 className="font-serif-tavla text-base font-bold text-white">Toplanan veriler</h2>
          <ul className="list-disc pl-5">
            <li>Oyuncu takma adı (isteğe bağlı, siz yazarsanız)</li>
            <li>Oyun istatistikleri: maç sayısı, galibiyet, mars, reyting, seviye</li>
            <li>Üçüncü tarafla paylaşım/kimlik satışı yoktur.</li>
          </ul>
          <h2 className="font-serif-tavla text-base font-bold text-white">Reklamlar</h2>
          <p>
            Web sürümünde gösterilen sponsor kartları yer tutucudur, tıklamada dış site açılmaz.
            Android sürümünde gerçek Google AdMob kullanılırsa, Google&apos;un reklam politikası
            geçerli olur ve çerez/reklam kimliği Google tarafından işlenebilir.
          </p>
          <h2 className="font-serif-tavla text-base font-bold text-white">Veri silme</h2>
          <p>
            Uygulama içinden: Profil → Ayarlar → <strong className="text-white">Verilerimi Sil</strong>.
            Bu işlem cihazınızdaki tüm profili sıfırlar. Web&apos;de tarayıcı site verilerini
            temizlemek de aynı sonucu verir.
          </p>
          <h2 className="font-serif-tavla text-base font-bold text-white">İletişim</h2>
          <p>Destek: uygulama içi geri bildirim veya Play Store geliştirici e-postası üzerinden.</p>
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
