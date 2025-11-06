import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Layout, Trash2, Download } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your data export will be ready soon.',
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      toast({
        title: 'Account deletion',
        description: 'This is a demo. Account deletion is disabled.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage account preferences and workspace behavior.
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
          >
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <section className="p-4 rounded-lg bg-white/80 dark:bg-white/7 border border-white/20">
            <h3 className="font-medium mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-white/7 border border-white/20">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified about activity in your workspace.
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </section>

          {/* Compact Mode */}
          <section className="flex items-center justify-between p-4 rounded-lg bg-white/80 dark:bg-white/7 border border-white/20">
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="font-medium">Compact Layout</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for dense views.
                </p>
              </div>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </section>

          {/* Danger Zone */}
          <section className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <h3 className="font-medium text-red-900 dark:text-red-100 mb-1">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Account removal and data export.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="rounded-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="rounded-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
