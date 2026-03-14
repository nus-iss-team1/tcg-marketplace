import { field } from "../../dynamodb/dynamodb.util";

export const GameCardLookup = {
  gameId: field({
    type: "string",
    pk: true,
    hidden: true
  }), // value: gamedata
  meta: field({
    type: "string",
    sk: true,
    hidden: true
  }), // value: game#<gameName>
  gameName: field({
    type: "string"
  }),
  cardName: field({
    type: "string"
  }),
  cardId: field({
    type: "string",
    optional: true
  }),
  setName: field({
    type: "string",
    optional: true
  }),
  rarity: field({
    type: "string"
  }),
  isActive: field({
    type: "boolean",
    hidden: true
  }),
  createdAt: field({
    type: "number",
    hidden: true
  })
};

export type GameLookup = {
  gameId: string; // value: gamedata
  meta: string; // value: game#<gameName>
  gameName: string;
};

export type CardLookup = {
  gameId: string; // value: carddata
  meta: string; // value: card#<cardName>#<rarity>
  gameName: string;
  cardName: string;
  cardId?: string;
  setName?: string;
  rarity: string;
  isActive: boolean;
  createdAt: number;
};
