import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { playerRating, venue } = await req.json();

    // Pool of potential online players in historical Istanbul coffeehouses
    const potentialOpponents = [
      { id: 'usr_selim', name: 'Usta Selim', rating: 1780, title: 'Kapalıçarşı Piri', avatar: '/images/tavla_master.jpg', ping: 18 },
      { id: 'usr_haci', name: 'Hacı Dayı', rating: 1650, title: 'Çınaraltı Şampiyonu', avatar: '/images/tavla_master.jpg', ping: 24 },
      { id: 'usr_mahmut', name: 'Mahmut Emmi', rating: 1520, title: 'Galata Tavla Reisi', avatar: '/images/tavla_master.jpg', ping: 15 },
      { id: 'usr_emre', name: 'Genç Yetenek Emre', rating: 1340, title: 'Hızlı Zar', avatar: '/images/tavla_master.jpg', ping: 12 },
    ];

    // Find closest rating
    const targetRating = playerRating || 1200;
    const sorted = [...potentialOpponents].sort((a, b) => 
      Math.abs(a.rating - targetRating) - Math.abs(b.rating - targetRating)
    );

    const opponent = sorted[0] || potentialOpponents[0];

    return NextResponse.json({
      matchFound: true,
      roomId: 'room_' + Math.random().toString(36).substring(2, 8),
      opponent,
      serverRegion: 'IST - Cloudflare Edge Istanbul',
      latencyMs: opponent.ping,
      venue: venue || 'Tarihi Çınaraltı Kahvesi',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Matchmaking failed', details: String(err) }, { status: 500 });
  }
}
