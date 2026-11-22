export interface AccessTokenPayload {
  sub: string; // user id
  tv: number; // user.tokenVersion at issue time
  typ: 'access';
}

export interface AuthenticatedUser {
  id: string;
  roles: string[];
  permissions: string[];
}
