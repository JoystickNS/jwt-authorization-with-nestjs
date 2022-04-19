import { Module } from "@nestjs/common";
import { UsersOnRolesService } from "./users-on-roles.service";
import { UsersOnRolesController } from "./users-on-roles.controller";
import { RolesModule } from "../roles/roles.module";

@Module({
  controllers: [UsersOnRolesController],
  providers: [UsersOnRolesService],
  exports: [UsersOnRolesService],
  imports: [RolesModule],
})
export class UsersOnRolesModule {}
