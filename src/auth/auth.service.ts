import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";
import { TokensService } from "src/tokens/tokens.service";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../classes/jwt-payload";
import { AppRequest } from "../interfaces/app-request";
import { ExceptionMessages } from "../constants/exception-messages";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private configService: ConfigService
  ) {}

  async registration(req: AppRequest, createUserDto: CreateUserDto) {
    const user = await this.usersService.getUserByLogin(createUserDto.login);

    if (user) {
      throw new BadRequestException(
        ExceptionMessages.LoginAlreadyUsed(createUserDto.login)
      );
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 7);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newUser } = await this.usersService.createUser({
      ...createUserDto,
      password: hashPassword,
    });
    const payload = new JwtPayload(newUser);
    const tokens = this.tokensService.generateTokens(payload);

    await this.tokensService.createToken({
      refreshToken: tokens.refreshToken,
      userAgent: req.headers["user-agent"],
      userId: newUser.id,
    });

    return {
      user: {
        ...newUser,
      },
      ...tokens,
    };
  }

  async login(req: AppRequest) {
    const userAgent = req.headers["user-agent"];
    const payload = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.usersService.getUserById(
      payload.id
    );
    const tokens = this.tokensService.generateTokens(user);
    const sessions = await this.tokensService.findTokensByUserId(user.id);

    if (sessions.length < this.configService.get("maxSessionsPerAcc")) {
      await this.tokensService.createToken({
        refreshToken: tokens.refreshToken,
        userAgent: userAgent,
        userId: user.id,
      });
    } else {
      await this.tokensService.updateFirstByUserId(user.id, {
        refreshToken: tokens.refreshToken,
        userAgent,
      });
    }

    return {
      user: {
        ...user,
      },
      ...tokens,
    };
  }

  async refresh(req: AppRequest) {
    const oldToken = req.cookies["refreshToken"];
    const userAgent = req.headers["user-agent"];

    if (oldToken) {
      const session = await this.tokensService.findToken(oldToken);

      if (session) {
        const user = await this.usersService.getUserById(session.userId);
        const payload = new JwtPayload(user);
        const tokens = this.tokensService.generateTokens(payload);

        await this.tokensService.updateToken(oldToken, {
          refreshToken: tokens.refreshToken,
          userAgent,
        });

        return tokens;
      }
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async logout(refreshToken: string) {
    const session = await this.tokensService.findToken(refreshToken);

    if (session) {
      await this.tokensService.deleteToken(refreshToken);

      return {
        refreshToken: session.refreshToken,
      };
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async validateUser(login: string, password: string) {
    const user = await this.usersService.getUserByLogin(login);

    if (!user) {
      return null;
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);

    if (isPasswordEquals) {
      return new JwtPayload(user);
    }

    return null;
  }

  setCookie(res: Response, value: string) {
    res.cookie("refreshToken", value, {
      httpOnly: true,
      maxAge: this.configService.get("cookieAliveTime") * 24 * 60 * 60 * 1000,
      path: "auth",
    });
  }
}
