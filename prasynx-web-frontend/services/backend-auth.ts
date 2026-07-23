interface LoginResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export async function loginWithBackend(
  role: 'student' | 'parent' | 'teacher' | 'recruiter' | 'admin',
  email: string,
  password: string
): Promise<{ data?: LoginResponse; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Invalid credentials' };
    return { data: { token: data.token, user: data.user } };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Connection failed' };
  }
}

export function storeSession(token: string, user: { id: string; full_name: string; email: string; role: string }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    'prasynx_session',
    JSON.stringify({ token, user, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  );
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('prasynx_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem('prasynx_session');
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('prasynx_session');
}
