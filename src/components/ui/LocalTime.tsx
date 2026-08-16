"use client";

import { useEffect, useState } from "react";

/**
 * Live local time in Lagos — a small authored detail that puts a real person,
 * in a real place, on the other side of the screen. Renders nothing until
 * mounted (no hydration mismatch) and ticks quietly once a minute.
 */
export default function LocalTime({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {time ? `${time} in Lagos` : " "}
    </span>
  );
}
