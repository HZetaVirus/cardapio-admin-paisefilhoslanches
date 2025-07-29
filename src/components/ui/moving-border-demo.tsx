"use client";
import React from "react";
import { Button } from "@/components/ui/moving-border";

export function MovingBorderDemo() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold mb-4">Moving Border Demo</h2>
      
      <Button
        borderRadius="1.75rem"
        className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
      >
        Borders are cool
      </Button>

      <Button
        borderRadius="1rem"
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        containerClassName="w-48 h-12"
        duration={3000}
      >
        Custom Gradient
      </Button>

      <Button
        borderRadius="0.5rem"
        className="bg-black text-white"
        containerClassName="w-32 h-10"
        duration={1500}
        borderClassName="bg-[radial-gradient(var(--red-500)_40%,transparent_60%)]"
      >
        Fast Border
      </Button>
    </div>
  );
}