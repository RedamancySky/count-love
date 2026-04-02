export function verifyEmailTemplate(verifyUrl) {
  return {
    subject: "Xác nhận email của bạn — Count Love 💕",
    text: `Chào bạn, vui lòng xác nhận email qua link sau (hết hạn 24 giờ): ${verifyUrl}`,
  };
}

export function resetPasswordTemplate(resetUrl) {
  return {
    subject: "Đặt lại mật khẩu — Count Love",
    text: `Bạn vừa yêu cầu đặt lại mật khẩu. Link có hiệu lực 1 giờ: ${resetUrl}`,
  };
}

export function welcomeTemplate() {
  return {
    subject: "Chào mừng bạn đến với Count Love 💕",
    text: "Tài khoản của bạn đã được xác nhận. Bắt đầu onboarding ngay nhé!",
  };
}
