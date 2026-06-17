import { board, ingredientPositions, kitchenPositions } from "../data/board";
import { arms, createPointDeck, dishes, emptyIngredients, exploreCards, ingredientKeys, ingredientLabels } from "../data/cards";
import type {
  ArmCard,
  DishCard,
  DrawResult,
  ExploreCard,
  GameAction,
  GameLogEntry,
  GameState,
  Ingredient,
  Ingredients,
  Player,
  PointCard
} from "../types/game";

const maxPosition = board.length - 1;
const boardLength = board.length;

export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

export const clampPosition = (position: number): number => Math.max(0, Math.min(maxPosition, position));

export const totalIngredients = (ingredients: Ingredients): number =>
  ingredientKeys.reduce((total, key) => total + ingredients[key], 0);

const addLog = (logs: GameLogEntry[], text: string): GameLogEntry[] => [{ id: Date.now() + Math.random(), text }, ...logs].slice(0, 90);

const appendEventResult = (current: string | null, title: string, detail: string): string =>
  [current, `${title}\n${detail}`].filter(Boolean).join("\n\n");

const hasArm = (player: Player, armId: string): boolean => player.arms.some((arm) => arm.id === armId);

const recalcPlayer = (player: Player): Player => {
  let capacity = 5;
  if (hasArm(player, "basket")) capacity += 3;
  if (hasArm(player, "cart")) capacity += 5;
  return { ...player, maxCarryCapacity: capacity };
};

const drawOneCard = (deck: PointCard[], discardPile: PointCard[]): { card: PointCard; deck: PointCard[]; discardPile: PointCard[] } => {
  let nextDeck = deck;
  let nextDiscard = discardPile;
  if (nextDeck.length === 0) {
    nextDeck = shuffle(nextDiscard);
    nextDiscard = [];
  }
  const [card, ...rest] = nextDeck;
  return { card, deck: rest, discardPile: nextDiscard };
};

export const evaluatePointCards = (cards: PointCard[]): DrawResult => {
  const plusCount = cards.filter((card) => card.value > 0).length;
  const minusCount = cards.filter((card) => card.value < 0).length;
  const zeroCount = cards.filter((card) => card.value === 0).length;
  const base = cards.reduce((sum, card) => sum + card.value, 0);
  const isMamaPlusOrder = cards.length === 3 && cards[0].value < 0 && cards[1].value < 0 && cards[2].value > 0;

  if (cards.length === 3 && zeroCount === 3) return { cards, points: 3, specialMessage: "완벽한 준비가 끝났다!" };
  if (cards.length === 3 && minusCount === 3) return { cards, points: 4, specialMessage: "완전한 좀비 각성! 오히려 강해졌다!" };
  if (isMamaPlusOrder) return { cards, points: -4, specialMessage: "그냥 멈췄어야 했다..." };
  if (zeroCount === 2 && plusCount === 0 && minusCount === 0) return { cards, points: 1, specialMessage: "신중한 준비 완료." };
  if (minusCount === 2 && plusCount === 0) return { cards, points: -1, specialMessage: "좀비 근성 발동! 간신히 버텼다!" };
  if (cards.length === 3 && plusCount === 3) return { cards, points: base + 4, specialMessage: "셰프의 황금 타이밍!" };
  return { cards, points: base, specialMessage: null };
};

const formatPoints = (points: number): string => `${points > 0 ? "+" : ""}${points}P`;

const randomIngredient = (): Ingredient => ingredientKeys[Math.floor(Math.random() * ingredientKeys.length)];

const gainIngredients = (player: Player, count: number): { player: Player; gained: Ingredient[]; discarded: Ingredient[] } => {
  const gained: Ingredient[] = [];
  let ingredients = { ...player.ingredients };
  for (let index = 0; index < count; index += 1) {
    const ingredient = randomIngredient();
    ingredients[ingredient] += 1;
    gained.push(ingredient);
    if (ingredient === "fish" && hasArm(player, "fishing")) {
      ingredients.fish += 1;
      gained.push("fish");
    }
  }

  return { player: { ...player, ingredients }, gained, discarded: [] };
};

const loseRandomIngredient = (player: Player): { player: Player; lost: Ingredient | null } => {
  const available = ingredientKeys.filter((key) => player.ingredients[key] > 0);
  if (available.length === 0) return { player, lost: null };
  const lost = available[Math.floor(Math.random() * available.length)];
  return { player: { ...player, ingredients: { ...player.ingredients, [lost]: player.ingredients[lost] - 1 } }, lost };
};

const formatIngredients = (items: Ingredient[]): string =>
  items.length === 0 ? "없음" : items.map((item) => `${ingredientLabels[item].emoji}${ingredientLabels[item].label}`).join(", ");

const formatIngredientCounts = (items: Ingredient[]): string => {
  if (items.length === 0) return "없음";
  const counts = items.reduce<Record<Ingredient, number>>(
    (acc, item) => ({ ...acc, [item]: acc[item] + 1 }),
    emptyIngredients()
  );
  return ingredientKeys
    .filter((key) => counts[key] > 0)
    .map((key) => `${ingredientLabels[key].emoji}${ingredientLabels[key].label} ${counts[key]}개`)
    .join(", ");
};

const nearest = (from: number, targets: number[]): number =>
  targets.reduce((best, target) => (Math.abs(target - from) < Math.abs(best - from) ? target : best), targets[0]);

const withPendingDiscard = (state: GameState, playerIndex: number, reason: string): GameState => {
  const player = state.players[playerIndex];
  const overflow = totalIngredients(player.ingredients) - player.maxCarryCapacity;
  if (overflow <= 0) return state;
  return {
    ...state,
    pendingDiscard: {
      playerIndex,
      count: overflow,
      reason
    },
    latestEventResult: appendEventResult(
      state.latestEventResult,
      "휴대량 초과",
      `${player.name}의 휴대량을 ${overflow}개 초과했습니다. 버릴 식재료 ${overflow}개를 선택하세요.`
    )
  };
};

const crossesStart = (player: Player, steps: number): boolean => steps > 0 && player.position + steps >= boardLength;

const movePlayerRaw = (player: Player, steps: number): Player => ({
  ...player,
  position: steps > 0 ? (player.position + steps) % boardLength : clampPosition(player.position + steps)
});

const resolveCell = (state: GameState, playerIndex: number): GameState => {
  let nextState = state;
  let player = nextState.players[playerIndex];
  const cell = board[player.position];

  if (cell.type === "ingredient") {
    const baseGain = 2 + (hasArm(player, "tongs") ? 1 : 0);
    const result = gainIngredients(player, baseGain);
    const players = [...nextState.players];
    players[playerIndex] = result.player;
    nextState = {
      ...nextState,
      players,
      logs: addLog(nextState.logs, `${player.name}이(가) 식재료 칸에서 ${formatIngredients(result.gained)} 획득했습니다.${result.discarded.length ? ` 휴대량 초과로 ${formatIngredients(result.discarded)} 폐기.` : ""}`),
      latestEventResult: appendEventResult(
        nextState.latestEventResult,
        "식재료 획득",
        `${player.name}이(가) ${formatIngredients(result.gained)} 획득했습니다.${result.discarded.length ? `\n휴대량 초과로 ${formatIngredients(result.discarded)} 폐기.` : ""}`
      )
    };
  }

  if (cell.type === "search") {
    nextState = applyExploreCard(nextState, playerIndex, exploreCards[Math.floor(Math.random() * exploreCards.length)]);
  }

  return withPendingDiscard(nextState, playerIndex, "휴대량 초과");
};

const applyExploreCard = (state: GameState, playerIndex: number, card: ExploreCard): GameState => {
  let players = [...state.players];
  let player = players[playerIndex];
  let logs = addLog(state.logs, `${player.name} 탐색: ${card.title} - ${card.description}`);
  let searchLogs = addLog(state.searchLogs, `${player.name}: ${card.title}`);
  let resultDetail = card.description;
  let lapFinisherName: string | null = null;
  const moveWithLapCheck = (targetPlayer: Player, steps: number): Player => {
    if (!lapFinisherName && crossesStart(targetPlayer, steps)) {
      lapFinisherName = targetPlayer.name;
    }
    return movePlayerRaw(targetPlayer, steps);
  };

  if (card.negative && player.ignoreNextNegativeEvent) {
    players[playerIndex] = { ...player, ignoreNextNegativeEvent: false };
    return {
      ...state,
      players,
      logs: addLog(logs, `${player.name}이(가) 부정적 탐색 이벤트를 무시했습니다.`),
      searchLogs,
      latestEventResult: appendEventResult(state.latestEventResult, "탐색 결과", `${card.title}\n${card.description}\n\n도끼팔 효과로 부정적 탐색 이벤트를 무시했습니다.`)
    };
  }

  const opponents = players.map((candidate, index) => ({ candidate, index })).filter((entry) => entry.index !== playerIndex);
  const target = opponents.length > 0 ? opponents[Math.floor(Math.random() * opponents.length)] : null;

  switch (card.id) {
    case "forward2":
      player = moveWithLapCheck(player, 2);
      break;
    case "back2":
      player = moveWithLapCheck(player, -2);
      resultDetail = `${card.description}\n결과: 2칸 후진`;
      break;
    case "gain1": {
      const result = gainIngredients(player, 1);
      player = result.player;
      logs = addLog(logs, `${player.name}이(가) ${formatIngredients(result.gained)} 획득했습니다.`);
      resultDetail = `${card.description}\n획득: ${formatIngredients(result.gained)}`;
      break;
    }
    case "lose1": {
      const result = loseRandomIngredient(player);
      player = result.player;
      logs = addLog(logs, `${player.name}이(가) ${result.lost ? formatIngredients([result.lost]) : "잃을 식재료 없음"} 처리.`);
      resultDetail = `${card.description}\n결과: ${result.lost ? formatIngredients([result.lost]) : "잃을 식재료 없음"}`;
      break;
    }
    case "skip":
      player = { ...player, skipNextTurn: true };
      resultDetail = `${card.description}\n결과: 다음 턴을 쉽니다`;
      break;
    case "cookDiscount":
      player = { ...player, nextCookDiscount: player.nextCookDiscount + 1 };
      resultDetail = `${card.description}\n결과: 다음 요리 비용 -1`;
      break;
    case "push":
      if (target) players[target.index] = moveWithLapCheck(target.candidate, 1);
      break;
    case "extraHerb":
      player = { ...player, ingredients: { ...player.ingredients, herb: player.ingredients.herb + 1 } };
      resultDetail = `${card.description}\n획득: 🌿허브`;
      break;
    case "armDiscount":
      player = { ...player, nextArmDiscount: player.nextArmDiscount + 1 };
      break;
    case "nearestKitchen": {
      const destination = nearest(player.position, kitchenPositions);
      player = moveWithLapCheck(player, destination >= player.position ? 2 : -2);
      break;
    }
    case "gain2": {
      const result = gainIngredients(player, 2);
      player = result.player;
      logs = addLog(logs, `${player.name}이(가) ${formatIngredients(result.gained)} 획득했습니다.`);
      resultDetail = `${card.description}\n획득: ${formatIngredients(result.gained)}`;
      break;
    }
    case "loseFish":
      player = { ...player, ingredients: { ...player.ingredients, fish: 0 } };
      resultDetail = `${card.description}\n결과: 생선 전부 잃음`;
      break;
    case "swap":
      if (target) {
        const playerPosition = player.position;
        player = { ...player, position: target.candidate.position };
        players[target.index] = { ...target.candidate, position: playerPosition };
      }
      break;
    case "steal":
      if (target) {
        const stolen = loseRandomIngredient(target.candidate);
        players[target.index] = stolen.player;
        if (stolen.lost) {
          player = { ...player, ingredients: { ...player.ingredients, [stolen.lost]: player.ingredients[stolen.lost] + 1 } };
        }
      }
      break;
    case "gainGrain":
      player = { ...player, ingredients: { ...player.ingredients, grain: player.ingredients.grain + 1 } };
      resultDetail = `${card.description}\n획득: 🌾곡물`;
      break;
    case "gainMeat":
      player = { ...player, ingredients: { ...player.ingredients, meat: player.ingredients.meat + 1 } };
      resultDetail = `${card.description}\n획득: 🍖고기`;
      break;
    case "nearestIngredient":
      player = { ...player, position: nearest(player.position, ingredientPositions) };
      break;
    case "moveBonus":
      player = moveWithLapCheck(player, 1);
      break;
    case "legBreak":
      player = moveWithLapCheck(player, -2);
      resultDetail = `${card.description}\n결과: 2칸 후진`;
      break;
    case "gainMushroom":
      player = { ...player, ingredients: { ...player.ingredients, mushroom: player.ingredients.mushroom + 1 } };
      logs = addLog(logs, `${player.name}이(가) 🍄버섯을 획득했습니다.`);
      resultDetail = `${card.description}\n획득: 🍄버섯`;
      break;
    default:
      break;
  }

  players[playerIndex] = recalcPlayer(player);
  if (hasArm(players[playerIndex], "hook") && ["gain1", "gain2", "extraHerb", "gainGrain", "gainMeat", "gainMushroom"].includes(card.id)) {
    const result = gainIngredients(players[playerIndex], 1);
    players[playerIndex] = result.player;
    logs = addLog(logs, `${players[playerIndex].name}의 갈고리팔 효과로 ${formatIngredients(result.gained)} 추가 획득.`);
    resultDetail = `${resultDetail}\n갈고리팔 추가 획득: ${formatIngredients(result.gained)}`;
  }
  return {
    ...state,
    players,
    logs: lapFinisherName ? addLog(logs, `${lapFinisherName}이(가) 시작점을 다시 지나 게임 종료 조건이 걸렸습니다.`) : logs,
    searchLogs,
    gameOver: lapFinisherName !== null ? true : state.gameOver,
    drawPhase: lapFinisherName !== null ? "ended" : state.drawPhase,
    winnerIds: lapFinisherName !== null ? calculateWinnerIds(players) : state.winnerIds,
    latestEventResult: appendEventResult(
      state.latestEventResult,
      "탐색 결과",
      `${card.title}\n${resultDetail}${lapFinisherName ? `\n\n${lapFinisherName}이(가) 시작점을 다시 지나 게임 종료 조건이 걸렸습니다.` : ""}`
    )
  };
};

export const canCookDish = (player: Player, dish: DishCard, points: number): boolean => {
  const cost = Math.max(0, dish.cost - player.nextCookDiscount - (hasArm(player, "ladle") ? 1 : 0));
  return (
    points >= cost &&
    dish.ingredients &&
    ingredientKeys.every((key) => player.ingredients[key] >= dish.ingredients[key])
  );
};

export const getDishCost = (player: Player, dish: DishCard): number =>
  Math.max(0, dish.cost - player.nextCookDiscount - (hasArm(player, "ladle") ? 1 : 0));

export const getArmCost = (player: Player, arm: ArmCard): number => Math.max(0, arm.cost - player.nextArmDiscount);

const calculateWinnerIds = (players: Player[]): number[] => {
  const ranked = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.completedDishes.length !== a.completedDishes.length) return b.completedDishes.length - a.completedDishes.length;
    return totalIngredients(b.ingredients) - totalIngredients(a.ingredients);
  });
  const winner = ranked[0];
  return ranked
    .filter(
      (player) =>
        player.score === winner.score &&
        player.completedDishes.length === winner.completedDishes.length &&
        totalIngredients(player.ingredients) === totalIngredients(winner.ingredients)
    )
    .map((player) => player.id);
};

export const createInitialState = (playerCount = 4): GameState => {
  const players: Player[] = Array.from({ length: playerCount }, (_, index) => ({
    id: index + 1,
    name: `셰프 ${index + 1}`,
    position: 0,
    arms: [],
    ingredients: emptyIngredients(),
    completedDishes: [],
    score: 0,
    skipNextTurn: false,
    maxCarryCapacity: 5,
    ignoreNextNegativeEvent: false,
    nextCookDiscount: 0,
    nextArmDiscount: 0
  }));

  return {
    players,
    currentPlayerIndex: 0,
    round: 1,
    maxRounds: 15,
    deck: shuffle(createPointDeck()),
    discardPile: [],
    drawnCards: [],
    remainingPoints: 0,
    drawPhase: "drawing",
    logs: [{ id: 1, text: "좀비 요리사 시작! 첫 셰프는 포인트 카드를 뽑으세요." }],
    searchLogs: [],
    latestEventResult: null,
    pendingDiscard: null,
    gameOver: false,
    pendingGameOver: false,
    winnerIds: []
  };
};

const startNextTurn = (state: GameState): GameState => {
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const nextRound = nextIndex === 0 ? state.round + 1 : state.round;
  let nextState: GameState = {
    ...state,
    currentPlayerIndex: nextIndex,
    round: nextRound,
    drawnCards: [],
    remainingPoints: 0,
    drawPhase: "drawing"
  };

  const shouldEnd = nextState.pendingGameOver && nextIndex === 0;
  if (shouldEnd || nextRound > nextState.maxRounds) {
    return {
      ...nextState,
      gameOver: true,
      drawPhase: "ended",
      winnerIds: calculateWinnerIds(nextState.players),
      logs: addLog(nextState.logs, "게임 종료! 최종 점수를 계산했습니다.")
    };
  }

  if (nextIndex === 0) {
    nextState = {
      ...nextState,
      deck: shuffle([...nextState.deck, ...nextState.discardPile]),
      discardPile: [],
      logs: addLog(nextState.logs, `${nextRound}라운드 시작. 공용 포인트 덱과 버린 더미를 모두 섞어 새 덱을 만들었습니다.`)
    };
  }

  const player = nextState.players[nextIndex];
  if (player.skipNextTurn) {
    const players = [...nextState.players];
    players[nextIndex] = { ...player, skipNextTurn: false };
    nextState = {
      ...nextState,
      players,
      logs: addLog(nextState.logs, `${player.name}은(는) 멍한 좀비 모드로 이번 턴을 건너뜁니다.`)
    };
    return startNextTurn(nextState);
  }

  return nextState;
};

const finishCurrentTurn = (state: GameState, reason = "턴 종료."): GameState => {
  const player = state.players[state.currentPlayerIndex];
  const withDiscard = {
    ...state,
    discardPile: [...state.discardPile, ...state.drawnCards],
    logs: addLog(state.logs, `${player.name} ${reason}`)
  };
  return startNextTurn(withDiscard);
};

const autoEndIfNoPoints = (state: GameState): GameState => {
  if (state.pendingDiscard) return state;
  if (state.drawPhase === "actions" && state.drawnCards.length > 0 && state.remainingPoints <= 0) {
    return finishCurrentTurn(
      {
        ...state,
        latestEventResult: appendEventResult(
          state.latestEventResult,
          "자동 턴 종료",
          "사용 가능한 포인트가 없어 다음 셰프의 턴으로 넘어갑니다."
        )
      },
      "사용 가능한 포인트가 없어 턴이 자동 종료되었습니다."
    );
  }
  return state;
};

const stopDrawingAndResolvePoints = (state: GameState, player: Player): GameState => {
  let nextState = {
    ...state,
    drawPhase: "actions" as const,
    logs: addLog(state.logs, `${player.name}의 최종 포인트는 ${state.remainingPoints}입니다.`)
  };
  if (state.remainingPoints < 0) {
    const players = [...state.players];
    players[state.currentPlayerIndex] = movePlayerRaw(player, state.remainingPoints);
    nextState = {
      ...nextState,
      players,
      remainingPoints: 0,
      logs: addLog(nextState.logs, `${player.name}이(가) 음수 포인트로 자동 후진했습니다.`),
      latestEventResult: appendEventResult(nextState.latestEventResult, "자동 후진", `${player.name}이(가) ${Math.abs(state.remainingPoints)}칸 후진했습니다.`)
    };
    nextState = resolveCell(nextState, state.currentPlayerIndex);
  }
  return autoEndIfNoPoints(nextState);
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  if (action.type === "RESET_GAME") return createInitialState(action.playerCount);
  if (state.gameOver) return state;
  if (state.pendingDiscard && action.type !== "DISCARD_INGREDIENTS" && action.type !== "DISMISS_EVENT_RESULT") return state;

  const player = state.players[state.currentPlayerIndex];

  switch (action.type) {
    case "DRAW_POINT_CARD": {
      if (state.drawPhase !== "drawing" || state.drawnCards.length >= 3) return state;
      const draw = drawOneCard(state.deck, state.discardPile);
      const drawnCards = [...state.drawnCards, draw.card];
      const evaluated = evaluatePointCards(drawnCards);
      const specialText = evaluated.specialMessage ? `${evaluated.specialMessage} (${formatPoints(evaluated.points)})` : null;
      return {
        ...state,
        deck: draw.deck,
        discardPile: draw.discardPile,
        drawnCards,
        remainingPoints: evaluated.points,
        logs: specialText
          ? addLog(addLog(state.logs, `${player.name}이(가) 포인트 카드 ${draw.card.value > 0 ? "+" : ""}${draw.card.value}을(를) 뽑았습니다. 현재 ${evaluated.points}포인트.`), specialText)
          : addLog(state.logs, `${player.name}이(가) 포인트 카드 ${draw.card.value > 0 ? "+" : ""}${draw.card.value}을(를) 뽑았습니다. 현재 ${evaluated.points}포인트.`),
        latestEventResult: specialText ? appendEventResult(state.latestEventResult, "포인트 특수 조합", specialText) : state.latestEventResult
      };
    }
    case "STOP_DRAWING": {
      if (state.drawPhase !== "drawing" || state.drawnCards.length === 0) return state;
      return stopDrawingAndResolvePoints(state, player);
    }
    case "MOVE": {
      if (state.drawPhase !== "actions" || action.steps <= 0 || action.steps > state.remainingPoints) return state;
      const players = [...state.players];
      const movedSpaces = action.steps;
      const finishedLap = crossesStart(player, movedSpaces);
      players[state.currentPlayerIndex] = movePlayerRaw(player, movedSpaces);
      const movedState = {
        ...state,
        players,
        remainingPoints: state.remainingPoints - action.steps,
        gameOver: finishedLap ? true : state.gameOver,
        drawPhase: finishedLap ? "ended" as const : state.drawPhase,
        winnerIds: finishedLap ? calculateWinnerIds(players) : state.winnerIds,
        logs: finishedLap
          ? addLog(
              addLog(state.logs, `${player.name}이(가) ${action.steps}포인트로 ${movedSpaces}칸 이동했습니다.`),
              `${player.name}이(가) 시작점을 다시 지나 게임 종료 조건이 걸렸습니다.`
            )
          : addLog(state.logs, `${player.name}이(가) ${action.steps}포인트로 ${movedSpaces}칸 이동했습니다.`),
        latestEventResult: finishedLap
          ? appendEventResult(state.latestEventResult, "한 바퀴 완주", `${player.name}이(가) 시작점을 다시 지나 게임 종료 조건이 걸렸습니다.`)
          : state.latestEventResult
      };
      if (finishedLap) return movedState;
      return autoEndIfNoPoints(resolveCell(movedState, state.currentPlayerIndex));
    }
    case "BUY_ARM": {
      if (state.drawPhase !== "actions" || player.arms.some((arm) => arm.id === action.armId)) return state;
      const arm = arms.find((item) => item.id === action.armId);
      if (!arm) return state;
      if (player.arms.length >= 2 && !action.replaceArmId) return state;
      const replacedArm = action.replaceArmId ? player.arms.find((item) => item.id === action.replaceArmId) : undefined;
      if (player.arms.length >= 2 && !replacedArm) return state;
      const cost = getArmCost(player, arm);
      if (state.remainingPoints < cost) return state;
      const nextArms = replacedArm ? player.arms.map((item) => (item.id === replacedArm.id ? arm : item)) : [...player.arms, arm];
      const capacityAdjusted = recalcPlayer({
        ...player,
        arms: nextArms,
        ignoreNextNegativeEvent: arm.id === "axe" ? true : player.ignoreNextNegativeEvent,
        nextArmDiscount: 0
      });
      const updated = capacityAdjusted;
      const players = [...state.players];
      players[state.currentPlayerIndex] = updated;
      const actionText = replacedArm
        ? `${player.name}이(가) ${replacedArm.name}을(를) 버리고 ${arm.name}으로 교체했습니다. 비용 ${cost}.`
        : `${player.name}이(가) ${arm.name}을(를) 장착했습니다. 비용 ${cost}.`;
      return autoEndIfNoPoints(withPendingDiscard({
        ...state,
        players,
        remainingPoints: state.remainingPoints - cost,
        logs: addLog(state.logs, actionText)
      }, state.currentPlayerIndex, "팔 교체 후 휴대량 초과"));
    }
    case "COOK_DISH": {
      if (state.drawPhase !== "actions") return state;
      const cell = board[player.position];
      if (cell.type !== "kitchen" && cell.type !== "finalKitchen") return state;
      const dish = dishes.find((item) => item.id === action.dishId);
      if (!dish || !canCookDish(player, dish, state.remainingPoints)) return state;
      const cost = getDishCost(player, dish);
      const bonus = hasArm(player, "golden") ? 2 : 0;
      const ingredients = { ...player.ingredients };
      ingredientKeys.forEach((key) => {
        ingredients[key] -= dish.ingredients[key];
      });
      const updated: Player = {
        ...player,
        ingredients,
        completedDishes: [...player.completedDishes, dish],
        score: player.score + dish.score + bonus,
        nextCookDiscount: 0
      };
      const players = [...state.players];
      players[state.currentPlayerIndex] = updated;
      const pendingGameOver = state.pendingGameOver || updated.completedDishes.length >= 4;
      return autoEndIfNoPoints({
        ...state,
        players,
        remainingPoints: state.remainingPoints - cost,
        pendingGameOver,
        logs: addLog(state.logs, `${player.name}이(가) ${dish.name} 완성! ${dish.score + bonus}점 획득.`)
      });
    }
    case "END_TURN": {
      if (state.drawnCards.length === 0) return state;
      if (state.drawPhase === "drawing") {
        const resolvedState = stopDrawingAndResolvePoints(state, player);
        if (resolvedState.currentPlayerIndex !== state.currentPlayerIndex || resolvedState.gameOver) return resolvedState;
        return finishCurrentTurn(resolvedState);
      }
      return finishCurrentTurn(state);
    }
    case "DISMISS_EVENT_RESULT":
      return { ...state, latestEventResult: null };
    case "DISCARD_INGREDIENTS": {
      if (!state.pendingDiscard || action.ingredients.length !== state.pendingDiscard.count) return state;
      const targetPlayer = state.players[state.pendingDiscard.playerIndex];
      const ingredients = { ...targetPlayer.ingredients };
      for (const ingredient of action.ingredients) {
        if (ingredients[ingredient] <= 0) return state;
        ingredients[ingredient] -= 1;
      }
      const players = [...state.players];
      players[state.pendingDiscard.playerIndex] = { ...targetPlayer, ingredients };
      const discardedText = formatIngredientCounts(action.ingredients);
      return autoEndIfNoPoints({
        ...state,
        players,
        pendingDiscard: null,
        logs: addLog(state.logs, `${targetPlayer.name}이(가) 휴대량 초과로 ${discardedText} 폐기했습니다.`),
        latestEventResult: appendEventResult(state.latestEventResult, "식재료 폐기", `${discardedText} 폐기 완료.`)
      });
    }
    case "CHOOSE_INGREDIENT": {
      const players = [...state.players];
      players[state.currentPlayerIndex] = {
        ...player,
        ingredients: { ...player.ingredients, [action.ingredient]: player.ingredients[action.ingredient] + 1 }
      };
      return withPendingDiscard({
        ...state,
        players,
        logs: addLog(state.logs, `${player.name}이(가) ${ingredientLabels[action.ingredient].emoji}${ingredientLabels[action.ingredient].label}을(를) 선택 획득했습니다.`)
      }, state.currentPlayerIndex, "휴대량 초과");
    }
    default:
      return state;
  }
};

export const rankPlayers = (players: Player[]): Player[] =>
  [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.completedDishes.length !== a.completedDishes.length) return b.completedDishes.length - a.completedDishes.length;
    return totalIngredients(b.ingredients) - totalIngredients(a.ingredients);
  });
