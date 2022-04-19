import { Controller, Get, Param } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { Roles } from "../roles/decorators/roles.decorator";
import { UsersOnRolesService } from "./users-on-roles.service";

@Roles(RoleEnum.admin)
@Controller("users-on-role")
export class UsersOnRolesController {
  constructor(private readonly usersOnRolesService: UsersOnRolesService) {}

  @Get()
  async getAll() {
    return this.usersOnRolesService.getAll();
  }

  @Get(":id")
  async getById(@Param("id") id: number) {
    return this.usersOnRolesService.getByUserId(id);
  }
}
