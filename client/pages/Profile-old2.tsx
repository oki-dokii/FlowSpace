import { useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail, Settings as SettingsIcon, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listActivities } from '@/lib/api-teams';
import { formatDistanceToNow } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-indigo-500/20">
            <AvatarImage src="https://i.pravatar.cc/120?img=12" />
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{user?.name || 'User'}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                  </Button>
                </Link>
              </div>
            </div>

            <p className="mt-4 text-sm">
              Collaborative workspace member using FlowSpace for project management
              and team coordination.
            </p>

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Member since 2024</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/20 pt-4">
          <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((activity) => (
                <li key={activity._id} className="text-sm text-muted-foreground">
                  {activity.action} •{' '}
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
