import { DiceCallout } from './types';

// Traditional Turkish/Ottoman Tavla Dice Names & Rhymes
export const DICE_CALLOUTS: Record<string, { name: string; rhyme?: string }> = {
  // Çiftler (Doubles)
  '1-1': { name: 'Hep Yek', rhyme: 'Zarın atası, aceminin belası' },
  '2-2': { name: 'Dü Bara', rhyme: 'Kaldı bahtım kara' },
  '3-3': { name: 'Dü Se', rhyme: 'Zar geldi tersine' },
  '4-4': { name: 'Dört Cihar', rhyme: 'Tavlayı yıkar' },
  '5-5': { name: 'Dü Beş', rhyme: 'Oyuna güneş' },
  '6-6': { name: 'Düşeş', rhyme: 'Ustanın yüzü güler, rakip marsı bekler!' },

  // Karışık zarlar (Ordered max first)
  '2-1': { name: 'Yek-i Dü', rhyme: 'Aceminin gülü' },
  '3-1': { name: 'Se-i Yek', rhyme: 'Tahtayı beklet' },
  '3-2': { name: 'Seba-i Dü', rhyme: 'Aç kapıyı gir içeri' },
  '4-1': { name: 'Cihar-ı Yek', rhyme: 'Bir adım tek' },
  '4-2': { name: 'Cihar-ı Dü', rhyme: 'Yürüdü gitti' },
  '4-3': { name: 'Cihar-ü Se', rhyme: 'Dosta sefa' },
  '5-1': { name: 'Penc-ü Yek', rhyme: 'Kaldın tek' },
  '5-2': { name: 'Penc-ü Dü', rhyme: 'Yetişti yardım' },
  '5-3': { name: 'Penc-ü Se', rhyme: 'Severler güzeli penc-ü se!' },
  '5-4': { name: 'Penc-ü Cihar', rhyme: 'Gönül fetheder' },
  '6-1': { name: 'Şeş-ü Yek', rhyme: 'Kaçar gelir tek' },
  '6-2': { name: 'Şeş-ü Dü', rhyme: 'Uzak yollar bitti' },
  '6-3': { name: 'Şeş-ü Se', rhyme: 'Kapı kapandı güle güle' },
  '6-4': { name: 'Şeş-ü Cihar', rhyme: 'Bozuldu firar' },
  '6-5': { name: 'Şeş-i Beş', rhyme: 'Kapıya yerleş' },
};

export function getDiceCallout(d1: number, d2: number): DiceCallout {
  const high = Math.max(d1, d2);
  const low = Math.min(d1, d2);
  const key = `${high}-${low}`;
  const info = DICE_CALLOUTS[key] || { name: `${high} ve ${low}` };
  return {
    name: info.name,
    rhyme: info.rhyme,
    d1,
    d2,
  };
}
