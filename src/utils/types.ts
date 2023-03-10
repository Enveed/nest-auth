export type UserAuthParams = {
  email: string;
  password: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};
