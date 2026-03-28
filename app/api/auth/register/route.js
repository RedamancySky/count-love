import { register } from '@/lib/auth/service';
import { fromService } from '../_utils';

export async function POST(request) {
  const body = await request.json();
  return fromService(register(body), (result) => ({
    message: result.message,
    user: result.user,
    debug: {
      verifyToken: result.verifyToken,
      emailPreview: result.emailPreview,
    },
  }));
}

