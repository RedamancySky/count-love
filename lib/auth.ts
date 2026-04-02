export const authConfig = {
  providers: {
    google: 'enabled_via_/api/auth/oauth',
    facebook: 'enabled_via_/api/auth/oauth',
    credentials: 'enabled_via_/api/auth/login',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
