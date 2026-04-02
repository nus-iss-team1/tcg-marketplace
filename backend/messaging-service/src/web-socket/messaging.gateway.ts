import { UseFilters, UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { WsCognitoAuthGuard } from "./ws-cognito-auth.guard";
import { AppLoggerService } from "../logger/logger.service";
import { MessageService } from "../message/message.service";
import { RoomService } from "../room/room.service";
import { WsCurrentUser } from "./ws-current-user.decorator";
import { SocketWithUser } from "./ws.type";
import { AllWsExceptionFilter } from "./ws-exception.filter";
import { JoinRoomDto, MessageSeenDto } from "../room/dto/room.dto";
import { RedisService } from "../redis/redis.service";
import { CreateMessageDto, DeleteMessageDto, EditMessageDto } from "../message/dto/message.dto";

@UseGuards(WsCognitoAuthGuard)
@WebSocketGateway()
@UseFilters(new AllWsExceptionFilter())
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly logger: AppLoggerService,
    private readonly redisService: RedisService,
    private readonly messageService: MessageService,
    private readonly roomService: RoomService
  ) {}

  async handleConnection(client: SocketWithUser) {
    const userId = client.data.user?.sub;

    if (!userId) {
      this.logger.warn("Unauthorized connection attempt");
      client.disconnect();
      return;
    }

    await this.redisService.addUserSocket(userId, client.id);
    await this.redisService.setOnline(userId);

    await client.join(`user:${userId}`);

    this.logger.log(`Client connected: ${userId}`);
  }

  async handleDisconnect(client: SocketWithUser) {
    const userId = client.data.user?.sub;

    if (!userId) {
      return;
    }

    await this.redisService.removeUserSocket(userId, client.id);

    const stillOnline = await this.redisService.hasActiveSockets(userId);

    if (!stillOnline) {
      await this.redisService.setOffline(userId);
    }

    this.logger.log(`Client disconnected: ${userId}`);
  }

  @SubscribeMessage("room:join")
  async joinRoom(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: JoinRoomDto
  ) {
    await client.join(`room:${body.conversationId}`);
    this.logger.log(`${userId} joined room: ${body.conversationId}`);
    return { joined: true };
  }

  @SubscribeMessage("room:seen")
  async messageSeen(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: MessageSeenDto
  ) {
    const result = await this.roomService.updateLastSeen(userId, body);

    return result;
  }

  @SubscribeMessage("room:archive")
  async archiveRoom(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: { conversationId: string }
  ) {
    const result = await this.roomService.archiveRoom(userId, body.conversationId);

    return result;
  }

  @SubscribeMessage("room:delete")
  async deleteRoom(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: { conversationId: string }
  ) {
    const result = await this.roomService.deleteRoom(userId, body.conversationId);

    await client.leave(`room:${body.conversationId}`);

    return result;
  }

  @SubscribeMessage("message:create")
  async createMessage(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: CreateMessageDto
  ) {
    const result = await this.messageService.createMessage(userId, body);

    await client.join(`room:${result.conversationId}`);

    this.server.to(`user:${body.recipientId}`).emit("message:new", result);
    this.server.to(`user:${userId}`).emit("message:new", result);

    return result;
  }

  @SubscribeMessage("message:update")
  async updateMessage(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: EditMessageDto
  ) {
    const result = await this.messageService.editMessage(userId, body);

    this.server.to(`room:${body.conversationId}`).emit("message:updated", result);

    return result;
  }

  @SubscribeMessage("message:delete")
  async deleteMessage(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() body: DeleteMessageDto
  ) {
    const result = await this.messageService.deleteMessage(userId, body);

    this.server.to(`room:${body.conversationId}`).emit("message:deleted", result);

    return result;
  }

  @SubscribeMessage("typing:start")
  async typingStart(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() { conversationId }: { conversationId: string }
  ) {
    await this.redisService.addTyping(conversationId, userId);

    this.server.to(`room:${conversationId}`).emit("typing", {
      userId: userId,
      typing: true
    });
    return { ok: true };
  }

  @SubscribeMessage("typing:stop")
  async typingStop(
    @WsCurrentUser("sub") userId: string,
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() { conversationId }: { conversationId: string }
  ) {
    await this.redisService.removeTyping(conversationId, userId);

    this.server.to(`room:${conversationId}`).emit("typing", {
      userId: userId,
      typing: false
    });
    return { ok: true };
  }
}
