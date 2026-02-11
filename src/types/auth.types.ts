export interface Jwtpayload {
  id: string;
  roles: "user" | "lender" | "admin";
  iat: number;
  exp?: number;
}
