import { getAccessToken } from "@/lib/cognito";
import { io, Socket } from "socket.io-client";

const BASE_URL = "";
const WS_URL =
  process.env.NEXT_PUBLIC_MESSAGING_API ||
  process.env.NEXT_PUBLIC_BACKEND_API ||
  "http://localhost:3002";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Types ── */

export interface Room {
  conversationId: string;
  meta: string;
  userId: string;
  recipientId: string;
  userName?: string;
  recipientName?: string;
  latestMessage: string;
  latestMessageSenderId?: string;
  latestMessageId: string | null;
  lastSeenMessageId: string | null;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  updatedAt: number;
}

export type MessageType = "text" | "image" | "video" | "file" | "sticker";

export interface Message {
  conversationId: string;
  meta: string;
  messageId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  version: number;
  reaction: Record<string, string[]>;
  replyTo: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FetchMessagesResponse {
  data: Message[];
  nextCursor: string | null;
}

export interface CreateMessageBody {
  recipientId: string;
  content: string;
  messageType: MessageType;
  replyTo?: string;
}

export interface EditMessageBody {
  conversationId: string;
  messageId: string;
  content: string;
}

export interface DeleteMessageBody {
  conversationId: string;
  messageId: string;
}

export interface DeleteMessageResponse {
  conversationId: string;
  messageId: string;
  message: string;
}

export interface TypingEvent {
  userId: string;
  typing: boolean;
}

/* ── Messaging Client ── */

export class MessagingClient {
  private socket: Socket | null = null;
  private connectPromise: Promise<void> | null = null;

  /* ── Connection ── */

  /**
   * Creates the socket (synchronously) and returns a promise that resolves
   * once the connection is established. Listeners can be attached immediately
   * after calling init() — they bind to the socket before it connects.
   */
  init(token: string): void {
    if (this.socket) return;

    console.debug("[MessagingClient] creating socket to", WS_URL);

    this.socket = io(WS_URL, {
      path: "/ws",
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: false,
    });

    this.socket.onAny((event, ...args) => {
      console.debug("[MessagingClient] event:", event, args);
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      console.debug("[MessagingClient] reconnect attempt", attempt);
    });

    this.socket.on("reconnect", (attempt) => {
      console.debug("[MessagingClient] reconnected after", attempt, "attempts");
    });

    this.socket.on("reconnect_error", (err) => {
      console.warn("[MessagingClient] reconnect error:", err.message);
    });
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.debug("[MessagingClient] already connected, skipping");
      return;
    }

    // If no socket yet, create one (backward compat)
    if (!this.socket) {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      this.init(token);
    }

    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.socket!.on("connect", () => {
        console.debug("[MessagingClient] connected, id:", this.socket!.id);
        resolve();
      });
      this.socket!.on("connect_error", (err) => {
        console.error("[MessagingClient] connect error:", err.message);
        reject(err);
      });
    });

    this.socket!.connect();
    return this.connectPromise;
  }

  disconnect(): void {
    console.debug("[MessagingClient] disconnecting");
    this.socket?.disconnect();
    this.socket = null;
    this.connectPromise = null;
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  /* ── Socket Event Listeners ── */
  /* Safe to call before connect() — they attach to the socket created by init() */

  onNewMessage(handler: (message: Message) => void): () => void {
    this.socket?.on("message:new", handler);
    return () => { this.socket?.off("message:new", handler); };
  }

  onMessageUpdated(handler: (message: Message) => void): () => void {
    this.socket?.on("message:updated", handler);
    return () => { this.socket?.off("message:updated", handler); };
  }

  onMessageDeleted(handler: (data: DeleteMessageResponse) => void): () => void {
    this.socket?.on("message:deleted", handler);
    return () => { this.socket?.off("message:deleted", handler); };
  }

  onTyping(handler: (event: TypingEvent) => void): () => void {
    this.socket?.on("typing", handler);
    return () => { this.socket?.off("typing", handler); };
  }

  onDisconnect(handler: (reason: string) => void): () => void {
    this.socket?.on("disconnect", handler);
    return () => { this.socket?.off("disconnect", handler); };
  }

  /* ── Socket Emitters ── */

  async joinRoom(conversationId: string): Promise<void> {
    await this.waitForConnection();
    this.socket!.emit("room:join", { conversationId });
  }

  async sendMessage(body: CreateMessageBody): Promise<Message> {
    await this.waitForConnection();
    return this.emit<Message>("message:create", body);
  }

  async editMessageRealtime(body: EditMessageBody): Promise<Message> {
    await this.waitForConnection();
    return this.emit<Message>("message:update", body);
  }

  async deleteMessageRealtime(body: DeleteMessageBody): Promise<DeleteMessageResponse> {
    await this.waitForConnection();
    return this.emit<DeleteMessageResponse>("message:delete", body);
  }

  async markSeenRealtime(conversationId: string, messageId: string): Promise<void> {
    await this.waitForConnection();
    this.socket!.emit("room:seen", { conversationId, messageId });
  }

  async archiveRoomRealtime(conversationId: string): Promise<void> {
    this.socket?.emit("room:archive", { conversationId });
  }

  async deleteRoomRealtime(conversationId: string): Promise<void> {
    this.socket?.emit("room:delete", { conversationId });
  }

  startTyping(conversationId: string): void {
    this.socket?.emit("typing:start", { conversationId });
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit("typing:stop", { conversationId });
  }

  /* ── REST APIs (Room) ── */

  async fetchRooms(): Promise<Room[]> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/messaging/room`, { headers });
    if (!res.ok) throw new Error("Failed to fetch rooms");
    const json = await res.json();
    return json.data ?? json ?? [];
  }

  async fetchRoom(conversationId: string): Promise<Room | null> {
    const headers = await authHeaders();
    const res = await fetch(
      `${BASE_URL}/api/messaging/room/${encodeURIComponent(conversationId)}`,
      { headers }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json ?? null;
  }

  async markMessageSeen(conversationId: string, messageId: string): Promise<Room[]> {
    const headers = await authHeaders();
    const res = await fetch(
      `${BASE_URL}/api/messaging/room/${encodeURIComponent(conversationId)}/${encodeURIComponent(messageId)}`,
      { method: "PATCH", headers }
    );
    if (!res.ok) throw new Error("Failed to mark message as seen");
    const json = await res.json();
    return json.data ?? json ?? [];
  }

  async archiveRoom(conversationId: string): Promise<Room[]> {
    const headers = await authHeaders();
    const res = await fetch(
      `${BASE_URL}/api/messaging/room/${encodeURIComponent(conversationId)}/archive`,
      { method: "PATCH", headers }
    );
    if (!res.ok) throw new Error("Failed to archive room");
    const json = await res.json();
    return json.data ?? json ?? [];
  }

  async deleteRoom(conversationId: string): Promise<Room[]> {
    const headers = await authHeaders();
    const res = await fetch(
      `${BASE_URL}/api/messaging/room/${encodeURIComponent(conversationId)}`,
      { method: "DELETE", headers }
    );
    if (!res.ok) throw new Error("Failed to delete room");
    const json = await res.json();
    return json.data ?? json ?? [];
  }

  /* ── REST APIs (Message) ── */

  async createMessage(body: CreateMessageBody): Promise<Message> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/messaging/message`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to send message");
    const json = await res.json();
    return json.data ?? json;
  }

  async fetchMessages(conversationId: string, cursor?: string): Promise<FetchMessagesResponse> {
    const query = new URLSearchParams({ conversationId });
    if (cursor) query.set("cursor", cursor);

    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/messaging/message?${query.toString()}`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    const json = await res.json();
    return {
      data: json.data ?? [],
      nextCursor: json.nextCursor ?? null,
    };
  }

  async editMessage(body: EditMessageBody): Promise<Message> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/messaging/message`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to edit message");
    const json = await res.json();
    return json.data ?? json;
  }

  async deleteMessage(body: DeleteMessageBody): Promise<DeleteMessageResponse> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/api/messaging/message`, {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to delete message");
    return res.json();
  }

  /* ── Private Helpers ── */

  private async waitForConnection(): Promise<void> {
    if (this.socket?.connected) return;
    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }
    throw new Error("Socket not initialized — call connect() first");
  }

  private emit<T>(event: string, data: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }
      this.socket.emit(event, data, (response: T) => resolve(response));
    });
  }
}
