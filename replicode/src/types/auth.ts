export type User = {
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
};

export type PendingSignup = {
  email: string;
  passwordHash: string;
  salt: string;
  otp: string;
  expiresAt: number;
};

export type PendingLogin = {
  email: string;
  otp: string;
  expiresAt: number;
};

export type Session = {
  email: string;
  createdAt: number;
};

export type PendingPayload = {
  email: string;
  passwordHash: string;
  salt: string;
  otp: string;
  expiresAt: number;
};
