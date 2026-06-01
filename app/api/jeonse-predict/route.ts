import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.JEONSE_PREDICT_API ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail ?? '예측 API 오류' },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('Jeonse predict proxy error:', err);
    return NextResponse.json(
      { error: '전세 예측 서버에 연결할 수 없습니다.' },
      { status: 502 }
    );
  }
}
