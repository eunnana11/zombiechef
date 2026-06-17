import { useReducer, useState } from "react";
import ActionPanel from "./components/ActionPanel";
import ArmShop from "./components/ArmShop";
import Board from "./components/Board";
import DishPanel from "./components/DishPanel";
import DrawCardPanel from "./components/DrawCardPanel";
import EndScreen from "./components/EndScreen";
import GameLog from "./components/GameLog";
import PlayerPanel from "./components/PlayerPanel";
import { ingredientKeys, ingredientLabels } from "./data/cards";
import type { Ingredient } from "./types/game";
import { createInitialState, gameReducer } from "./utils/gameLogic";

export default function App() {
  const [playerCount, setPlayerCount] = useState(4);
  const [openPanel, setOpenPanel] = useState<"arms" | "dishes" | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [discardSelection, setDiscardSelection] = useState<Ingredient[]>([]);
  const [state, dispatch] = useReducer(gameReducer, playerCount, createInitialState);
  const currentPlayer = state.players[state.currentPlayerIndex];
  const pendingDiscard = state.pendingDiscard;
  const discardPlayer = pendingDiscard ? state.players[pendingDiscard.playerIndex] : null;
  const selectedDiscardCounts = discardSelection.reduce<Record<Ingredient, number>>(
    (counts, ingredient) => ({ ...counts, [ingredient]: counts[ingredient] + 1 }),
    { meat: 0, mushroom: 0, herb: 0, fish: 0, grain: 0 }
  );

  if (state.gameOver) {
    return <EndScreen state={state} onRestart={(count) => dispatch({ type: "RESET_GAME", playerCount: count })} />;
  }

  return (
    <main className="min-h-screen bg-grave text-grave">
      <header className="border-b border-white/10 bg-[#0b1424] px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-normal text-white sm:text-3xl">🧟 좀비 요리사</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-md bg-broth px-3 py-2 text-sm font-black">라운드 {state.round}/{state.maxRounds}</div>
            <div className="rounded-md bg-moss px-3 py-2 text-sm font-black text-white">현재 {currentPlayer.name}</div>
            <div className="rounded-md bg-grave px-3 py-2 text-sm font-black text-white">남은 {state.remainingPoints}P</div>
            <button onClick={() => setShowHelp(true)} className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/15">
              도움말
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1760px] px-4 py-5">
        <section className="mb-4 rounded-lg border border-white/10 bg-[#14253a] p-3 text-white shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-white/70">
              2~4명이 한 브라우저에서 돌아가며 플레이합니다. 재료를 모으고 탐색 이벤트를 활용해 최고의 요리를 완성하세요.
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">새 게임</label>
              <select
                value={playerCount}
                onChange={(event) => setPlayerCount(Number(event.target.value))}
                className="rounded-md border border-grave/20 bg-white px-2 py-2 text-grave"
              >
                <option value={2}>2명</option>
                <option value={3}>3명</option>
                <option value={4}>4명</option>
              </select>
              <button onClick={() => dispatch({ type: "RESET_GAME", playerCount })} className="rounded-md bg-moss px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">
                시작
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <PlayerPanel state={state} />
          <div className="space-y-4">
            <Board state={state}>
              <div className="grid w-full max-w-2xl gap-3">
                <DrawCardPanel
                  state={state}
                  onDraw={() => dispatch({ type: "DRAW_POINT_CARD" })}
                  onStop={() => dispatch({ type: "STOP_DRAWING" })}
                />
                <ActionPanel
                  state={state}
                  onMove={(steps) => dispatch({ type: "MOVE", steps })}
                  onEndTurn={() => dispatch({ type: "END_TURN" })}
                  onOpenArmShop={() => setOpenPanel("arms")}
                  onOpenDishPanel={() => setOpenPanel("dishes")}
                />
              </div>
            </Board>
            <div className="grid gap-4 lg:grid-cols-2">
              <GameLog title="게임 로그" logs={state.logs} />
              <GameLog title="탐색 로그" logs={state.searchLogs} />
            </div>
          </div>
        </div>
      </div>
      {state.latestEventResult !== null ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#14253a] p-5 text-white shadow-soft">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">이벤트 결과</h2>
              <span className="text-2xl">🍳</span>
            </div>
            <p className="whitespace-pre-line rounded-md bg-white/5 p-4 text-sm font-semibold leading-6 text-white/80">
              {state.latestEventResult}
            </p>
            <button
              onClick={() => dispatch({ type: "DISMISS_EVENT_RESULT" })}
              className="mt-4 w-full rounded-md bg-moss px-3 py-2 font-bold text-white transition hover:bg-emerald-700"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
      {showHelp ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-[#14253a] p-5 text-white shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">게임 방법</h2>
              <button onClick={() => setShowHelp(false)} className="rounded-md bg-moss px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                닫기
              </button>
            </div>
            <div className="space-y-4 text-sm leading-6 text-white/80">
              <section>
                <h3 className="font-black text-white">목표</h3>
                <p>보드를 돌며 식재료를 모으고, 주방에서 요리를 완성해 가장 높은 점수를 얻는 게임입니다.</p>
              </section>
              <section>
                <h3 className="font-black text-white">턴 진행</h3>
                <p>자기 턴에는 공용 포인트 카드를 뽑습니다. 최소 1장, 최대 3장까지 뽑을 수 있고, 멈추면 최종 포인트로 행동합니다.</p>
              </section>
              <section>
                <h3 className="font-black text-white">행동</h3>
                <p>포인트가 남아 있는 동안 이동, 팔 구매, 요리 제작을 여러 번 할 수 있습니다. 포인트를 모두 쓰면 턴이 자동으로 끝납니다.</p>
              </section>
              <section>
                <h3 className="font-black text-white">칸 효과</h3>
                <p>식재료 칸에서는 재료를 얻고, 탐색 칸에서는 이벤트가 발생합니다. 이벤트 결과는 팝업과 로그로 확인할 수 있습니다.</p>
              </section>
              <section>
                <h3 className="font-black text-white">휴대량</h3>
                <p>식재료가 최대 휴대량을 넘으면 버릴 재료를 직접 선택해야 합니다. 선택을 마치기 전에는 다른 행동을 할 수 없습니다.</p>
              </section>
              <section>
                <h3 className="font-black text-white">승리</h3>
                <p>15라운드가 끝나거나, 누군가 요리 4개를 완성하거나, 한 바퀴를 돌아 시작점을 다시 지나면 게임이 끝납니다. 최종 점수가 가장 높은 셰프가 승리합니다.</p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
      {pendingDiscard && discardPlayer ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#14253a] p-5 text-white shadow-soft">
            <div className="mb-3">
              <h2 className="text-xl font-black">식재료 폐기 선택</h2>
              <p className="mt-1 text-sm text-white/70">
                {discardPlayer.name}의 휴대량 초과. {pendingDiscard.count}개를 선택해 버리세요.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {ingredientKeys.map((ingredient) => {
                const owned = discardPlayer.ingredients[ingredient];
                const selected = selectedDiscardCounts[ingredient];
                const canAdd = owned > selected && discardSelection.length < pendingDiscard.count;
                return (
                  <div key={ingredient} className="rounded-md bg-white/5 p-3 text-center">
                    <div className="text-2xl">{ingredientLabels[ingredient].emoji}</div>
                    <div className="mt-1 text-xs font-bold">{ingredientLabels[ingredient].label}</div>
                    <div className="mt-1 text-xs text-white/60">
                      보유 {owned} · 선택 {selected}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <button
                        disabled={selected <= 0}
                        onClick={() => {
                          const index = discardSelection.indexOf(ingredient);
                          if (index >= 0) setDiscardSelection(discardSelection.filter((_, itemIndex) => itemIndex !== index));
                        }}
                        className="rounded bg-white/10 px-2 py-1 text-sm font-bold disabled:opacity-30"
                      >
                        -
                      </button>
                      <button
                        disabled={!canAdd}
                        onClick={() => setDiscardSelection([...discardSelection, ingredient])}
                        className="rounded bg-moss px-2 py-1 text-sm font-bold disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-white/75">
                {discardSelection.length}/{pendingDiscard.count}개 선택됨
              </div>
              <button
                disabled={discardSelection.length !== pendingDiscard.count}
                onClick={() => {
                  dispatch({ type: "DISCARD_INGREDIENTS", ingredients: discardSelection });
                  setDiscardSelection([]);
                }}
                className="rounded-md bg-moss px-4 py-2 font-bold text-white transition hover:bg-emerald-700 disabled:bg-white/10 disabled:text-white/35"
              >
                폐기 완료
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {openPanel !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-white/10 bg-[#0f1b2d] p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-end">
              <button onClick={() => setOpenPanel(null)} className="rounded-md bg-moss px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                닫기
              </button>
            </div>
            {openPanel === "arms" ? (
              <ArmShop
                state={state}
                onBuy={(armId, replaceArmId) => {
                  dispatch({ type: "BUY_ARM", armId, replaceArmId });
                  setOpenPanel(null);
                }}
              />
            ) : (
              <DishPanel
                state={state}
                onCook={(dishId) => {
                  dispatch({ type: "COOK_DISH", dishId });
                  setOpenPanel(null);
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
