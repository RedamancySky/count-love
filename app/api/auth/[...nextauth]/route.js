import { oauthNotReady } from '@/lib/auth/service';

export async function GET() {
  return Response.json(
    {
      message: 'Use /api/auth/login for credentials and /api/auth/oauth for OAuth simulation in this scaffold.',
      providers: {
        google: oauthNotReady('google'),
        facebook: oauthNotReady('facebook'),
      },
    },
    { status: 501 },
  );
}

export const POST = GET;
