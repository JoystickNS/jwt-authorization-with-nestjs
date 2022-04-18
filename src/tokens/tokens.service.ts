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

  generateTokens(payload: JwtPayload) {
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

  async createToken(createTokenDto: CreateTokenDto) {
    return this.prisma.token.create({
      data: {
        ...createTokenDto,
      },
    });
  }

  async updateToken(oldToken: string, updateTokenDto: UpdateTokenDto) {
    return this.prisma.token.update({
      where: {
        refreshToken: oldToken,
      },
      data: {
        ...updateTokenDto,
      },
    });
  }

  async updateFirstByUserId(userId: number, updateTokenDto: UpdateTokenDto) {
    const firstSession = await this.prisma.token.findFirst({
      where: {
        userId: userId,
      },
    });

    return this.updateToken(firstSession.refreshToken, updateTokenDto);
  }

  async deleteToken(refreshToken: string) {
    return this.prisma.token.delete({
      where: {
        refreshToken,
      },
    });
  }

  async findToken(refreshToken: string) {
    return this.prisma.token.findUnique({
      where: {
        refreshToken,
      },
    });
  }

  async findTokensByUserId(userId: number) {
    return this.prisma.token.findMany({
      where: {
        userId,
      },
    });
  }
}
