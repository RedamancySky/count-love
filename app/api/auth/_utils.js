function jsonError(status, code, message, details) {
  return Response.json({ error: { code, message, details } }, { status });
}

export function fromService(result, successPayload = null) {
  if (!result.ok) {
    if (result.code === "VALIDATION_ERROR") {
      return jsonError(result.status, result.code, "Du lieu khong hop le.", result.details);
    }
    return jsonError(result.status, result.code ?? "ERROR", result.message ?? "Loi khong xac dinh");
  }
  return Response.json(successPayload ? successPayload(result) : result, { status: result.status });
}

export function requireUserId(request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return { error: jsonError(401, "UNAUTHORIZED", "Thieu x-user-id header (mock auth).") };
  }
  return { userId };
}

export function setAuthCookies(response, authResult) {
  const maxAgeSeconds = Math.max(1, Math.floor((authResult.expiresAt - Date.now()) / 1000));
  const onboardingDone = authResult.user?.onboardingCompleted ? "true" : "false";

  response.headers.append(
    "Set-Cookie",
    `countlove_session=${authResult.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`,
  );
  response.headers.append(
    "Set-Cookie",
    `countlove_onboarding_completed=${onboardingDone}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`,
  );

  return response;
}
