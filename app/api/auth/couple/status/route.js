import { getCoupleStatus } from '@/lib/auth/service';
import { fromService, requireUserId } from '../../_utils';

export async function GET(request) {
  const auth = requireUserId(request);
  if (auth.error) return auth.error;

  return fromService(getCoupleStatus(auth.userId), (result) => ({
    couple: result.couple,
    waitingForPartner: result.waitingForPartner,
  }));
}
