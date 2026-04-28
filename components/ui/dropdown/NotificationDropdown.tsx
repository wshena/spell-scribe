import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  description?: string;
  read: boolean;
  createdAt: string;
}

const dummyNotifications: Notification[] = [
  { id: "1", title: "Deck approved!", description: "Your deck 'Mono Red Aggro' was approved.", read: false, createdAt: "2026-04-23T10:00:00Z" },
  { id: "2", title: "New comment", description: "Someone commented on your deck.", read: false, createdAt: "2026-04-22T15:30:00Z" },
  { id: "3", title: "Welcome!", description: "Thanks for joining SpellScribe.", read: true, createdAt: "2026-04-20T09:00:00Z" },
];

export default function NotificationDropdown({ onClose }: { onClose?: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div ref={dropdownRef} className="absolute right-0 top-[calc(100%+0.75rem)] w-80 rounded-xl border border-white/10 bg-[#161b24] p-2 shadow-2xl shadow-black/40 z-50">
      <div className="px-3 pb-2 pt-1 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Notifications</p>
        <button 
          disabled={notifications.length === 0}
          className={cn(
            "cursor-pointer text-xs text-slate-400 hover:text-white",
            notifications.length === 0 && "cursor-not-allowed opacity-50 hover:text-slate-400"
          )} 
          onClick={() => setNotifications([])}>Clear All</button>
      </div>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {notifications?.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-400">No notifications</div>
        ) : notifications?.map((notif) => (
          <div key={notif.id} className={cn("rounded-lg px-3 py-3", notif.read ? "bg-transparent" : "bg-violet-500/10") }>
            <div className="flex items-center justify-between">
              <span className={cn("block text-sm font-semibold", notif.read ? "text-slate-300" : "text-white")}>{notif.title}</span>
              <span className="ml-2 text-xs text-slate-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
            </div>
            {notif.description && <div className="block text-xs text-slate-400 mt-1">{notif.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
