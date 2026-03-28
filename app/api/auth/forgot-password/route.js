import { forgotPassword } from '@/lib/auth/service';
import { fromService } from '../_utils';

export async function POST(request) {
  const body = await request.json();
  return fromService(forgotPassword(body), (result) => ({
    message: result.message,
    debug: result.resetToken ? { resetToken: result.resetToken, emailPreview: result.emailPreview } : undefined,
  }));
}

