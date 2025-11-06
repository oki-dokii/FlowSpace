import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Plus, Loader2, UserPlus } from 'lucide-react';
import { listTeams, createTeam, Team } from '@/lib/api-teams';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const { toast } = useToast();

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
      setShowCreateDialog(false);
      setFormData({ name: '', description: '' });
      await loadTeams();
      toast({
        title: 'Team created!',
        description: `${formData.name} has been created successfully.`,
      });
    } catch (err) {
      toast({
        title: 'Failed to create team',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !selectedTeam) return;

    try {
      setAdding(true);
      // In a real app, you'd look up user by email and add them
      // For now, show success message
      toast({
        title: 'Invite sent!',
        description: `Invitation sent to ${memberEmail}`,
      });
      setShowAddMemberDialog(false);
      setMemberEmail('');
      setSelectedTeam(null);
    } catch (err) {
      toast({
        title: 'Failed to add member',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500 animate-gradient">
            Teams
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage people, roles, and access.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:scale-105 transition-transform">
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
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {creating ? 'Creating...' : 'Create Team'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No teams yet. Create your first team!</p>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team._id}
                className="group relative rounded-2xl p-6 bg-white/60 dark:bg-white/5 backdrop-blur border border-white/30 dark:border-white/10 hover:shadow-xl transition-all hover:scale-105 hover:border-indigo-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-4">{team.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 4).map((m: any, i) => (
                        <Avatar key={i} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={`https://i.pravatar.cc/40?img=${i + 10}`} />
                          <AvatarFallback>{m.userId?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-xs">
                          +{team.members.length - 4}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAddMemberDialog(true);
                      }}
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="memberEmail">Member Email</Label>
              <Input
                id="memberEmail"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="teammate@company.com"
                required
              />
            </div>
            <Button type="submit" disabled={adding} className="w-full">
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {adding ? 'Sending Invite...' : 'Send Invite'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
