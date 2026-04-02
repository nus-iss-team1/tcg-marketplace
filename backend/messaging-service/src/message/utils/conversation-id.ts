export function generateConversationId(userA: string, userB: string) {
  const [a, b] = [userA, userB].sort();
  return `ROOM#${a}#${b}`;
}
