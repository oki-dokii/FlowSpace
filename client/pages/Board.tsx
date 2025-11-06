import KanbanBoard from "@/components/kanban/KanbanBoard";
import { useRef } from "react";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import FloatingBackground from "@/components/visuals/FloatingBackground";

export default function Board() {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", String(x));
    el.style.setProperty("--my", String(y));
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative container mx-auto px-6 py-8 overflow-hidden"
    >
      <FloatingBackground />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-4 bg-white/60 dark:bg-white/5 backdrop-blur border border-white/20 shadow-inner">
            <KanbanBoard />
          </div>
        </div>
        <div className="lg:col-span-1">
          <NotesPanel />
        </div>
      </div>

      <Button className="fixed bottom-6 right-6 rounded-full h-12 px-5 shadow-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-500/90 hover:to-violet-600/90">
        <Plus className="mr-2 h-5 w-5" /> Create Board
      </Button>

      <Button
        variant="outline"
        className="fixed bottom-6 right-40 rounded-full backdrop-blur bg-white/60 dark:bg-white/10 border-white/40 dark:border-white/10"
      >
        <Users className="mr-2 h-5 w-5" /> Invite Members
      </Button>
    </div>
  );
}
