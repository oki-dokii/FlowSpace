import React, { useMemo, useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Plus } from "lucide-react";
import confetti from "canvas-confetti";
import { useBoard } from "@/contexts/BoardContext";
import { useAuth } from "@/contexts/AuthContext";
import { getSocket } from "@/lib/socket";
import { Card as CardType, listCards, createCard, updateCard } from "@/lib/api";
import { Button } from "@/components/ui/button";

export type ColumnId = string;

export default function KanbanBoard() {
  const { currentBoard } = useBoard();
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  useEffect(() => {
    if (!currentBoard) return;

    // Fetch cards
    loadCards();

    // Setup socket listeners
    const socket = getSocket();

    socket.on("card:create", (card: CardType) => {
      setCards((prev) => [...prev, card]);
    });

    socket.on("card:update", (card: CardType) => {
      setCards((prev) => prev.map((c) => (c._id === card._id ? card : c)));
    });

    socket.on("card:delete", ({ id }: { id: string }) => {
      setCards((prev) => prev.filter((c) => c._id !== id));
    });

    return () => {
      socket.off("card:create");
      socket.off("card:update");
      socket.off("card:delete");
    };
  }, [currentBoard]);

  const loadCards = async () => {
    if (!currentBoard) return;
    try {
      setIsLoading(true);
      const data = await listCards(currentBoard._id);
      setCards(data.cards || []);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => {
    if (!currentBoard) return [];
    return currentBoard.columns
      .sort((a, b) => a.order - b.order)
      .map((col) => ({
        id: col._id,
        title: col.title,
      }));
  }, [currentBoard]);

  const byColumn = useMemo(() => {
    if (!currentBoard) return {};
    return currentBoard.columns.reduce<Record<string, CardType[]>>(
      (acc, col) => {
        acc[col._id] = cards.filter((c) => c.columnId === col._id);
        return acc;
      },
      {}
    );
  }, [cards, currentBoard]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    const card = cards.find((c) => c._id === activeId);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    
    if (!over || !currentBoard) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Check if dropping on a column header
    const isColumnDrop = columns.some((col) => col.id === overId);

    if (isColumnDrop) {
      const newColumnId = overId;
      const card = cards.find((c) => c._id === activeId);
      if (!card || card.columnId === newColumnId) return;

      // Optimistic update
      setCards((prev) =>
        prev.map((c) => (c._id === activeId ? { ...c, columnId: newColumnId } : c))
      );

      // Trigger confetti if moving to last column (Done)
      const isDoneColumn = columns[columns.length - 1]?.id === newColumnId;
      if (isDoneColumn) triggerConfetti();

      // Update via socket
      const socket = getSocket();
      socket.emit("card:update", {
        id: activeId,
        updates: { columnId: newColumnId },
        updatedBy: user?.id,
      });

      return;
    }

    // Reordering within or between columns
    const activeCard = cards.find((c) => c._id === activeId);
    const overCard = cards.find((c) => c._id === overId);
    if (!activeCard || !overCard) return;

    if (activeCard.columnId !== overCard.columnId) {
      // Moving to different column
      setCards((prev) =>
        prev.map((c) =>
          c._id === activeId ? { ...c, columnId: overCard.columnId } : c
        )
      );

      const isDoneColumn = columns[columns.length - 1]?.id === overCard.columnId;
      if (isDoneColumn) triggerConfetti();

      const socket = getSocket();
      socket.emit("card:update", {
        id: activeId,
        updates: { columnId: overCard.columnId },
        updatedBy: user?.id,
      });
    } else {
      // Reordering in same column
      const colId = activeCard.columnId;
      const colItems = byColumn[colId] || [];
      const oldIndex = colItems.findIndex((c) => c._id === activeId);
      const newIndex = colItems.findIndex((c) => c._id === overId);
      const reordered = arrayMove(colItems, oldIndex, newIndex);
      const otherCards = cards.filter((c) => c.columnId !== colId);
      setCards([...otherCards, ...reordered]);
    }
  };

  const handleCreateCard = async (columnId: string) => {
    if (!currentBoard) {
      console.error("No current board available");
      return;
    }
    
    if (!user) {
      console.error("No user logged in");
      return;
    }
    
    console.log("Creating card for column:", columnId, "board:", currentBoard._id);
    
    const newCardData = {
      columnId,
      title: "New Task",
      description: "",
      tags: [],
      createdBy: user.id,
    };

    try {
      // Create card via API with correct parameters
      console.log("Calling createCard API...");
      const response = await createCard(currentBoard._id, newCardData);
      console.log("Card created successfully:", response);
      
      // Also emit via socket for real-time update to other users
      const socket = getSocket();
      socket.emit("card:create", response.card);
      
      // Add to local state immediately
      setCards((prev) => [...prev, response.card]);
    } catch (err) {
      console.error("Failed to create card - Full error:", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
    }
  };

  function triggerConfetti() {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.3 } });
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {columns.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            items={byColumn[col.id] || []}
            onCreateCard={handleCreateCard}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? (
          <div className="rounded-xl p-3 bg-white shadow-2xl border border-primary/50 rotate-3 scale-105">
            <div className="text-sm font-medium text-foreground/90">
              {activeCard.title}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  id,
  title,
  items,
  onCreateCard,
}: {
  id: ColumnId;
  title: string;
  items: CardType[];
  onCreateCard: (columnId: string) => void;
}) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl p-3 bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg h-[600px] flex flex-col"
    >
      <div className="flex items-center justify-between px-1 pb-3 mb-2">
        <h3 className="font-semibold text-sm tracking-wide text-foreground/90">
          {title}
        </h3>
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          {items.length}
        </Badge>
      </div>

      <SortableContext
        items={items.map((c) => c._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar pb-2">
          {items.map((card) => (
            <KanbanCard key={card._id} card={card} />
          ))}
        </div>
      </SortableContext>

      <Button
        onClick={() => onCreateCard(id)}
        variant="ghost"
        size="sm"
        className="w-full mt-3 text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/10 transition-all flex-shrink-0"
        data-testid="add-card-button"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Card
      </Button>
    </div>
  );
}

function KanbanCard({ card }: { card: CardType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tz: 0 });

  const baseTransform = CSS.Transform.toString(transform);
  const style: any = {
    transform: `${baseTransform} translateZ(${tilt.tz}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
    transition: isDragging ? transition : `${transition}, transform 0.3s ease-out`,
  };

  function handleMove(e: React.MouseEvent) {
    if (isDragging) return;
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - el.left) / el.width - 0.5;
    const y = (e.clientY - el.top) / el.height - 0.5;
    setTilt({
      rx: Math.max(-6, Math.min(6, -y * 8)),
      ry: Math.max(-8, Math.min(8, x * 10)),
      tz: 8,
    });
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
        "rounded-xl p-4 bg-white shadow-md border border-black/5 will-change-transform cursor-grab touch-none transition-all aspect-square flex flex-col justify-between",
        "hover:shadow-xl hover:ring-2 hover:ring-primary/30 hover:border-primary/20 hover:-translate-y-1",
        "dark:bg-white/10 dark:border-white/10",
        isDragging && "opacity-50 cursor-grabbing scale-105 shadow-2xl ring-4 ring-primary/40"
      )}
    >
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="text-sm font-bold text-foreground flex-1 leading-tight line-clamp-2">
            {card.title}
          </div>
          {card.tags && card.tags.length > 0 && (
            <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 text-xs px-2 py-0.5 flex-shrink-0">
              {card.tags[0]}
            </Badge>
          )}
        </div>
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
            {card.description}
          </p>
        )}
      </div>
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-black/5 dark:border-white/10">
        <Avatar className="h-6 w-6 ring-2 ring-white/50">
          <AvatarImage src={`https://i.pravatar.cc/96?img=${Math.floor(Math.random() * 50)}`} />
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
        {card.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}
