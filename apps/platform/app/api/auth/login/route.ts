import { NextRequest, NextResponse } from 'next/server';

const BACKENDS: Record<string, string> = {
  admin: process.env.NEXT_PUBLIC_BACKEND_ADMIN || 'http://localhost:4001/api/v2/admin/login',
  management: process.env.NEXT_PUBLIC_BACKEND_MANAGEMENT || 'http://localhost:4002/api/v2/auth/login',
  teacher: process.env.NEXT_PUBLIC_BACKEND_TEACHER || 'http://localhost:4003/api/v2/auth/login',
  student: process.env.NEXT_PUBLIC_BACKEND_STUDENT || 'http://localhost:4004/api/v2/auth/login',
  parent: process.env.NEXT_PUBLIC_BACKEND_PARENT || 'http://localhost:4005/api/v2/auth/login',
};

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    const url = BACKENDS[role];
    if (!url) {
      return NextResponse.json({ error: `Unknown role: ${role}` }, { status: 400 });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Invalid credentials' },
        { status: res.status }
      );
    }

    // Normalize response format
    if (role === 'admin') {
      return NextResponse.json({ token: 'authenticated', user: data.user });
    }
    return NextResponse.json({ token: data.data?.token, user: data.data?.user });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Connection failed' },
      { status: 500 }
    );
  }
}
