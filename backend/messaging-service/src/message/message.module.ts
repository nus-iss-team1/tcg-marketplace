import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MessageRepository } from "./message.repository";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { RoomModule } from "../room/room.module";

@Module({
  imports: [ConfigModule, RoomModule],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository]
})
export class MessageModule {}
