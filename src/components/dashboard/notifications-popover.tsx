import { Bell, BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notifications } from "@/lib/data";

export function NotificationsPopover() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          {unreadCount > 0 ? (
            <BellDot className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="mt-4 space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
            >
              {!notification.read && (
                <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-primary" />
              )}
              <div className="col-start-2 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {notification.kpiTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
