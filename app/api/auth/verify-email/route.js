import { verifyEmail } from '@/lib/auth/service';
import { fromService } from '../_utils';

export async function GET(request) {
  const token = new URL(request.url).searchParams.get('token');
  return fromService(verifyEmail(token), (result) => ({ message: result.message, user: result.user }));
}

