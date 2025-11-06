import React from "react";
import { motion } from "framer-motion";

export default function IndexPreview() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-4 bg-white/6 dark:bg-white/6 backdrop-blur border border-white/10 shadow-2xl"
      >
        <div className="flex gap-3">
          {[
            { title: "To Do", color: "from-indigo-200 to-indigo-300" },
            { title: "In Progress", color: "from-violet-200 to-violet-300" },
            { title: "Review", color: "from-pink-200 to-pink-300" },
          ].map((col, i) => (
            <div key={col.title} className="flex-1 min-w-0">
              <div className="text-xs font-medium mb-3 text-foreground/80">
                {col.title}
              </div>
              <div className="space-y-3">
                {[0, 1].map((n) => (
                  <motion.div
                    key={n}
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-xl p-3 bg-gradient-to-br ${col.color} bg-opacity-10 border border-white/8`}
                  >
                    <div className="h-3 w-32 rounded bg-white/20 mb-2" />
                    <div className="h-3 w-20 rounded bg-white/10" />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
