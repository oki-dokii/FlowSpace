import { useMemo, useState } from "react";
import React, { useMemo, useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export type Card = {
  id: string;
  title: string;
  assignee?: { name: string; avatar: string };
  dueDate?: string; // ISO date
  status: ColumnId;
  tag?: string;
};

export type ColumnId = "todo" | "inprogress" | "review" | "done";

const initial: Card[] = [
  { id: "1", title: "Design landing hero", assignee: { name: "Lia", avatar: "https://i.pravatar.cc/96?img=32" }, status: "todo", tag: "Design" },
  { id: "2", title: "Set up dnd-kit", assignee: { name: "Ray", avatar: "https://i.pravatar.cc/96?img=14" }, status: "inprogress", tag: "Dev" },
  { id: "3", title: "Notes panel markdown", assignee: { name: "Ana", avatar: "https://i.pravatar.cc/96?img=24" }, status: "review", tag: "Docs" },
  { id: "4", title: "Confetti on Done move", assignee: { name: "Eli", avatar: "https://i.pravatar.cc/96?img=5" }, status: "todo", tag: "Polish" },
  { id: "5", title: "Dark/Light theme", assignee: { name: "Mia", avatar: "https://i.pravatar.cc/96?img=40" }, status: "done", tag: "UI" },
];

const columns: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export function KanbanBoard() {
  const [cards, setCards] = useState<Card[]>(initial);

  const byColumn = useMemo(() => {
    return columns.reduce<Record<ColumnId, Card[]>>((acc, col) => {
      acc[col.id] = cards.filter((c) => c.status === col.id);
      return acc;
    }, { todo: [], inprogress: [], review: [], done: [] });
  }, [cards]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // If dropping on a column header, change status
    if (["todo", "inprogress", "review", "done"].includes(overId)) {
      setCards((prev) => prev.map((c) => (c.id === activeId ? { ...c, status: overId as ColumnId } : c)));
      if ((overId as ColumnId) === "done") triggerConfetti();
      return;
    }

    // Reordering inside same column
    const activeCard = cards.find((c) => c.id === activeId);
    const overCard = cards.find((c) => c.id === overId);
    if (!activeCard || !overCard) return;
    if (activeCard.status !== overCard.status) {
      setCards((prev) => prev.map((c) => (c.id === activeId ? { ...c, status: overCard.status } : c)));
      if (overCard.status === "done") triggerConfetti();
      return;
    }
    const colId = activeCard.status;
    const colItems = byColumn[colId];
    const oldIndex = colItems.findIndex((c) => c.id === activeId);
    const newIndex = colItems.findIndex((c) => c.id === overId);
    const reordered = arrayMove(colItems, oldIndex, newIndex);
    const otherCards = cards.filter((c) => c.status !== colId);
    setCards([...otherCards, ...reordered]);
  }

  function triggerConfetti() {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.25 } });
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((col) => (
          <Column key={col.id} id={col.id} title={col.title} items={byColumn[col.id]} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ id, title, items }: { id: ColumnId; title: string; items: Card[] }) {
  const presence = [
    "https://i.pravatar.cc/96?img=21",
    "https://i.pravatar.cc/96?img=7",
    "https://i.pravatar.cc/96?img=37",
  ];

  return (
    <div className="rounded-2xl p-3 bg-white/60 dark:bg-white/5 backdrop-blur border border-white/30 dark:border-white/10 shadow-sm">
      <div className="flex items-center justify-between px-1 pb-2">
        <h3 className="font-semibold text-sm tracking-wide text-foreground/90">{title}</h3>
        <div className="flex -space-x-2">
          {presence.map((src, i) => (
            <Avatar key={i} className="h-6 w-6 ring-2 ring-white/60 dark:ring-white/20">
              <AvatarImage src={src} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((card) => (
            <KanbanCard key={card.id} card={card} columnId={id} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function KanbanCard({ card }: { card: Card; columnId: ColumnId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tz: 0 });

  const baseTransform = CSS.Transform.toString(transform);
  const style: any = {
    transform: `${baseTransform} translateZ(${tilt.tz}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
    transition,
  };

  function handleMove(e: React.MouseEvent) {
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - el.left) / el.width - 0.5;
    const y = (e.clientY - el.top) / el.height - 0.5;
    setTilt({ rx: Math.max(-6, Math.min(6, -y * 8)), ry: Math.max(-8, Math.min(8, x * 10)), tz: 6 });
  }
  function handleLeave() {
    setTilt({ rx: 0, ry: 0, tz: 0 });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "rounded-xl p-3 bg-white shadow border border-black/5 transition-transform will-change-transform cursor-grab",
        "hover:shadow-xl hover:-translate-y-0.5 hover:ring-2 hover:ring-indigo-200/80",
        isDragging && "opacity-80 shadow-2xl cursor-grabbing scale-105",
        "dark:bg-white/10 dark:border-white/10",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-foreground/90">{card.title}</div>
        {card.tag && (
          <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">{card.tag}</Badge>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={card.assignee?.avatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{card.assignee?.name}</span>
        </div>
        {card.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {new Date(card.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
