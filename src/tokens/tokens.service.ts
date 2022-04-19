import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtPayload } from "../classes/jwt-payload";
import { CreateTokenDto } from "./dto/create-token.dto";
import { UpdateTokenDto } from "./dto/update-token.dto";

@Injectable()
export class TokensService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  generate(payload: JwtPayload) {
    payload = { ...payload };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `${this.configService.get("accessTokenAliveTime")}ms`,
        privateKey: this.configService.get("privateKey"),
        algorithm: "RS256",
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${this.configService.get("refreshTokenAliveTime")}ms`,
        privateKey: this.configService.get("privateKey"),
        algorithm: "RS256",
      }),
    };
  }

  async create(createTokenDto: CreateTokenDto) {
    return this.prisma.token.create({
      data: {
        ...createTokenDto,
      },
    });
  }

  async update(refreshToken: string, updateTokenDto: UpdateTokenDto) {
    return this.prisma.token.update({
      where: {
        refreshToken,
      },
      data: {
        ...updateTokenDto,
      },
    });
  }

  async updateFirstByUserId(userId: number, updateTokenDto: UpdateTokenDto) {
    const firstSession = await this.prisma.token.findFirst({
      where: {
        userId,
      },
    });

    return this.update(firstSession.refreshToken, updateTokenDto);
  }

  async delete(refreshToken: string) {
    return this.prisma.token.delete({
      where: {
        refreshToken,
      },
    });
  }

  async find(refreshToken: string) {
    return this.prisma.token.findUnique({
      where: {
        refreshToken,
      },
    });
  }

  async findAllByUserId(userId: number) {
    return this.prisma.token.findMany({
      where: {
        userId,
      },
    });
  }
}
