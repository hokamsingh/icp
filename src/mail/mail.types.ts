type VerificationCodeMailPayload = {
  username: string;
  code: string;
  expirationTime: string;
};

export type RegisterVerificationCodeMailTemplate = {
  name: 'register-verification-code';
  data: VerificationCodeMailPayload;
};

export type ResetPasswordVerificationCodeMailTemplate = {
  name: 'reset-password-verification-code';
  data: VerificationCodeMailPayload;
};

export type MailTemplate =
  | RegisterVerificationCodeMailTemplate
  | ResetPasswordVerificationCodeMailTemplate;

export type MailParams = { subject: string; template: MailTemplate };
