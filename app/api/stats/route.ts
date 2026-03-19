import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/stats?id=eq.global&select=downloads_count`,
      { headers, next: { revalidate: 60 } }
    );
    const data = await res.json();
    return NextResponse.json({ count: data[0]?.downloads_count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_downloads`, {
      method: 'POST',
      headers,
      body: '{}',
    });
    const count = await res.json();
    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
