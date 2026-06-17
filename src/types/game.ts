export type Ingredient = "meat" | "mushroom" | "herb" | "fish" | "grain";

export type Ingredients = Record<Ingredient, number>;

export type BoardCellType = "start" | "empty" | "ingredient" | "search" | "kitchen" | "finalKitchen";

export type PointCardValue = -3 | -1 | 0 | 1 | 3;

export type DrawPhase = "drawing" | "actions" | "ended";

export interface PointCard {
  id: string;
  value: PointCardValue;
}

export interface BoardCell {
  index: number;
  type: BoardCellType;
}

export interface ArmCard {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

export interface DishCard {
  id: string;
  name: string;
  emoji: string;
  ingredients: Ingredients;
  cost: number;
  score: number;
  description: string;
}

export interface ExploreCard {
  id: string;
  title: string;
  description: string;
  negative?: boolean;
}

export interface Player {
  id: number;
  name: string;
  position: number;
  arms: ArmCard[];
  ingredients: Ingredients;
  completedDishes: DishCard[];
  score: number;
  skipNextTurn: boolean;
  maxCarryCapacity: number;
  ignoreNextNegativeEvent: boolean;
  nextCookDiscount: number;
  nextArmDiscount: number;
}

export interface GameLogEntry {
  id: number;
  text: string;
}

export interface PendingDiscard {
  playerIndex: number;
  count: number;
  reason: string;
}

export interface DrawResult {
  cards: PointCard[];
  points: number;
  specialMessage: string | null;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  maxRounds: number;
  deck: PointCard[];
  discardPile: PointCard[];
  drawnCards: PointCard[];
  remainingPoints: number;
  drawPhase: DrawPhase;
  logs: GameLogEntry[];
  searchLogs: GameLogEntry[];
  latestEventResult: string | null;
  pendingDiscard: PendingDiscard | null;
  gameOver: boolean;
  pendingGameOver: boolean;
  winnerIds: number[];
}

export type GameAction =
  | { type: "DRAW_POINT_CARD" }
  | { type: "STOP_DRAWING" }
  | { type: "MOVE"; steps: number }
  | { type: "BUY_ARM"; armId: string; replaceArmId?: string }
  | { type: "COOK_DISH"; dishId: string }
  | { type: "END_TURN" }
  | { type: "RESET_GAME"; playerCount: number }
  | { type: "DISMISS_EVENT_RESULT" }
  | { type: "DISCARD_INGREDIENTS"; ingredients: Ingredient[] }
  | { type: "CHOOSE_INGREDIENT"; ingredient: Ingredient };
