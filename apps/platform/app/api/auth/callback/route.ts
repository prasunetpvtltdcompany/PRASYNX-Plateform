import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')?.split('; ').map(c => {
              const [name, ...rest] = c.split('=');
              return { name, value: rest.join('=') };
            }) ?? [];
          },
          setAll() {},
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const roleDashboardMap: Record<string, string> = {
          student: '/student/dashboard',
          parent: '/parent/dashboard',
          teacher: '/staff/dashboard',
          institution: '/management/dashboard',
          recruiter: '/job-provider/dashboard',
          organization: '/organization/dashboard',
          admin: '/admin/dashboard',
        };

        const destination = profile?.role
          ? roleDashboardMap[profile.role] || '/student/dashboard'
          : '/student/dashboard';

        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/signin`);
}
