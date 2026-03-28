import { joinCoupleRoom } from '@/lib/auth/service';
import { fromService, requireUserId } from '../../_utils';

export async function POST(request) {
  const auth = requireUserId(request);
  if (auth.error) return auth.error;
  const body = await request.json();
  return fromService(joinCoupleRoom(auth.userId, body), (result) => ({ couple: result.couple }));
}

