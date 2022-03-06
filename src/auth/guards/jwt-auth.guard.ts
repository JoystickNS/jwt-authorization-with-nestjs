import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { ExceptionMessages } from "../../constants/exception-messages";
import { WITHOUT_AUTH_KEY } from "../decorators/without-auth-key.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const withoutAuth = this.reflector.getAllAndOverride<boolean>(
      WITHOUT_AUTH_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (withoutAuth) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    return user;
  }
}
