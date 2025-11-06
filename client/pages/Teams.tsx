import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const teams = [
  {
    id: "t1",
    name: "Product",
    members: [
      "https://i.pravatar.cc/40?img=3",
      "https://i.pravatar.cc/40?img=12",
      "https://i.pravatar.cc/40?img=7",
    ],
  },
  {
    id: "t2",
    name: "Design",
    members: [
      "https://i.pravatar.cc/40?img=21",
      "https://i.pravatar.cc/40?img=14",
    ],
  },
  {
    id: "t3",
    name: "Engineering",
    members: [
      "https://i.pravatar.cc/40?img=24",
      "https://i.pravatar.cc/40?img=30",
      "https://i.pravatar.cc/40?img=5",
    ],
  },
];

export default function Teams() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage people, roles, and access.
          </p>
        </div>
        <Button variant="default" size="sm" className="rounded-full">
          <Users className="mr-2 h-4 w-4" /> New Team
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/30"
          >
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">{team.name}</div>
              <div className="flex -space-x-2">
                {team.members.map((m, i) => (
                  <Avatar key={i} className="h-8 w-8">
                    <AvatarImage src={m} />
                    <AvatarFallback>{team.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">3 members</div>
          </div>
        ))}
      </div>
    </div>
  );
}
