import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [boardInfo, setBoardInfo] = useState<any>(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    // Accept the invite
    acceptInvite();
  }, [authLoading, isAuthenticated, token]);

  const acceptInvite = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invite link');
      return;
    }

    try {
      setStatus('loading');
      
      // Use relative URL to work in both dev and production (through proxy)
      const response = await fetch(`/api/invite/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept invite');
      }

      setStatus('success');
      setMessage(data.message || 'Invite accepted successfully!');
      setBoardInfo(data.board);

      toast({
        title: 'Success!',
        description: 'You can now collaborate on this board',
      });

      // Redirect to the board after 2 seconds
      setTimeout(() => {
        if (data.board?._id) {
          navigate(`/board`);
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to accept invite');
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept invite',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white mb-6">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Accepting Invite...</h2>
              <p className="text-gray-400">Please wait while we add you to the board</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500 text-white mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Invite Accepted!</h2>
              <p className="text-gray-400 mb-4">{message}</p>
              {boardInfo && (
                <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-indigo-400" />
                    <div className="text-left">
                      <p className="text-white font-medium">{boardInfo.title}</p>
                      {boardInfo.description && (
                        <p className="text-sm text-gray-400">{boardInfo.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-6">Redirecting to board...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-500 text-white mb-6">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Invite Error</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
              >
                Go to Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
