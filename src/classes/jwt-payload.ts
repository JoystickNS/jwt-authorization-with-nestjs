export class JwtPayload {
  id: number;
  login: string;

  constructor(obj: Record<string, any>) {
    this.id = obj.id;
    this.login = obj.login;
  }
}
