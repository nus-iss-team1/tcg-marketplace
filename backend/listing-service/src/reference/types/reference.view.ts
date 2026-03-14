import { buildProjection } from "../../dynamodb/dynamodb.util";
import { GameCardLookup } from "./reference.schema";

type GameCardKey = keyof typeof GameCardLookup;

const GameCardViews = {
  gameLookup: ["gameName"],
  cardLookup: ["gameName", "cardName", "cardId", "setName", "rarity"]
} as const satisfies Record<string, readonly GameCardKey[]>;

export const GameCardProjections = {
  gameLookup: buildProjection(GameCardLookup, GameCardViews.gameLookup),
  cardLookup: buildProjection(GameCardLookup, GameCardViews.cardLookup)
};
