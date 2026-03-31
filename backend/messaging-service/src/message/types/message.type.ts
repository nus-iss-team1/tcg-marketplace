export type MessageCursor = {
  conversationId: string;
  meta: string;
};

export enum MessageType {
  text = "text",
  image = "image",
  video = "video",
  file = "file",
  sticker = "sticker"
}
