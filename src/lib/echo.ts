import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";

if (typeof window !== "undefined") {
  (window as { Pusher?: typeof Pusher }).Pusher = Pusher;
  Pusher.logToConsole = process.env.NODE_ENV === "development";
}

let echoInstance: Echo<"pusher"> | null = null;

export function getEcho(): Echo<"pusher"> {
  if (echoInstance) return echoInstance;

  const baseUrl = "https://backend.aatene.com";
  const authEndpoint = baseUrl + "/broadcasting/auth";

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "ca9b1f898ff3d07906f9",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu",
    forceTLS: true,
    authEndpoint,
    authorizer: (channel: { name: string }, options: { authEndpoint: string }) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorize: (socketId: string, callback: (error: Error | null, data: any) => void) => {
          fetch(options.authEndpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => callback(null, data))
            .catch((error) => callback(error instanceof Error ? error : new Error(String(error)), null));
        },
      };
    },
  });

  return echoInstance;
}

export function refreshEchoAuth(): void {
  if (!echoInstance) return;
  const token = Cookies.get("token");
  // @ts-expect-error - connector properties are dynamic in Laravel Echo
  echoInstance.connector.pusher.config.auth = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
