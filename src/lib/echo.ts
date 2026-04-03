import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Cookies from "js-cookie";

if (typeof window !== "undefined") {
  (window as { Pusher?: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<"pusher"> | null = null;

export function getEcho(): Echo<"pusher"> {
  if (echoInstance) return echoInstance;

  const token = Cookies.get("token");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://backend.aatene.com/api";
  const authEndpoint = baseUrl.replace(/\/api$/, "") + "/broadcasting/auth";

  echoInstance = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "e381d0621da09cb7f0d0",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
    forceTLS: true,
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
