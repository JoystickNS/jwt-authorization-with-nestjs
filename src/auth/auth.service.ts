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
import { AppRequest } from "../interfaces/app-request.interface";
import { ExceptionMessages } from "../constants/exception-messages";
import { LoginDto } from "./dto/login.dto";
import { calcTokenLifeTime, refreshCookieOptions } from "../utils/utils";

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
    const user = await this.usersService.getByLogin(createUserDto.login);

    if (user) {
      throw new BadRequestException(
        ExceptionMessages.LoginAlreadyUsed(createUserDto.login)
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 7);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newUser } = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const payload = new JwtPayload(newUser);
    const generatedTokens = this.tokensService.generate(payload);
    const createdToken = await this.tokensService.create({
      refreshToken: generatedTokens.refreshToken,
      expires: calcTokenLifeTime(),
      userAgent: req.headers["user-agent"],
      userId: newUser.id,
    });

    this.setRefreshCookie(
      res,
      generatedTokens.refreshToken,
      createdToken.expires
    );

    return {
      user: {
        ...newUser,
      },
      ...generatedTokens,
    };
  }

  async login(req: AppRequest, res: Response, loginDto: LoginDto) {
    const userAgent = req.headers["user-agent"];
    const payload = req.user;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = await this.usersService.getById(payload.id);
    const generatedTokens = this.tokensService.generate(user);
    const memorizedTokens = await this.tokensService.getAllByUserId(user.id);
    const tokenOptions = {
      refreshToken: generatedTokens.refreshToken,
      expires: loginDto.rememberMe ? calcTokenLifeTime() : null,
      userAgent,
    };
    const isMaxMemorizedTokens =
      memorizedTokens.length === this.configService.get("maxMemorizedTokens");

    if (!loginDto.rememberMe || !isMaxMemorizedTokens) {
      await this.tokensService.create({
        ...tokenOptions,
        userId: user.id,
      });
    } else {
      await this.tokensService.updateFirstByUserId(user.id, {
        ...tokenOptions,
      });
    }

    this.setRefreshCookie(
      res,
      generatedTokens.refreshToken,
      loginDto.rememberMe ? calcTokenLifeTime() : null
    );

    return {
      user: {
        ...user,
      },
      ...generatedTokens,
    };
  }

  async me(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const token = await this.tokensService.getByRefreshToken(refreshToken);

    if (token) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...user } = await this.usersService.getById(
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
      const token = await this.tokensService.getByRefreshToken(oldRefreshToken);

      if (token) {
        const user = await this.usersService.getById(token.userId);
        const payload = new JwtPayload(user);
        const generatedTokens = this.tokensService.generate(payload);

        const updatedToken = await this.tokensService.update(oldRefreshToken, {
          refreshToken: generatedTokens.refreshToken,
          expires: token.expires ? calcTokenLifeTime() : null,
          userAgent,
        });

        this.setRefreshCookie(
          res,
          generatedTokens.refreshToken,
          updatedToken.expires
        );

        return generatedTokens;
      }
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async logout(req: AppRequest, res: Response) {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      throw new UnauthorizedException(ExceptionMessages.Unauthorized);
    }

    const token = await this.tokensService.getByRefreshToken(refreshToken);

    if (token) {
      await this.tokensService.delete(refreshToken);
      this.deleteRefreshCookie(res);
      return;
    }

    throw new UnauthorizedException(ExceptionMessages.Unauthorized);
  }

  async validateUser(login: string, password: string) {
    const user = await this.usersService.getByLogin(login);

    if (!user) {
      return null;
    }

    const isPasswordsEqual = await bcrypt.compare(password, user.password);

    if (isPasswordsEqual) {
      return new JwtPayload(user);
    }

    return null;
  }

  private setRefreshCookie(res: Response, value: string, expires: Date) {
    res.cookie("refreshToken", value, {
      ...refreshCookieOptions,
      expires: expires,
    });
  }

  private deleteRefreshCookie(res: Response) {
    res.clearCookie("refreshToken", {
      ...refreshCookieOptions,
      maxAge: 0,
    });
  }
}
