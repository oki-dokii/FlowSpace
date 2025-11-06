import { Link } from "react-router-dom";
import FloatingBackground from "@/components/visuals/FloatingBackground";
import IndexPreview from "@/components/visuals/IndexPreview";

export default function Index() {
  return (
    <div className="relative min-h-[calc(100vh-64px-40px)] overflow-hidden">
      <FloatingBackground />

      <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500">
              FlowSpace
            </span>
            <br />
            Collaborate visually, write freely.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">
            A sleek, real-time collaborative Kanban + Notes workspace — modern
            design, smooth effects, and intuitive UX.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/board"
              className="rounded-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/boards"
              className="rounded-full px-6 py-3 border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur"
            >
              Explore Boards
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-white/5">
              Share with your team — real-time cursors & live sync
            </div>
            <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-white/5">
              Subtle confetti on Done 🎉
            </div>
          </div>
        </div>

        <div className="relative">
          <IndexPreview />

          <div className="mt-6 flex items-center justify-center gap-4">
            <button className="rounded-full px-4 py-2 bg-white/10 backdrop-blur text-sm">
              Preview Live
            </button>
            <Link
              to="/boards"
              className="rounded-full px-4 py-2 bg-white/6 backdrop-blur text-sm"
            >
              View all boards
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <div className="text-xs text-muted-foreground">
          Built with ❤️ at Mernify Hackathon
        </div>
      </div>
    </div>
  );
}
