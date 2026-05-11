import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

const tabOrder = ['/', '/templates', '/movements', '/history', '/settings'];

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const prevPath = React.useRef(location.pathname);
  
  const currentIndex = tabOrder.indexOf(location.pathname);
  const prevIndex = tabOrder.indexOf(prevPath.current);
  
  const direction = currentIndex > prevIndex ? 1 : -1;
  prevPath.current = location.pathname;

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        initial={{ opacity: 0, x: 20 * direction }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 * direction }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
