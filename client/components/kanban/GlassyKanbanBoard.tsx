import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Sparkles, ListTodo, Clock, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBoard } from '@/contexts/BoardContext';
import { useAuth } from '@/contexts/AuthContext';
import { createCard as createCardAPI, updateCard as updateCardAPI, deleteCard as deleteCardAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { CardDialog } from './CardDialog';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

type ColumnId = string;

interface CardType {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  tags?: string[];
  dueDate?: string;
  order: number;
}

const getColumnConfig = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('progress') || lowerTitle === 'in progress') {
    return {
      icon: Clock,
      gradient: 'from-violet-500/20 via-violet-400/10 to-transparent',
      borderColor: 'border-violet-500/30',
      glowColor: 'shadow-violet-500/20',
      iconColor: 'text-violet-400',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-400/30'
    };
  } else if (lowerTitle.includes('review')) {
    return {
      icon: Sparkles,
      gradient: 'from-amber-500/20 via-amber-400/10 to-transparent',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/20',
      iconColor: 'text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
    };
  } else if (lowerTitle.includes('done') || lowerTitle.includes('complete')) {
    return {
      icon: CheckCircle2,
      gradient: 'from-green-500/20 via-green-400/10 to-transparent',
      borderColor: 'border-green-500/30',
      glowColor: 'shadow-green-500/20',
      iconColor: 'text-green-400',
      badgeColor: 'bg-green-500/20 text-green-300 border-green-400/30'
    };
  } else {
    // Default to "To Do" style
    return {
      icon: ListTodo,
      gradient: 'from-blue-500/20 via-blue-400/10 to-transparent',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
      iconColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
    };
  }
};

export default function GlassyKanbanBoard() {
  const { currentBoard, cards: boardCards, setCards } = useBoard();
  const { user } = useAuth();
  const [cards, setLocalCards] = useState<CardType[]>([]);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentColumnId, setCurrentColumnId] = useState<string>('');
  const [editingCard, setEditingCard] = useState<CardType | null>(null);

  useEffect(() => {
    if (boardCards) {
      setLocalCards(boardCards as CardType[]);
    }
  }, [boardCards]);

  const columns = useMemo(() => {
    if (!currentBoard?.columns) return [];
    return currentBoard.columns
      .sort((a: any, b: any) => a.order - b.order)
      .map((col: any) => ({
        id: col._id,
        title: col.title,
      }));
  }, [currentBoard]);

  const byColumn = useMemo(() => {
    return cards.reduce((acc, card) => {
      if (!acc[card.columnId]) acc[card.columnId] = [];
      acc[card.columnId].push(card);
      return acc;
    }, {} as Record<string, CardType[]>);
  }, [cards]);

  const handleCreateCard = (columnId: string) => {
    setCurrentColumnId(columnId);
    setDialogMode('create');
    setEditingCard(null);
    setDialogOpen(true);
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSaveCard = async (data: { title: string; description: string; tags: string[] }) => {
    if (!currentBoard || !user) return;

    try {
      if (dialogMode === 'create') {
        const response = await createCardAPI(currentBoard._id, {
          columnId: currentColumnId,
          title: data.title,
          description: data.description,
          tags: data.tags,
          createdBy: user.id,
        });
        setLocalCards((prev) => [...prev, response.card]);
        const socket = getSocket();
        socket.emit('card:create', response.card);
      } else if (editingCard) {
        const response = await updateCardAPI(editingCard._id, data);
        setLocalCards((prev) => prev.map(c => c._id === editingCard._id ? response.card : c));
        const socket = getSocket();
        socket.emit('card:update', response.card);
      }
    } catch (err) {
      console.error('Failed to save card:', err);
    }
  };

  const handleDeleteCard = async () => {
    if (!editingCard) return;

    try {
      await deleteCardAPI(editingCard._id);
      setLocalCards((prev) => prev.filter(c => c._id !== editingCard._id));
      const socket = getSocket();
      socket.emit('card:delete', editingCard._id);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c._id === event.active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const cardId = active.id as string;
    const targetColumnId = over.id as string;

    const card = cards.find((c) => c._id === cardId);
    if (!card) return;

    const oldColumnId = card.columnId;
    const newColumnId = columns.find((col) => col.id === targetColumnId)?.id || targetColumnId;

    if (oldColumnId === newColumnId) return;

    // Confetti for Done column
    const doneColumn = columns.find(col => col.title.toLowerCase() === 'done');
    if (doneColumn && newColumnId === doneColumn.id) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }

    setLocalCards((prev) =>
      prev.map((c) => (c._id === cardId ? { ...c, columnId: newColumnId } : c))
    );

    const socket = getSocket();
    socket.emit('card:move', { cardId, columnId: newColumnId });
  };

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {columns.map((col, index) => {
              const config = getColumnConfig(col.title);
              return (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <GlassColumn
                    id={col.id}
                    title={col.title}
                    icon={config.icon}
                    gradient={config.gradient}
                    borderColor={config.borderColor}
                    glowColor={config.glowColor}
                    iconColor={config.iconColor}
                    badgeColor={config.badgeColor}
                    items={byColumn[col.id] || []}
                    onCreateCard={handleCreateCard}
                    onEditCard={handleEditCard}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </DndContext>

      <CardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        card={editingCard}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        mode={dialogMode}
      />
    </>
  );
}

function GlassColumn({
  id,
  title,
  icon: Icon,
  gradient,
  borderColor,
  glowColor,
  iconColor,
  badgeColor,
  items,
  onCreateCard,
  onEditCard,
}: {
  id: string;
  title: string;
  icon: any;
  gradient: string;
  borderColor: string;
  glowColor: string;
  iconColor: string;
  badgeColor: string;
  items: CardType[];
  onCreateCard: (id: string) => void;
  onEditCard: (card: CardType) => void;
}) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative rounded-2xl p-4 aspect-[3/4] flex flex-col',
        'bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl',
        'border shadow-2xl transition-all duration-500',
        'hover:shadow-3xl hover:scale-[1.02]',
        borderColor,
        glowColor
      )}
    >
      {/* Glass shimmer effect */}
      <div className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-30', gradient)} />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', iconColor)} />
          <h3 className="font-bold text-white/90">{title}</h3>
        </div>
        <Badge className={cn('px-2 py-0.5 border', badgeColor)}>
          {items.length}
        </Badge>
      </div>

      {/* Cards */}
      <SortableContext items={items.map((c) => c._id)} strategy={verticalListSortingStrategy}>
        <div className="relative flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          <AnimatePresence>
            {items.map((card, index) => (
              <motion.div
                key={card._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard card={card} onEdit={() => onEditCard(card)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      {/* Add Card Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 mt-3"
      >
        <Button
          onClick={() => onCreateCard(id)}
          className={cn(
            'w-full bg-white/5 hover:bg-white/10 border text-white/80',
            'backdrop-blur-lg transition-all duration-300',
            'hover:shadow-lg group',
            borderColor
          )}
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add Card
        </Button>
      </motion.div>
    </div>
  );
}

function CardFooter({ card }: { card: CardType }) {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center justify-between pt-2 border-t border-white/10">
      <Avatar className="h-6 w-6 ring-2 ring-white/20">
        <AvatarImage src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-violet-500">
          {user?.name?.substring(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {card.dueDate && (
        <div className="flex items-center gap-1 text-xs text-white/50">
          <Calendar className="h-3 w-3" />
          {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}

function GlassCard({ card, onEdit }: { card: CardType; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      whileHover={{ scale: 1.03, y: -4 }}
      className={cn(
        'group relative rounded-xl p-4',
        'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md',
        'border border-white/10 shadow-lg',
        'hover:shadow-2xl hover:border-white/20',
        'transition-all duration-300',
        isDragging && 'opacity-50 scale-105 rotate-2'
      )}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 to-violet-500/0 group-hover:from-indigo-500/10 group-hover:to-violet-500/10 transition-all duration-300" />
      
      {/* Drag Handle */}
      <div {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      
      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-white/90 line-clamp-2 flex-1">
            {card.title}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-indigo-500/20 relative z-20"
          >
            <Edit className="h-3.5 w-3.5 text-indigo-300" />
          </Button>
        </div>

        {card.description && (
          <p className="text-xs text-white/60 line-clamp-2">{card.description}</p>
        )}

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 2).map((tag, i) => (
              <Badge
                key={i}
                className="text-xs px-2 py-0 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <CardFooter card={card} />
      </div>
    </motion.div>
  );
}
