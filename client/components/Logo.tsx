import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { icon: 'h-5 w-5', text: 'text-lg' },
    default: { icon: 'h-6 w-6', text: 'text-xl' },
    large: { icon: 'h-8 w-8', text: 'text-3xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 blur-lg opacity-50 animate-pulse" />
        <div className="relative bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-xl p-2">
          <Sparkles className={`${icon} text-white`} />
        </div>
      </div>
      <span className={`${text} font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500`}>
        FlowSpace
      </span>
    </div>
  );
}
