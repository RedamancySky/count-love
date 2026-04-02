const store = {
  users: new Map(),
  usersByEmail: new Map(),
  oauthAccounts: new Map(),
  verifyTokens: new Map(),
  resetTokens: new Map(),
  couplesById: new Map(),
  couplesByCode: new Map(),
  sessionsByToken: new Map(),
};

let sequence = 0;

export function nextId(prefix) {
  sequence += 1;
  return `${prefix}_${Date.now()}_${sequence}`;
}

export function authStore() {
  return store;
}

export function resetAuthStore() {
  for (const value of Object.values(store)) {
    if (value instanceof Map) {
      value.clear();
    }
  }
  sequence = 0;
}
