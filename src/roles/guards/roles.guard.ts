import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleEnum } from "@prisma/client";
import { ExceptionMessages } from "../../constants/exception-messages";
import { UsersOnRolesService } from "../../users-on-roles/users-on-roles.service";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersOnRoles: UsersOnRolesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRoles = await this.usersOnRoles.getByUserId(user.id);

    if (userRoles) {
      return requiredRoles.some((item) => userRoles.includes(item));
    }

    throw new ForbiddenException(ExceptionMessages.Forbidden);
  }
}
