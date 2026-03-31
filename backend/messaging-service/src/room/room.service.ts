import { ForbiddenException, Injectable } from "@nestjs/common";
import { RoomRepository } from "./room.repository";
import { MessageSeenDto } from "./dto/room.dto";

@Injectable()
export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  async queryRooms(userId: string) {
    return await this.roomRepository.queryRooms(userId);
  }

  async getRoom(userId: string, conversationId: string) {
    return await this.roomRepository.getRoom(userId, conversationId);
  }

  async updateLastSeen(userId: string, params: MessageSeenDto) {
    return await this.roomRepository.updateLastSeen(
      userId,
      params.conversationId,
      params.messageId
    );
  }

  async archiveRoom(userId: string, conversationId: string) {
    const room = await this.getRoom(userId, conversationId);

    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    return await this.roomRepository.archiveRoom(conversationId, userId);
  }

  async deleteRoom(userId: string, conversationId: string) {
    const room = await this.getRoom(userId, conversationId);

    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    return await this.roomRepository.deleteRoom(conversationId, userId);
  }

  getCreateRoomScript(
    conversationId: string,
    userId: string,
    recipientId: string,
    datetime: number
  ) {
    return [
      this.roomRepository.buildCreateRoom(conversationId, userId, recipientId, datetime),
      this.roomRepository.buildCreateRoom(conversationId, recipientId, userId, datetime)
    ];
  }

  getUpdateLatestMessageScript(
    conversationId: string,
    userId: string,
    recipientId: string,
    messageId: string,
    content: string,
    datetime?: number
  ) {
    return [
      this.roomRepository.buildUpdateLatestMessage(
        conversationId,
        userId,
        messageId,
        content,
        datetime
      ),
      this.roomRepository.buildUpdateLatestMessage(
        conversationId,
        recipientId,
        messageId,
        content,
        datetime
      )
    ];
  }
}
