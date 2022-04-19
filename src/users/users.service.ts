import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  async getById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: {
        login,
      },
    });
  }
}
