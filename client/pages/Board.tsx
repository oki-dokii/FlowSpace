import GlassyKanbanBoard from "@/components/kanban/GlassyKanbanBoard";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { Button } from "@/components/ui/button";
import { Plus, Users, Loader2 } from "lucide-react";
import FloatingBackground from "@/components/visuals/FloatingBackground";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBoard } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBoard } from "@/contexts/BoardContext";
import confetti from "canvas-confetti";

export default function Board() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: boardLoading } = useBoard();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [boardData, setBoardData] = useState({ title: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", String(x));
    el.style.setProperty("--my", String(y));
  }

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBoard(boardData);
      confetti({ particleCount: 100, spread: 70 });
      toast({ title: 'Board created!', description: 'Your new board is ready.' });
      setShowCreateDialog(false);
      setBoardData({ title: '', description: '' });
      window.location.reload();
    } catch (err) {
      toast({ title: 'Failed to create board', variant: 'destructive' });
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { sendInvite } = await import('@/lib/api-teams');
      await sendInvite({ email: inviteEmail });
      toast({ title: 'Invite sent!', description: `Invitation sent to ${inviteEmail}` });
      setShowInviteDialog(false);
      setInviteEmail('');
    } catch (err) {
      toast({ title: 'Failed to send invite', variant: 'destructive' });
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading state while checking authentication
  if (authLoading || boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kanban Board - Takes half width on large screens */}
          <div className="lg:col-span-1">
            <GlassyKanbanBoard />
          </div>

          {/* Notes Panel - Takes half width on large screens */}
          <div className="lg:col-span-1">
            <NotesPanel />
          </div>
        </div>
      </div>

      {/* Floating Action Buttons - Better positioned */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <Button
          onClick={() => navigate('/invite')}
          size="lg"
          className="rounded-full backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all h-12 px-5"
        >
          <Users className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Invite Members</span>
          <span className="sm:hidden">Invite</span>
        </Button>
        
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="lg"
          className="rounded-full h-14 px-6 shadow-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 hover:shadow-2xl hover:scale-110 transition-all"
        >
          <Plus className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Create Board</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Create Board Dialog */}
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
