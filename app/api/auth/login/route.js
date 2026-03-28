import { login } from '@/lib/auth/service';
import { fromService, setAuthCookies } from '../_utils';

export async function POST(request) {
  const body = await request.json();
  const result = login(body);
  if (!result.ok) {
    return fromService(result);
  }

  const response = Response.json(
    {
      message: result.message,
      user: result.user,
      debug: { sessionToken: result.sessionToken, expiresAt: result.expiresAt },
    },
    { status: result.status },
  );

  return setAuthCookies(response, result);
}
