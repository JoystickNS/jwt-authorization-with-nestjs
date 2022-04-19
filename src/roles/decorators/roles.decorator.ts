import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";

export const ROLES_KEY = "ROLES_KEY";
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
