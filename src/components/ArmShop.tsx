import { useState } from "react";
import { arms } from "../data/cards";
import { getArmCost } from "../utils/gameLogic";
import type { GameState } from "../types/game";

interface ArmShopProps {
  state: GameState;
  onBuy: (armId: string, replaceArmId?: string) => void;
}

export default function ArmShop({ state, onBuy }: ArmShopProps) {
  const [pendingArmId, setPendingArmId] = useState<string | null>(null);
  const player = state.players[state.currentPlayerIndex];
  const pendingArm = arms.find((arm) => arm.id === pendingArmId) ?? null;

  const handleArmClick = (armId: string) => {
    if (player.arms.length >= 2) {
      setPendingArmId(armId);
      return;
    }
    onBuy(armId);
  };

  return (
    <section className="rounded-lg border border-white/10 bg-[#14253a] p-4 text-white shadow-soft">
      <h2 className="mb-3 font-black">팔 상점</h2>
      {pendingArm ? (
        <div className="mb-3 rounded-md border border-emerald-300/30 bg-emerald-400/10 p-3">
          <div className="font-black">{pendingArm.emoji} {pendingArm.name} 장착 슬롯 선택</div>
          <p className="mt-1 text-sm text-white/70">이미 팔이 2개입니다. 버릴 팔을 하나 선택하면 새 팔로 교체합니다.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {player.arms.map((arm) => (
              <button
                key={arm.id}
                onClick={() => {
                  onBuy(pendingArm.id, arm.id);
                  setPendingArmId(null);
                }}
                className="rounded-md bg-moss px-3 py-2 text-left text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                {arm.emoji} {arm.name} 버리고 교체
              </button>
            ))}
          </div>
          <button onClick={() => setPendingArmId(null)} className="mt-2 rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-white/80">
            취소
          </button>
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {arms.map((arm) => {
          const owned = player.arms.some((item) => item.id === arm.id);
          const cost = getArmCost(player, arm);
          const disabled = state.drawPhase !== "actions" || owned || state.remainingPoints < cost;
          return (
            <button
              key={arm.id}
              disabled={disabled}
              onClick={() => handleArmClick(arm.id)}
              className="rounded-md border border-white/10 bg-white/5 p-3 text-left disabled:opacity-40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-black">{arm.emoji} {arm.name}</span>
                <span className="rounded bg-broth px-2 py-1 text-xs font-bold text-grave">
                  {player.arms.length >= 2 && !owned ? `교체 ${cost}` : cost}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/65">{arm.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
