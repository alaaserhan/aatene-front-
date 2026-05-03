import { useEffect } from "react";
import { getEcho } from "@/src/lib/echo";

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
  useEffect(() => {
    if (!channelName || typeof window === "undefined") return;

    const echo = getEcho();

    const channel =
      channelType === "private"
        ? echo.private(channelName)
        : echo.channel(channelName);

    events.forEach(({ event, callback }) => {
      channel.listen(event, callback);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [channelName, channelType, events]);
}
