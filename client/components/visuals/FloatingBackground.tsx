import React, { useEffect, useRef } from "react";

export default function FloatingBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", String(x));
      el.style.setProperty("--my", String(y));
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden
    >
      <div
        className="absolute -left-40 -top-28 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-600/30 to-violet-500/20 blur-3xl transform-gpu"
        style={{
          transform:
            "translate3d(calc(var(--mx,0)*20px), calc(var(--my,0)*20px), 0)",
        }}
      />
      <div
        className="absolute right-20 top-10 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-600/10 blur-2xl transform-gpu"
        style={{
          transform:
            "translate3d(calc(var(--mx,0)*-18px), calc(var(--my,0)*12px), 0)",
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="50" result="b" />
            <feBlend in="SourceGraphic" in2="b" />
          </filter>
        </defs>
        <g filter="url(#f1)">
          <circle
            cx="10%"
            cy="85%"
            r="150"
            fill="rgba(99,102,241,0.04)"
          />
          <circle
            cx="85%"
            cy="15%"
            r="120"
            fill="rgba(124,58,237,0.03)"
          />
        </g>
      </svg>
    </div>
  );
}
