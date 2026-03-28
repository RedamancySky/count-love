import { patchOnboarding } from '@/lib/auth/service';
import { fromService, requireUserId } from '../_utils';

export async function PATCH(request) {
  const auth = requireUserId(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const result = patchOnboarding(auth.userId, body);
  if (!result.ok) return fromService(result);

  const response = Response.json(
    {
      message: result.message,
      user: result.user,
      couple: result.couple,
    },
    { status: result.status },
  );

  response.headers.append(
    'Set-Cookie',
    `countlove_onboarding_completed=${result.user.onboardingCompleted ? 'true' : 'false'}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
  );

  return response;
}
