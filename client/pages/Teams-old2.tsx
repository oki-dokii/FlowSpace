import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Plus, Loader2 } from 'lucide-react';
import { listTeams, createTeam, Team } from '@/lib/api-teams';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await listTeams();
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setCreating(true);
      await createTeam(formData);
      setShowDialog(false);
      setFormData({ name: '', description: '' });
      await loadTeams();
    } catch (err) {
      console.error('Failed to create team:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage people, roles, and access.
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="rounded-full">
              <Users className="mr-2 h-4 w-4" /> New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product Team"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this team do?"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {teams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teams yet. Create your first team!</p>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/30"
              >
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold">{team.name}</div>
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 3).map((m: any, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-white">
                        <AvatarImage src={`https://i.pravatar.cc/40?img=${i + 10}`} />
                        <AvatarFallback>{m.userId.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
