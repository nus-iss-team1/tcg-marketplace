import { Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { RoomService } from "./room.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { MessageSeenDto } from "./dto/room.dto";

@Controller("rooms")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRooms(@CurrentUser("sub") userId: string) {
    return await this.roomService.queryRooms(userId);
  }

  @Get(":conversationId")
  async getRoom(
    @CurrentUser("sub") userId: string,
    @Param("conversationId") conversationId: string
  ) {
    return await this.roomService.getRoom(userId, conversationId);
  }

  @Patch(":conversationId/:messageId")
  async updateLastSeen(@CurrentUser("sub") userId: string, @Param() params: MessageSeenDto) {
    return await this.roomService.updateLastSeen(userId, params);
  }

  @Patch(":conversationId/archive")
  async archiveRoom(
    @CurrentUser("sub") userId: string,
    @Param("conversationId") conversationId: string
  ) {
    return await this.roomService.archiveRoom(userId, conversationId);
  }

  @Delete(":conversationId")
  async deleteRoom(
    @CurrentUser("sub") userId: string,
    @Param("conversationId") conversationId: string
  ) {
    return await this.roomService.deleteRoom(userId, conversationId);
  }
}
