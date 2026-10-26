import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — Düşeş Tavla',
  description: 'Düşeş: Efsanevi Türk Tavlası gizlilik politikası, reklam verileri ve veri silme talimatları.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#120b07] text-[#fef3c7] px-5 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-amber-500/30 bg-white/[0.04] p-6 sm:p-8">
        <h1 className="font-serif-tavla text-2xl font-black text-white">Gizlilik Politikası</h1>
        <p className="mt-1 text-xs text-amber-200/70">Son güncelleme: 26 Ekim 2026 · v1.3</p>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-amber-100/85">
          <p>
            <strong className="text-white">Düşeş: Efsanevi Türk Tavlası</strong> (paket adı:{' '}
            <code className="rounded bg-white/10 px-1">com.duses.tavla</code>) oyununun bu
            gizlilik politikası, uygulamanın kullanıcı verilerini nasıl topladığını, kullandığını ve
            paylaştığını açıklar. Hesap açmanız, e-posta vermeniz veya konum izni vermeniz gerekmez.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">
            1. Veri toplama ve kullanma
          </h2>
          <p>
            Oyun profili ve ilerleme tamamen{' '}
            <strong className="text-white">cihazınızda</strong> saklanır. Bu veriler sunucuya
            gönderilmez ve oyun amaçları dışında kullanılmaz:
          </p>
          <ul className="list-disc pl-5">
            <li>Oyuncu takma adı ve avatarı (isteğe bağlı; siz yazarsanız)</li>
            <li>Oyun istatistikleri: maç sayısı, galibiyet, mars, reyting, seviye</li>
            <li>Sanal akçe bakiyesi ve mağaza eşyaları (yalnızca oyunda geçerlidir, gerçek paraya çevrilemez)</li>
          </ul>
          <p>
            Uygulamada gerçek parayla uygulama içi satın alma bulunmaz; tüm mağaza işlemleri sanal
            oyun parasıyla yapılır. Konum, kişi listesi, kamera, mikrofon veya dosya erişimi istenmez.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">
            2. Reklamlar ve üçüncü taraflar (Google AdMob)
          </h2>
          <p>
            Android sürümünde reklam gösterimi için <strong className="text-white">Google AdMob</strong>{' '}
            (Google LLC) kullanılır. Reklam SDK&apos;sı aşağıdaki verileri işleyebilir:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-white">Google reklam kimliği</strong> (Advertising ID / AAID)
            </li>
            <li>IP adresi ve yaklaşık konum (IP üzerinden)</li>
            <li>Cihaz türü, modeli, işletim sistemi ve uygulama sürümü</li>
            <li>Reklam gösterimleri ve etkileşim verileri (gösterim, tıklama, ödüllü reklam izleme)</li>
          </ul>
          <p>Bu veriler aşağıdaki amaçlarla kullanılır:</p>
          <ul className="list-disc pl-5">
            <li>Reklam gösterimi ve reklam sıralama</li>
            <li>Reklam ölçümü ve raporlama</li>
            <li>Sahtekârlık önleme ve güvenlik</li>
            <li>
              Reklam kişiselleştirme (varsayılan açıktır; aşağıdan kapatabilirsiniz)
            </li>
          </ul>
          <p>
            <strong className="text-white">Paylaşım:</strong> Bu reklam verileri yalnızca reklam
            amaçlarıyla <strong className="text-white">Google LLC</strong> ve AdMob yayıncı
            ortakları (3. taraf reklam ağları) ile paylaşılır. Oyun profiliniz, istatistikleriniz ve
            akçe bakiyeniz bu taraflarla <strong className="text-white">paylaşılmaz</strong>.
            Kişisel verileriniz satılmaz.
          </p>
          <p>Uygulamada gösterilen reklam türleri:</p>
          <ul className="list-disc pl-5">
            <li>
              Alt kenarda <strong className="text-white">banner</strong>, oyun arasında{' '}
              <strong className="text-white">geçiş</strong> ve izleyerek ödül aldığınız{' '}
              <strong className="text-white">ödüllü</strong> reklamlar (hepsi Android sürümünde)
            </li>
            <li>Web sürümünde gösterilen &quot;Sponsor&quot; kartları yer tutucudur; tıklamada dış site açılmaz</li>
          </ul>
          <p>
            <strong className="text-white">Reklam kişiselleştirmesinden çıkış:</strong>{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-amber-300"
            >
              Google Reklam Ayarları
            </a>{' '}
            sayfasından kişiselleştirilmiş reklamları kapatabilir veya reklam kimliğinizi
            sıfırlayabilirsiniz (Android: Ayarlar → Google → Reklamlar). Bu seçim uygulamayı etkilemez;
            reklamlar kişiselleştirilmemiş olarak gösterilmeye devam eder.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">
            3. Veri güvenliği ve saklama
          </h2>
          <ul className="list-disc pl-5">
            <li>Oyun profili yalnızca cihazınızdaki yerel depolamada tutulur</li>
            <li>AdMob ağ trafiği aktarımda TLS ile şifrelenir</li>
            <li>
              Reklam verilerinin saklama süresi Google&apos;ın veri saklama politikasına tabidir (
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-300"
              >
                Google&apos;ın reklam ortakları için gizlilik politikası
              </a>
              )
            </li>
          </ul>

          <h2 className="font-serif-tavla text-base font-bold text-white">4. Veri silme</h2>
          <p>
            <strong className="text-white">Oyun verileri:</strong> Uygulama içinden Profil →
            Ayarlar → <strong className="text-white">Verilerimi Sil</strong>. Bu işlem cihazınızdaki
            tüm oyun profilini sıfırlar. Web&apos;de tarayıcı site verilerini temizlemek de aynı
            sonucu verir.
          </p>
          <p>
            <strong className="text-white">Reklam verileri:</strong>{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-amber-300"
            >
              Google Reklam Ayarları
            </a>{' '}
            üzerinden reklam kimliğinizi sıfırlayabilir, kişiselleştirmeyi kapatabilir veya
            Google&apos;ın reklam verilerinizi silinmesini talep edebilirsiniz.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">5. Çocuklar</h2>
          <p>
            Uygulama her yaştan kullanıcıya açıktır; ancak çocuklara özel pazarlama yapılmaz ve
            çocuklardan bilerek kişisel veri toplanmaz. 13 yaş altı kullanıcıların ebeveyn
            gözetiminde oynaması önerilir.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">6. Politika güncellemeleri</h2>
          <p>
            Politika değişirse aynı sayfada en güncel hali yayınlanır; son güncelleme tarihi
            sayfanın başında belirtilir.
          </p>

          <h2 className="font-serif-tavla text-base font-bold text-white">7. İletişim</h2>
          <p>
            Gizlilikle ilgili sorularınız için:{' '}
            <a
              href="mailto:turkanimerkan@gmail.com"
              className="underline text-amber-300"
            >
              turkanimerkan@gmail.com
            </a>{' '}
            adresine yazabilirsiniz.
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
