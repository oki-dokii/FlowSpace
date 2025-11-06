import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Save, Type } from "lucide-react";

const users = [
  {
    id: "1",
    name: "Lia",
    color: "#8b5cf6",
    avatar: "https://i.pravatar.cc/96?img=32",
  },
  {
    id: "2",
    name: "Ray",
    color: "#6366f1",
    avatar: "https://i.pravatar.cc/96?img=14",
  },
  {
    id: "3",
    name: "Ana",
    color: "#06b6d4",
    avatar: "https://i.pravatar.cc/96?img=24",
  },
];

export function NotesPanel() {
  const [value, setValue] = useState<string>(
    `# Project Notes\n\n- Use dnd-kit for drag & drop\n- Keep UI glassy and minimal\n- Add confetti when tasks are Done 🎉`,
  );
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (editing) {
      setSyncing(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setSyncing(false);
        setEditing(false);
      }, 800);
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, editing]);

  const preview = useMemo(() => markdownToHtml(value), [value]);

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
          <div className="flex -space-x-2">
            {users.map((u) => (
              <Avatar
                key={u.id}
                className="h-6 w-6 ring-2 ring-white/60 dark:ring-white/10"
              >
                <AvatarImage src={u.avatar} />
                <AvatarFallback>{u.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className={cn(
              "rounded-full bg-white/80 dark:bg-white/10 border border-white/40 dark:border-white/10",
              syncing ? "animate-pulse" : "",
            )}
          >
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {syncing ? "Syncing" : "Synced"}
          </Button>
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
