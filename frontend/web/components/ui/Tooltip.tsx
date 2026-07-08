"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "right" | "bottom" | "top" | "left";
  disabled?: boolean;
}

export default function Tooltip({ children, content, position = "right", disabled = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let x = 0;
      let y = 0;

      if (position === "right") {
        x = rect.right + 8;
        y = rect.top + rect.height / 2;
      } else if (position === "bottom") {
        x = rect.left + rect.width / 2;
        y = rect.bottom + 8;
      } else if (position === "left") {
        x = rect.left - 8;
        y = rect.top + rect.height / 2;
      } else if (position === "top") {
        x = rect.left + rect.width / 2;
        y = rect.top - 8;
      }

      setCoords({ x, y });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => !disabled && setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex w-full"
      >
        {children}
      </div>
      {mounted && isVisible && !disabled &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{ 
                left: coords.x, 
                top: coords.y,
                transform: 
                  position === 'right' ? 'translate(0, -50%)' : 
                  position === 'left' ? 'translate(-100%, -50%)' :
                  position === 'bottom' ? 'translate(-50%, 0)' :
                  'translate(-50%, -100%)'
            }}
          >
            <div className="rounded-lg glass-surface px-3 py-1.5 text-xs font-mono font-medium text-textPrimary shadow-xl whitespace-nowrap border border-borderLight/50">
              {content}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
