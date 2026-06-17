import type { GameLogEntry } from "../types/game";

interface GameLogProps {
  title: string;
  logs: GameLogEntry[];
}

export default function GameLog({ title, logs }: GameLogProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#14253a] p-4 text-white shadow-soft">
      <h2 className="mb-3 font-black">{title}</h2>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-sm text-white/50">아직 기록이 없습니다.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded bg-white/5 px-3 py-2 text-sm">
              {log.text}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
