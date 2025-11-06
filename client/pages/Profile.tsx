import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail, Settings as SettingsIcon, User, Loader2, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listActivities } from '@/lib/api-teams';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function Profile() {
  const { user, accessToken } = useAuth();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || 'https://i.pravatar.cc/120?img=12');
  const { toast } = useToast();

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const data = await listActivities();
      setRecentActivity((data.activities || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Upload to server
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatarUrl);
        toast({
          title: 'Profile picture updated!',
          description: 'Your avatar has been changed.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-xl">
        <div className="flex items-start gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </label>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
                  {user?.name || 'User'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="rounded-full hover:scale-105 transition-transform">
                  <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Collaborative workspace member using FlowSpace for project management
              and team coordination. Active contributor with real-time collaboration.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span className="text-indigo-900 dark:text-indigo-100">{user?.email || 'user@example.com'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                <User className="h-4 w-4 text-violet-500" />
                <span className="text-violet-900 dark:text-violet-100">Member since 2024</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Recent Activity
          </h4>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((activity) => (
                <li
                  key={activity._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/40 dark:bg-white/5 border border-white/20 hover:shadow-md transition-shadow"
                >
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
