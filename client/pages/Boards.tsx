import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FloatingBackground from "@/components/visuals/FloatingBackground";
import InteractiveBoardCard from "@/components/visuals/InteractiveBoardCard";
import confetti from "canvas-confetti";

const sampleBoards = [
  {
    id: "b1",
    title: "Product Roadmap",
    description: "Company-wide initiatives",
    columns: 4,
  },
  {
    id: "b2",
    title: "Marketing Sprint",
    description: "Campaign tasks & assets",
    columns: 3,
  },
  {
    id: "b3",
    title: "Design System",
    description: "Components & tokens",
    columns: 5,
  },
  {
    id: "b4",
    title: "Hackathon Ideas",
    description: "Rapid prototypes",
    columns: 4,
  },
];

export default function Boards() {
  const navigate = useNavigate();

  const onCreate = useCallback(() => {
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    // navigate to create flow (for demo, go to /board)
    setTimeout(() => navigate("/board"), 300);
  }, [navigate]);

  return (
    <div className="relative container mx-auto px-6 py-10">
      <FloatingBackground />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold">Boards</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visual workspaces for projects and teams.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onCreate}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> New Board
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleBoards.map((b) => (
          <InteractiveBoardCard
            key={b.id}
            board={b}
            onOpen={() => navigate("/board")}
          />
        ))}
      </div>
    </div>
  );
}
