import { MessageType } from "../message/types/message.type";
import { field } from "./dynamodb.util";

export const MessagingPlatformSchema = {
  conversationId: field({
    type: "string",
    pk: true,
    gsi: { MessageTypeIndex: "pk" }
  }), // value: ROOM#sorted(<userId>#<recipientId>)
  meta: field({
    type: "string",
    sk: true
  }), // value: MESSAGE#<messageId> | VERSION#<messageId>#<paddedVersion> | USER#<userId>
  filterContent: field({
    type: "string",
    hidden: true
  }), // value: content.toLowerCase()
  filterMessageType: field({
    type: "string",
    gsi: { MessageTypeIndex: "sk" },
    hidden: true
  }), // value: <messageType>#<createdAt>
  messageId: field({
    type: "string"
  }), // value: ULID
  senderId: field({
    type: "string"
  }),
  latestMessageId: field({
    type: "string"
  }),
  latestMessage: field({
    type: "string"
  }),
  latestMessageSenderId: field({
    type: "string",
    optional: true
  }),
  content: field({
    type: "string"
  }),
  messageType: field({
    type: "string"
  }), // value: text | image | video | file | sticker
  version: field({
    type: "number"
  }),
  createdAt: field({
    type: "number"
  }),
  updatedAt: field({
    type: "number",
    gsi: { UserConversationIndex: "sk" }
  }),
  deleted: field({
    type: "boolean"
  }),
  reaction: field({
    type: "map",
    optional: true
  }),
  replyTo: field({
    type: "string",
    optional: true
  }),
  editedBy: field({
    type: "string"
  }),
  userId: field({
    type: "string",
    gsi: { UserConversationIndex: "pk" }
  }),
  recipientId: field({
    type: "string"
  }),
  userName: field({
    type: "string",
    optional: true
  }),
  recipientName: field({
    type: "string",
    optional: true
  }),
  archived: field({
    type: "boolean"
  }),
  lastSeenMessageId: field({
    type: "string",
    optional: true
  }),
  muted: field({
    type: "boolean"
  }),
  pinned: field({
    type: "boolean"
  }),
  listingId: field({
    type: "string",
    optional: true
  }),
  listingGameName: field({
    type: "string",
    optional: true
  })
};

export type Room = {
  conversationId: string;
  meta: string;
  userId: string;
  recipientId: string;
  userName?: string;
  recipientName?: string;
  latestMessage: MessageType;
  latestMessageSenderId?: string;
  latestMessageId: string | null;
  lastSeenMessageId: string | null;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  deleted: boolean;
  createdAt: number;
  updatedAt: number;
  listingId?: string;
  listingGameName?: string;
};

export type Message = {
  conversationId: string;
  meta: string;
  filterContent: string;
  filterMessageType: string;
  messageId: string;
  senderId: string;
  content: string;
  messageType: string;
  version: number;
  reaction: Record<string, string[]>;
  replyTo: string | null;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
};

export type MessageVersion = {
  conversationId: string;
  meta: string;
  messageId: string;
  content: string;
  version: number;
  editedBy: string;
  updatedAt: number;
  deleted: boolean;
};
