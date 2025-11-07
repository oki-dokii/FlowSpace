import KanbanBoard from "@/components/kanban/KanbanBoard";
import { useRef, useState, useEffect } from "react";
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="relative container mx-auto px-6 py-8 overflow-hidden pb-24"
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 items-end z-50">
        <Button
          onClick={() => navigate('/invite')}
          variant="outline"
          size="lg"
          className="rounded-full backdrop-blur-xl bg-white/80 dark:bg-black/60 border-2 border-white/50 dark:border-white/20 shadow-2xl hover:scale-105 transition-transform h-14 px-6"
        >
          <Users className="mr-2 h-5 w-5" /> Invite Members
        </Button>
        
        <Button
          onClick={() => setShowCreateDialog(true)}
          size="lg"
          className="rounded-full h-16 px-8 shadow-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 hover:scale-110 transition-all text-lg"
        >
          <Plus className="mr-2 h-6 w-6" /> Create Board
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
