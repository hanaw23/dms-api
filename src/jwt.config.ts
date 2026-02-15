const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env file');
  }
  return secret;
};

const getJwtExpired = (): number => {
  const expired = Number(process.env.JWT_EXPIRED);
  if (isNaN(expired)) {
    return 86400;
  }
  return expired;
};

export const JwtConfig = {
  user_secret: getJwtSecret(),
  user_expired: getJwtExpired(),
};
