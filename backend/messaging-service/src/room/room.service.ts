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
    const room = await this.getRoom(userId, params.conversationId);

    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    const lastSeenMessageId = room.lastSeenMessageId ?? "";

    // if lastSeenMessageId is earlier, update the room
    if (lastSeenMessageId.toUpperCase() < params.messageId.toUpperCase()) {
      return await this.roomRepository.updateLastSeen(
        userId,
        params.conversationId,
        params.messageId
      );
    } else {
      return await this.roomRepository.queryRooms(userId);
    }
  }

  async archiveRoom(userId: string, conversationId: string) {
    const room = await this.getRoom(userId, conversationId);

    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    return await this.roomRepository.archiveRoom(userId, conversationId);
  }

  async deleteRoom(userId: string, conversationId: string) {
    const room = await this.getRoom(userId, conversationId);

    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    return await this.roomRepository.deleteRoom(userId, conversationId);
  }

  getCreateRoomScript(
    conversationId: string,
    userId: string,
    recipientId: string,
    datetime: number,
    userName?: string,
    recipientName?: string,
    messageId?: string,
    content?: string
  ) {
    return [
      this.roomRepository.buildCreateRoom(conversationId, userId, recipientId, datetime, userName, recipientName, messageId, userId, content),
      this.roomRepository.buildCreateRoom(conversationId, recipientId, userId, datetime, recipientName, userName, messageId, userId, content)
    ];
  }

  getUpdateLatestMessageScript(
    conversationId: string,
    userId: string,
    recipientId: string,
    messageId: string,
    senderId: string,
    content: string,
    datetime: number
  ) {
    return [
      this.roomRepository.buildUpdateLatestMessage(
        conversationId,
        userId,
        messageId,
        senderId,
        content,
        datetime
      ),
      this.roomRepository.buildUpdateLatestMessage(
        conversationId,
        recipientId,
        messageId,
        senderId,
        content,
        datetime
      )
    ];
  }
}
