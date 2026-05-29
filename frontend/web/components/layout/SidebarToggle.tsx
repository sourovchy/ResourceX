import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Tooltip from "../ui/Tooltip";

interface SidebarToggleProps {
  collapsed: boolean;
  onClick: () => void;
  className?: string;
}

export default function SidebarToggle({ collapsed, onClick, className = "" }: SidebarToggleProps) {
  return (
    <div className={`hidden md:block ${className}`}>
      <Tooltip
        content={collapsed ? "Open sidebar" : "Close sidebar"}
        position="right"
      >
        <button
          onClick={onClick}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-surfaceVariant"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
