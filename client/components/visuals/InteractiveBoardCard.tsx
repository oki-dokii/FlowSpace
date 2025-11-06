import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function InteractiveBoardCard({
  board,
  onOpen,
}: {
  board: any;
  onOpen?: () => void;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tz: 0 });

  function handleMove(e: React.MouseEvent) {
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - el.left) / el.width - 0.5;
    const y = (e.clientY - el.top) / el.height - 0.5;
    setTilt({
      rx: Math.max(-6, Math.min(6, -y * 8)),
      ry: Math.max(-8, Math.min(8, x * 12)),
      tz: 12,
    });
  }
  function handleLeave() {
    setTilt({ rx: 0, ry: 0, tz: 0 });
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={() => onOpen && onOpen()}
      whileHover={{ scale: 1.03 }}
      className={cn(
        "relative cursor-pointer rounded-2xl p-5 bg-white/60 dark:bg-white/5 backdrop-blur border border-white/20 hover:shadow-2xl transition-transform",
        "transform-gpu",
      )}
      style={{
        transform: `perspective(1000px) translateZ(${tilt.tz}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{board.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {board.description}
          </div>
        </div>
        <div className="flex -space-x-2">
          <Avatar className="h-8 w-8">
            <img
              src="https://i.pravatar.cc/40?img=3"
              alt=""
              className="h-full w-full rounded-full"
            />
          </Avatar>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 h-24">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-2 bg-white/80 dark:bg-white/7 border border-white/10 shadow-inner"
          >
            <div className="text-xs font-medium mb-2 text-foreground/90">
              {i === 0 ? "To Do" : i === 1 ? "In Progress" : "Done"}
            </div>
            <div className="space-y-2">
              <div className="h-2 rounded bg-gradient-to-r from-indigo-200 to-violet-200 animate-pulse" />
              <div className="h-2 rounded bg-gradient-to-r from-indigo-200 to-violet-200 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute -right-3 -bottom-3 text-xs text-muted-foreground">
        {board.columns || 4} columns
      </div>
    </motion.div>
  );
}
