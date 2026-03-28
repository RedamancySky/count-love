import { createCoupleRoom } from '@/lib/auth/service';
import { fromService, requireUserId } from '../../_utils';

export async function POST(request) {
  const auth = requireUserId(request);
  if (auth.error) return auth.error;
  return fromService(createCoupleRoom(auth.userId), (result) => ({ couple: result.couple }));
}

