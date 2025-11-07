import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { listBoards, createBoard } from "@/lib/api";
import InteractiveBoardCard from "@/components/visuals/InteractiveBoardCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import FloatingBackground from "@/components/visuals/FloatingBackground";
import confetti from "canvas-confetti";

export default function Boards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [boardData, setBoardData] = useState({ title: '', description: '' });

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await listBoards();
      setBoards(data.boards || []);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBoard(boardData);
      confetti({ particleCount: 100, spread: 70 });
      toast({ title: 'Board created!', description: 'Your new board is ready.' });
      setShowCreateDialog(false);
      setBoardData({ title: '', description: '' });
      loadBoards();
    } catch (err) {
      toast({ title: 'Failed to create board', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <FloatingBackground />
      
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Boards</h1>
            <p className="text-muted-foreground">Manage and organize your projects</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" className="rounded-full">
            <Plus className="mr-2 h-5 w-5" /> New Board
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <InteractiveBoardCard
              key={board._id}
              board={board}
              onOpen={() => navigate('/board')}
            />
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No boards yet. Create your first board!</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Board
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBoard} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Board Title</Label>
              <Input
                id="title"
                value={boardData.title}
                onChange={(e) => setBoardData({ ...boardData, title: e.target.value })}
                placeholder="My Project Board"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={boardData.description}
                onChange={(e) => setBoardData({ ...boardData, description: e.target.value })}
                placeholder="What's this board about?"
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">Create Board</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
