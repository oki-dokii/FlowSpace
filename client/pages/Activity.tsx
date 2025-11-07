import React, { useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, UserPlus, Clock, Loader2, User, Trash2, Edit3, Plus, Activity as ActivityIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { listActivities } from '@/lib/api-teams';
import { getSocket } from '@/lib/socket';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface Activity {
  _id: string;
  action: string;
  userId: any;
  entityType: string;
  createdAt: string;
}

export default function Activity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();

    // Listen for real-time updates
    const socket = getSocket();
    socket.on('activity:new', (activity: Activity) => {
      setActivities((prev) => [activity, ...prev]);
    });

    return () => {
      socket.off('activity:new');
    };
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await listActivities();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityStyle = (action: string) => {
    if (action.includes('created')) {
      return {
        icon: Plus,
        gradient: 'from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        glow: 'shadow-emerald-500/20'
      };
    } else if (action.includes('updated') || action.includes('edited')) {
      return {
        icon: Edit3,
        gradient: 'from-blue-500/20 to-indigo-500/20',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        glow: 'shadow-blue-500/20'
      };
    } else if (action.includes('deleted')) {
      return {
        icon: Trash2,
        gradient: 'from-red-500/20 to-pink-500/20',
        border: 'border-red-500/30',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400',
        glow: 'shadow-red-500/20'
      };
    } else if (action.includes('joined') || action.includes('invited')) {
      return {
        icon: UserPlus,
        gradient: 'from-violet-500/20 to-purple-500/20',
        border: 'border-violet-500/30',
        iconBg: 'bg-violet-500/20',
        iconColor: 'text-violet-400',
        glow: 'shadow-violet-500/20'
      };
    } else {
      return {
        icon: ActivityIcon,
        gradient: 'from-indigo-500/20 to-violet-500/20',
        border: 'border-indigo-500/30',
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-400',
        glow: 'shadow-indigo-500/20'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Elegant Header */}
        <div className="relative mb-8">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 blur-3xl" />
          
          <div className="relative flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30">
                <ActivityIcon className="h-8 w-8 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
                  Activity Feed
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  Real-time updates from your team • Everything syncs instantly
                </p>
              </div>
            </div>
            
            {/* Live Indicator */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/30"
            >
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Live
            </motion.div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
            <p className="text-white/60">Loading activities...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10"
              >
                <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 mb-6">
                  <Clock className="h-16 w-16 text-indigo-400/50" />
                </div>
                <h3 className="text-xl font-semibold text-white/80 mb-2">No Activity Yet</h3>
                <p className="text-white/50">Start working on your boards to see updates here!</p>
              </motion.div>
            ) : (
              activities.map((activity, index) => {
                const userName = activity.userId?.name || 'Someone';
                const avatarUrl = activity.userId?.avatarUrl;
                const style = getActivityStyle(activity.action);
                const Icon = style.icon;
                
                return (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br ${style.gradient} backdrop-blur-md border ${style.border} hover:shadow-xl hover:${style.glow} transition-all duration-300`}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Avatar with ring */}
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full ${style.iconBg} blur-md opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <Avatar className={`h-12 w-12 ring-2 ${style.border} relative z-10`}>
                        <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
                        <AvatarFallback className={`${style.iconBg} ${style.iconColor}`}>
                          {userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 relative z-10">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm leading-relaxed text-white/90">
                          <span className="font-bold text-white">{userName}</span>
                          {' '}
                          <span className="text-white/70">{activity.action}</span>
                        </p>
                        
                        {/* Icon Badge */}
                        <div className={`flex-shrink-0 p-2 rounded-lg ${style.iconBg} ${style.iconColor} border ${style.border}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
