import { resetPassword } from '@/lib/auth/service';
import { fromService } from '../_utils';

export async function POST(request) {
  const body = await request.json();
  return fromService(resetPassword(body), (result) => ({ message: result.message }));
}

