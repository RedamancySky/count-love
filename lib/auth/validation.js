function emailOk(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function httpUrlOk(value) {
  return /^https?:\/\/.+/i.test(value);
}

function dataImageOk(value) {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value);
}

export function validateRegisterInput(payload) {
  const errors = {};
  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");
  const confirmPassword = String(payload?.confirmPassword ?? "");

  if (name.length < 2 || name.length > 50) {
    errors.name = "Ho ten phai tu 2 den 50 ky tu.";
  }
  if (!emailOk(email)) {
    errors.email = "Email khong dung dinh dang.";
  }
  if (password.length < 8) {
    errors.password = "Mat khau toi thieu 8 ky tu.";
  } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = "Mat khau phai co chu hoa, chu thuong va so.";
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Mat khau xac nhan khong khop.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: { name, email, password },
  };
}

export function validateLoginInput(payload) {
  const errors = {};
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");
  const rememberMe = Boolean(payload?.rememberMe);

  if (!emailOk(email)) {
    errors.email = "Email khong dung dinh dang.";
  }
  if (!password) {
    errors.password = "Vui long nhap mat khau.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: { email, password, rememberMe },
  };
}

export function validateForgotPasswordInput(payload) {
  const errors = {};
  const email = String(payload?.email ?? "").trim().toLowerCase();
  if (!emailOk(email)) {
    errors.email = "Email khong dung dinh dang.";
  }
  return { isValid: Object.keys(errors).length === 0, errors, value: { email } };
}

export function validateResetPasswordInput(payload) {
  const errors = {};
  const token = String(payload?.token ?? "");
  const password = String(payload?.password ?? "");
  const confirmPassword = String(payload?.confirmPassword ?? "");

  if (!token) {
    errors.token = "Token khong hop le.";
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = "Mat khau phai co it nhat 8 ky tu, gom chu hoa, chu thuong va so.";
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = "Mat khau xac nhan khong khop.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: { token, password },
  };
}

export function validateCoupleCode(payload) {
  const errors = {};
  const code = String(payload?.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    errors.code = "Ma phai gom dung 6 ky tu chu/so.";
  }
  return { isValid: Object.keys(errors).length === 0, errors, value: { code } };
}

export function validateOauthInput(payload) {
  const errors = {};
  const provider = String(payload?.provider ?? "")
    .trim()
    .toLowerCase();
  const email = payload?.email == null ? "" : String(payload.email).trim().toLowerCase();
  const name = payload?.name == null ? undefined : String(payload.name).trim();
  const rememberMe = Boolean(payload?.rememberMe);
  const providerAccountId = payload?.providerAccountId == null ? `${provider}:${email || "anonymous"}` : String(payload.providerAccountId).trim();

  if (!["google", "facebook"].includes(provider)) {
    errors.provider = "OAuth provider khong hop le.";
  }
  if (email && !emailOk(email)) {
    errors.email = "Email khong dung dinh dang.";
  }
  if (name != null && name.length > 50) {
    errors.name = "Ten toi da 50 ky tu.";
  }
  if (!providerAccountId) {
    errors.providerAccountId = "providerAccountId khong hop le.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: { provider, email, name, providerAccountId, rememberMe },
  };
}

export function validateOnboardingPayload(payload) {
  const errors = {};
  const nickname = payload?.nickname == null ? undefined : String(payload.nickname).trim();
  const birthDate = payload?.birthDate ? new Date(payload.birthDate) : undefined;
  const bio = payload?.bio == null ? undefined : String(payload.bio);
  const avatar = payload?.avatar == null ? undefined : String(payload.avatar).trim();
  const startDate = payload?.startDate ? new Date(payload.startDate) : undefined;
  const themeName = payload?.themeName == null ? undefined : String(payload.themeName);
  const coupleTitle = payload?.coupleTitle == null ? undefined : String(payload.coupleTitle);
  const step = payload?.step == null ? undefined : Number(payload.step);

  if (nickname != null && !nickname) errors.nickname = "Ten hien thi la bat buoc.";
  if (bio != null && bio.length > 150) errors.bio = "Bio toi da 150 ky tu.";
  if (birthDate != null && Number.isNaN(birthDate.valueOf())) errors.birthDate = "Ngay sinh khong hop le.";
  if (birthDate != null && birthDate > new Date()) errors.birthDate = "Ngay sinh khong duoc o tuong lai.";
  if (avatar != null && avatar && !httpUrlOk(avatar) && !dataImageOk(avatar)) errors.avatar = "Avatar phai la URL hop le hoac data image.";
  if (startDate != null && Number.isNaN(startDate.valueOf())) errors.startDate = "Ngay bat dau khong hop le.";
  if (startDate != null && startDate > new Date()) errors.startDate = "Ngay bat dau khong duoc o tuong lai.";
  if (themeName != null && themeName.length > 40) errors.themeName = "Theme name toi da 40 ky tu.";
  if (coupleTitle != null && coupleTitle.length > 80) errors.coupleTitle = "Couple title toi da 80 ky tu.";
  if (step != null && (!Number.isInteger(step) || step < 1 || step > 6)) errors.step = "Step phai tu 1 toi 6.";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: { nickname, birthDate, bio, avatar, startDate, themeName, coupleTitle, step },
  };
}
