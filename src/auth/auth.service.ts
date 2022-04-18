import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";
import { TokensService } from "src/tokens/tokens.service";
import { CookieOptions, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../classes/jwt-payload";
import { AppRequest } from "../interfaces/app-request.interface";
import { ExceptionMessages } from "../constants/exception-messages";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private configService: ConfigService
  ) {}

  async registration(
    req: AppRequest,
    res: Response,
    createUserDto: CreateUserDto
  ) {
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
      rememberMe: true,
      userAgent: req.headers["user-agent"],
      userId: newUser.id,
    });

    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      user: {
        ...newUser,
      },
      ...tokens,
    };
  }

  async login(req: AppRequest, res: Response, loginDto: LoginDto) {
    const userAgent = req.headers["user-agent"];
    const payload = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.usersService.getUserById(
      payload.id
    );
    const tokens = this.tokensService.generateTokens(user);
    const sessions = await this.tokensService.findTokensByUserId(user.id);
    const tokenOptions = {
      refreshToken: tokens.refreshToken,
      expires: loginDto.rememberMe
        ? new Date(Date.now() + this.configService.get("refreshTokenAliveTime"))
        : null,
      rememberMe: loginDto.rememberMe,
      userAgent,
    };

    if (sessions.length < this.configService.get("maxSessionsPerAcc")) {
      await this.tokensService.createToken({
        ...tokenOptions,
        userId: user.id,
      });
    } else {
      await this.tokensService.updateFirstByUserId(user.id, {
        ...tokenOptions,
      });
    }

    this.setRefreshCookie(res, tokens.refreshToken, loginDto.rememberMe);

    return {
      user: {
        ...user,
      },
      ...tokens,
    };
  }

  async me(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const token = await this.tokensService.findToken(refreshToken);

    if (token) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.usersService.getUserById(
        token.userId
      );
      return user;
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async refresh(req: AppRequest, res: Response) {
    const oldRefreshToken = req.cookies["refreshToken"];

    if (!oldRefreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const userAgent = req.headers["user-agent"];

    if (oldRefreshToken) {
      const session = await this.tokensService.findToken(oldRefreshToken);

      if (session) {
        const user = await this.usersService.getUserById(session.userId);
        const payload = new JwtPayload(user);
        const tokens = this.tokensService.generateTokens(payload);

        const updatedToken = await this.tokensService.updateToken(
          oldRefreshToken,
          {
            refreshToken: tokens.refreshToken,
            expires: session.rememberMe
              ? new Date(
                  Date.now() + this.configService.get("refreshTokenAliveTime")
                )
              : null,
            userAgent,
          }
        );

        this.setRefreshCookie(
          res,
          tokens.refreshToken,
          updatedToken.rememberMe
        );

        return tokens;
      }
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async logout(req: AppRequest, res: Response) {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const session = await this.tokensService.findToken(refreshToken);

    if (session) {
      await this.tokensService.deleteToken(refreshToken);
      this.deleteRefreshCookie(res);
      return;
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

  private setRefreshCookie(res: Response, value: string, rememberMe = true) {
    res.cookie("refreshToken", value, {
      ...refreshCookieOptions,
      expires: rememberMe
        ? new Date(Date.now() + this.configService.get("refreshTokenAliveTime"))
        : null,
    });
  }

  private deleteRefreshCookie(res: Response) {
    res.clearCookie("refreshToken", {
      ...refreshCookieOptions,
      maxAge: 0,
    });
  }
}

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "auth",
};
