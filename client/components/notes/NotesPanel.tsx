import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Save, Type, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBoard } from "@/contexts/BoardContext";
import { getSocket } from "@/lib/socket";
import { getNote, updateNote as updateNoteAPI } from "@/lib/api";

export function NotesPanel() {
  const { currentBoard } = useBoard();
  const navigate = useNavigate();
  const [value, setValue] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!currentBoard) return;

    // Load note
    loadNote();

    // Setup socket
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("note:update", (note: any) => {
      if (note.boardId === currentBoard._id) {
        setValue(note.content || "");
        setSyncing(false);
      }
    });

    socket.on("note:update:ok", () => {
      setSyncing(false);
      setEditing(false);
    });

    return () => {
      socket.off("note:update");
      socket.off("note:update:ok");
    };
  }, [currentBoard]);

  const loadNote = async () => {
    if (!currentBoard) return;
    try {
      setIsLoading(true);
      const data = await getNote(currentBoard._id);
      setValue(data.note?.content || `# ${currentBoard.title} Notes\n\nStart writing your notes here...`);
    } catch (err) {
      console.error("Failed to load note:", err);
      setValue(`# ${currentBoard.title} Notes\n\nStart writing your notes here...`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editing && currentBoard) {
      setSyncing(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      
      timeoutRef.current = window.setTimeout(() => {
        // Emit via socket for real-time sync
        const socket = socketRef.current;
        if (socket) {
          socket.emit("note:update", {
            boardId: currentBoard._id,
            content: value,
          });
        }
      }, 1000); // Debounce 1 second
    }
    
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, editing, currentBoard]);

  const preview = useMemo(() => markdownToHtml(value), [value]);

  const members = useMemo(() => {
    if (!currentBoard?.members) return [];
    return currentBoard.members.slice(0, 3).map((m, i) => ({
      id: m.userId._id || m.userId,
      name: m.userId.name || `User ${i + 1}`,
      avatar: `https://i.pravatar.cc/96?img=${20 + i}`,
    }));
  }, [currentBoard]);

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-full rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-white/30 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/30 dark:border-white/10 bg-gradient-to-r from-white/70 to-white/30 dark:from-white/5 dark:to-white/0">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-medium">Shared Notes</span>
          {editing && (
            <span className="text-xs text-muted-foreground">editing…</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {members.length > 0 && (
            <div className="flex -space-x-2">
              {members.map((u) => (
                <Avatar
                  key={u.id}
                  className="h-6 w-6 ring-2 ring-white/60 dark:ring-white/10"
                >
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/notes-editor?boardId=${currentBoard._id}`)}
              className="rounded-full"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Full Editor
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "rounded-full bg-white/80 dark:bg-white/10 border border-white/40 dark:border-white/10",
                syncing ? "animate-pulse" : ""
              )}
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Synced
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-0 h-[520px]">
        <textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setEditing(true);
          }}
          className="resize-none p-4 bg-transparent outline-none text-sm font-mono border-r border-white/30 dark:border-white/10"
          placeholder="Start typing your notes..."
        />
        <div
          className="p-4 overflow-auto prose prose-sm md:prose-base dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </div>

      <div className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/90 text-white text-xs px-3 py-1 shadow-lg animate-[pulse_2s_ease-in-out_infinite]">
        <CheckCircle2 className="h-4 w-4" /> Live
      </div>
    </div>
  );
}

function markdownToHtml(src: string) {
  let s = src;
  s = s.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  s = s.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  s = s.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  s = s.replace(/^\s*\- (.*$)/gim, "<li>$1</li>");
  s = s.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  s = s.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  s = s.replace(/\n\n/g, "<br/>");
  // Wrap standalone <li> with <ul>
  s = s.replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>");
  return s.trim();
}
