import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Bell, Layout, Trash2, Download, Save, LogOut, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user, logout, accessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        toast({
          title: 'Settings saved!',
          description: 'Your profile has been updated.',
        });
        // Reload page to get updated user data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast({
        title: 'Failed to save settings',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/user/export', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flowspace-data.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast({
          title: 'Data exported!',
          description: 'Your data has been downloaded.',
        });
      }
    } catch (err) {
      toast({
        title: 'Export failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Account deleted',
          description: 'Your account has been permanently deleted.',
        });
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      toast({
        title: 'Deletion failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'See you again soon!',
      });
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage your account preferences and workspace behavior.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <section className="p-6 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/30 shadow-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              Profile Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 h-11"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-11"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/30 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified about activity in your workspace
                </p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </section>

          {/* Compact Mode */}
          <section className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/30 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <Layout className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Compact Layout</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing for denser information display
                </p>
              </div>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </section>

          {/* Danger Zone */}
          <section className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-200 dark:border-red-800 shadow-lg">
            <h3 className="font-semibold text-lg text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <span className="text-xl">⚠️</span> Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-6">
              Irreversible actions - proceed with caution
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                className="rounded-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {exporting ? 'Exporting...' : 'Export Data'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full"
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {deleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
