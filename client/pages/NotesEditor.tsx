import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useBoard } from '@/contexts/BoardContext';
import { getSocket } from '@/lib/socket';
import { getNote, updateNote as updateNoteAPI } from '@/lib/api';

export default function NotesEditor() {
  const navigate = useNavigate();
  const { currentBoard } = useBoard();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId') || currentBoard?._id;
  const [value, setValue] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!boardId) {
      navigate('/board');
      return;
    }

    loadNote();

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('note:update', (note: any) => {
      if (note.boardId === boardId) {
        setValue(note.content || '');
        setSyncing(false);
      }
    });

    socket.on('note:update:ok', () => {
      setSyncing(false);
    });

    return () => {
      socket.off('note:update');
      socket.off('note:update:ok');
    };
  }, [boardId]);

  const loadNote = async () => {
    if (!boardId) return;
    try {
      setIsLoading(true);
      const data = await getNote(boardId);
      setValue(data.note?.content || '# Start writing your notes here...\n\n');
    } catch (err) {
      console.error('Failed to load note:', err);
      setValue('# Start writing your notes here...\n\n');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!boardId) return;
    
    setSyncing(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    
    timeoutRef.current = window.setTimeout(() => {
      const socket = socketRef.current;
      if (socket) {
        socket.emit('note:update', {
          boardId,
          content: value,
        });
      }
    }, 1000);
    
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, boardId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/board')}
                variant="ghost"
                size="sm"
                className="rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Board
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Notes Editor</h1>
                <p className="text-xs text-muted-foreground">Full-screen editing mode</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="container mx-auto px-6 py-8">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-[calc(100vh-200px)] p-8 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur border border-white/30 dark:border-white/10 resize-none outline-none text-base font-mono leading-relaxed shadow-lg"
          placeholder="Start typing your notes here...\n\nSupports Markdown:\n- # Headings\n- **Bold** and *Italic*\n- Lists\n- And more!"
        />
      </div>
    </div>
  );
}
