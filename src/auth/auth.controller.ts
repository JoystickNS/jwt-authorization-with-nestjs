import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AppRequest } from "../interfaces/app-request";
import { AuthService } from "./auth.service";
import { withoutAuthKey } from "./decorators/without-auth-key.decorator";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("registration")
  @withoutAuthKey()
  async registration(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto
  ) {
    const newUser = await this.authService.registration(req, createUserDto);

    this.authService.setCookie(res, newUser.refreshToken);

    return newUser;
  }

  @Post("login")
  @withoutAuthKey()
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.authService.login(req);

    this.authService.setCookie(res, user.refreshToken);

    return user;
  }

  @Put("refresh")
  @withoutAuthKey()
  async refresh(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.refresh(req);

    this.authService.setCookie(res, tokens.refreshToken);

    return tokens;
  }

  @Delete("logout")
  @withoutAuthKey()
  async logout(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const token = await this.authService.logout(req.cookies["refreshToken"]);

    res.clearCookie("refreshToken");

    return token;
  }
}
