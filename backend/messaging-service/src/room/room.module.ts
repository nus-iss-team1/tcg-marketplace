import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RoomRepository } from "./room.repository";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";

@Module({
  imports: [ConfigModule],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository],
  exports: [RoomService]
})
export class RoomModule {}
