export const SESSION_COOKIE = "aurora_session";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;
