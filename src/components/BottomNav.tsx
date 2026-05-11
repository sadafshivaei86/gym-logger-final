import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ClipboardList, Dumbbell, BarChart2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const TABS = [
  { path: '/', label: 'Workout', icon: Activity },
  { path: '/templates', label: 'Templates', icon: ClipboardList },
  { path: '/movements', label: 'Movements', icon: Dumbbell },
  { path: '/history', label: 'History', icon: BarChart2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-lg bg-glass-bg backdrop-blur-xl border-t border-glass-border flex justify-around items-center h-16">
        {TABS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-90",
                isActive ? "text-accent" : "text-text-tertiary hover:text-accent/70"
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }}
                  className={cn(isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]")}
                >
                  <Icon size={20} />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-1 w-1 h-1 bg-accent rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
