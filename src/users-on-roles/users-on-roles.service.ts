import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RolesService } from "../roles/roles.service";

@Injectable()
export class UsersOnRolesService {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService
  ) {}

  async getAll() {
    return this.prisma.usersOnRoles.findMany();
  }

  async getByUserId(userId: number) {
    const roleIds = await this.prisma.usersOnRoles.findMany({
      where: {
        userId,
      },
      select: {
        roleId: true,
      },
    });

    return Promise.all(
      roleIds.map((item) => this.rolesService.getById(item.roleId))
    );
  }
}
