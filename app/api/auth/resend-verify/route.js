import { resendVerifyEmail } from '@/lib/auth/service';
import { fromService } from '../_utils';

export async function POST(request) {
  const body = await request.json();
  return fromService(resendVerifyEmail(body), (result) => ({
    message: result.message,
    debug: result.verifyToken ? { verifyToken: result.verifyToken, emailPreview: result.emailPreview } : undefined,
  }));
}
