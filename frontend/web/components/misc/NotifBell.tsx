import React from "react";
import { Bell } from "lucide-react";

interface NotifBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

const NotifBell = ({ count = 0, onClick, className = "" }: NotifBellProps) => {
  const hasNotification = count > 0;

  return (
    <button
      type="button"
      aria-label={
        hasNotification
          ? `Notifications, ${count} unread`
          : "Notifications"
      }
      aria-live="polite"
      onClick={onClick}
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-full
        text-gray-500 transition-all duration-200
        hover:bg-blue-50 hover:text-blue-600
        focus:outline-none focus:ring-2 focus:ring-blue-200
        sm:h-10 sm:w-10
        ${className}
      `}
    >
      <Bell className="h-4 w-4 sm:h-5 sm:w-5" />

      {hasNotification && (
        <span
          className="
            absolute -right-0.5 -top-0.5 min-w-4 rounded-full
            bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white
            shadow-sm
          "
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
};

export default NotifBell;