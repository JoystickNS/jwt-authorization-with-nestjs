import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getById(id: number) {
    const role = await this.prisma.role.findUnique({
      where: {
        id,
      },
    });

    return role.role;
  }
}
