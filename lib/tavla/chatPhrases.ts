export interface ChatPhraseCategory {
  id: string;
  name: string;
  icon: string;
  phrases: string[];
}

export const COFFEEHOUSE_PHRASE_CATEGORIES: ChatPhraseCategory[] = [
  {
    id: 'banter',
    name: 'Meydan Okuma & Nükteler',
    icon: '⚡',
    phrases: [
      'Gözün zarda değil, masada olsun usta!',
      'Zar tutma usta, bileğine güven!',
      'Geldik gördük, düşeşle döndük!',
      'Bükemediğin bileği öpeceksin usta!',
      'Bu kapıyı zor alırsın benden!',
      'Tavla zevk işidir, acelesi olan dama oynasın!',
    ],
  },
  {
    id: 'tea',
    name: 'Çay & Kahvehane Kültürü',
    icon: '☕',
    phrases: [
      'Çaycııı! Ustama açık bir tavşan kanı çay, hesabı benden!',
      'Çaylar tazelensin, bu maç uzar!',
      'Kahvemi sade alayım, oyun zaten tatlı!',
      'İnce belli bardaktan tavşan kanı çay çek usta!',
      'Ocakçı Rüstem, masaya bir demli çay daha!',
    ],
  },
  {
    id: 'dice',
    name: 'Zar & Şans',
    icon: '🎲',
    phrases: [
      'Şeş-beş gelir diye beklerken hep hep-yek geldi!',
      'Zarlar da senden yana bugün be usta!',
      'Zarın hakkını verdin, zarlar sana çalışıyor!',
      'Ah o tek kapı boş kalmayacaktı!',
      'Zar değil, sanki kader konuşuyor masada!',
    ],
  },
  {
    id: 'respect',
    name: 'Nezaket & Tebrik',
    icon: '🤝',
    phrases: [
      'Eline sağlık usta, bileğin dert görmesin.',
      'Zarın hakkını verdin, helal olsun.',
      'Usta dediğin rakibini hürmetle dinler.',
      'Kısmetten öte köy yokmuş aziz dostum.',
      'Rövanşı isterim ama, haberin olsun!',
    ],
  },
  {
    id: 'mars',
    name: 'Mars & Kritik Anlar',
    icon: '🔥',
    phrases: [
      'Mars kapıda göründü, kaçış yok usta!',
      'Açık kapı bırakma demiştim sana!',
      'Bu oyun burada bitmez, son pula kadar!',
      'Mars kokusu geliyor Kapalıçarşı sokaklarından!',
    ],
  },
];

export interface ChatMessage {
  id: string;
  matchId: string;
  sender: 'player' | 'opponent' | 'system';
  senderName: string;
  avatar: string;
  phrase: string;
  categoryIcon?: string;
  timestamp: number;
}

export const OPPONENT_COFFEEHOUSE_REACTIONS: Record<string, { triggers: string[]; replies: string[] }> = {
  haci_dayi: {
    triggers: ['çay', 'kapı', 'zar', 'usta', 'mars'],
    replies: [
      'Sabret delikanlı, tavla sabır işidir.',
      'Kısmetten ötesi yok, zarın getirdiğini akıl götürür.',
      'Çayımızı yudumlayalım hele, asırlık çınar altında acale edilmez.',
      'Zar bir kere güler evlat, mühim olan o kapıyı tutmaktır.',
      'Bileğine kuvvet genç dostum, ama bu masada çok şampiyon gördük.',
    ],
  },
  mahmut_emmi: {
    triggers: ['çay', 'zar', 'mars', 'kapı', 'düşeş'],
    replies: [
      'Galata rüzgarı sert eser yeğenim, zarına mukayyet ol!',
      'Açık verme dedik sana, deniz de Galata da affetmez!',
      'Çaycııı! Genç arkadaşa bir demli çay daha ver, morali bozulmasın!',
      'Düşeş atmak marifet değil, fırtınada limana yanaşmak marifet.',
      'Deniz kurduyla tavla atıyorsun, dalgalara dikkat et!',
    ],
  },
  cayci_rustem: {
    triggers: ['çay', 'ocak', 'tavşan kanı', 'bardak'],
    replies: [
      'Tavşan kanı çayım taze, zarlarım da ateş gibi!',
      'Şakır şakır ses geldi, bu kapı Rüstem ustanındır!',
      'İnce belliyi masaya koydum, buyur hamleni yap usta!',
      'Çay kaşığını tıkırdatan maçı da alır!',
      'Demini almış çay gibisin delikanlı, kıvamın yerinde!',
    ],
  },
  genc_emre: {
    triggers: ['hızlı', 'mars', 'düşeş', 'tempo'],
    replies: [
      'Hızlı oynayalım usta, Boğaz havası gibi tempolu olsun!',
      'Düşeş geldi, arkasından el sallayabilirsin!',
      'Bu maç Boğaziçi manzarası gibi akıp gidecek!',
      'Gençlik aşısı vuruyoruz masaya, dikkat et!',
    ],
  },
  emekli_hoca: {
    triggers: ['usta', 'zar', 'kısmet', 'nezaket'],
    replies: [
      'Tavla bir hendese ve zeka imtihanıdır azizim.',
      'Fuzuli ne güzel demiş: Kısmetindir gezdiren yer yer seni.',
      'Nezaketiniz için müteşekkirim, lakin bu kapı müdafaasız kalmaz.',
      'Edebiyat ile tavla birdir; her pul bir kelime, her hamle bir mısra.',
    ],
  },
  usta_selim: {
    triggers: ['sedef', 'ağaç', 'kakma', 'kapı'],
    replies: [
      'Sedef işçiliği sabır ister, tavla da öyle evlat.',
      'Kırk yıllık Kapalıçarşı zanaatkarıyız, bu kapı kolay açılmaz.',
      'Ustalık zarda değil, pulun yerindedir delikanlı.',
    ],
  },
  beyoglu_centilmeni: {
    triggers: ['centilmen', 'akşam', 'pera', 'zar'],
    replies: [
      'Müsaadenizle bu zarı alıyorum aziz dostum.',
      'Pera akşamları bu oyunla ve nezaketinizle güzelleşir.',
      'Fevkalade zarif bir hamle, hürmetlerimi sunarım.',
    ],
  },
};
