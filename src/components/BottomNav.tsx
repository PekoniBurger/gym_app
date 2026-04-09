"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  ClipboardList, 
  Dumbbell, 
  History as HistoryIcon, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Workout", href: "/", icon: Activity },
  { name: "Templates", href: "/templates", icon: ClipboardList },
  { name: "Movements", href: "/movements", icon: Dumbbell },
  { name: "History", href: "/history", icon: HistoryIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-lg bg-glass border-t border-border-color flex items-around justify-between px-2 h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 transition-all duration-300 relative group",
                isActive ? "text-accent scale-105" : "text-text-tertiary hover:text-accent/70"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5 mb-0.5", isActive && "drop-shadow-[0_0_8px_var(--color-accent)]")} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full animate-fade-in" />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
