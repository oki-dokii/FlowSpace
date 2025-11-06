import { CheckCircle2, MessageSquare, UserPlus, Clock } from "lucide-react";

const feed = [
  {
    id: 1,
    icon: CheckCircle2,
    text: "Lia moved 'Design landing hero' to In Progress",
    time: "2m",
  },
  {
    id: 2,
    icon: MessageSquare,
    text: "Ana commented on 'Notes panel markdown'",
    time: "10m",
  },
  {
    id: 3,
    icon: UserPlus,
    text: "Ray invited Mia to Product team",
    time: "1h",
  },
  { id: 4, icon: Clock, text: "Automated backup completed", time: "3h" },
];

export default function Activity() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Activity</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Recent actions across your workspace.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {feed.map((f) => (
          <div
            key={f.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-white/20"
          >
            <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-600">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm">{f.text}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {f.time} ago
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
