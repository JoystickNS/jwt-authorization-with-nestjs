import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AppRequest } from "../interfaces/app-request.interface";
import { AuthService } from "./auth.service";
import { withoutAuthKey } from "./decorators/without-auth-key.decorator";
import { LoginDto } from "./dto/login.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@withoutAuthKey()
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("registration")
  async registration(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() createUserDto: CreateUserDto
  ) {
    return this.authService.registration(req, res, createUserDto);
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto
  ) {
    return this.authService.login(req, res, loginDto);
  }

  @Get("me")
  async me(@Req() req: AppRequest) {
    return this.authService.me(req.cookies["refreshToken"]);
  }

  @Put("refresh")
  async refresh(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refresh(req, res);
  }

  @Delete("logout")
  async logout(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(req, res);
  }
}
