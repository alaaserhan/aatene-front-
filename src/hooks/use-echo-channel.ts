import { useEffect, useRef } from "react";
import { getEcho } from "@/src/lib/echo";
import type Echo from "laravel-echo";

type ChannelType = "private" | "public";

interface EchoEvent {
  event: string;
  callback: (data: Record<string, unknown>) => void;
}

export function useEchoChannel(
  channelName: string | null,
  events: EchoEvent[],
  channelType: ChannelType = "private"
) {
  const echoRef = useRef<Echo<"pusher"> | null>(null);
  const channelRef = useRef<string | null>(null);

  useEffect(() => {
    if (!channelName || typeof window === "undefined") return;

    const echo = getEcho();
    echoRef.current = echo;
    channelRef.current = channelName;

    const channel =
      channelType === "private"
        ? echo.private(channelName)
        : echo.channel(channelName);

    events.forEach(({ event, callback }) => {
      channel.listen(event, callback);
    });

    return () => {
      if (echoRef.current && channelRef.current) {
        echoRef.current.leave(channelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, channelType]);
}
