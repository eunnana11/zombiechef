import type { BoardCell } from "../types/game";

const cellTypes: BoardCell["type"][] = [
  "start",
  "empty",
  "ingredient",
  "empty",
  "ingredient",
  "search",
  "empty",
  "search",
  "ingredient",
  "empty",
  "ingredient",
  "search",
  "kitchen",
  "ingredient",
  "search",
  "empty",
  "ingredient",
  "search",
  "ingredient",
  "empty",
  "search",
  "search",
  "ingredient",
  "search",
  "kitchen",
  "ingredient",
  "empty",
  "search",
  "ingredient",
  "finalKitchen"
];

export const board: BoardCell[] = cellTypes.map((type, index) => ({ index, type }));

export const kitchenPositions = board
  .filter((cell) => cell.type === "kitchen" || cell.type === "finalKitchen")
  .map((cell) => cell.index);

export const ingredientPositions = board
  .filter((cell) => cell.type === "ingredient")
  .map((cell) => cell.index);
