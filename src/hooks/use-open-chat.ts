"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/src/hooks/use-language";
import { useAuthStore } from "@/src/stores/auth-store";
import { buildChatHref, type ChatTarget } from "@/src/lib/chat-links";
import { loginUrlWithAuthRequired } from "@/src/auth/links";

interface UseOpenChatOptions {
  /** Overrides the default `/{lang}/chat` path, e.g. `/ar/admin/chat`. */
  basePath?: string;
}

/**
 * Opens a direct conversation with a store or user.
 *
 * Guests are sent to login with a redirect back to the current page, so the
 * chat opens right after they sign in.
 *
 * `isOpening` stays `true` until the component unmounts on navigation — the
 * chat screen takes over the loading state from there, which keeps the button
 * from flickering back to its idle look mid-transition.
 */
export function useOpenChat(options?: UseOpenChatOptions) {
  const router = useRouter();
  const lang = useLanguage();
  const { user } = useAuthStore();
  const [isOpening, setIsOpening] = useState(false);

  const basePath = options?.basePath;

  const getChatHref = useCallback(
    (target: ChatTarget) => buildChatHref(lang, target, basePath),
    [lang, basePath],
  );

  const openChat = useCallback(
    (target: ChatTarget) => {
      const href = getChatHref(target);
      if (!href) {
        toast.error("لا يمكن فتح المحادثة الآن.");
        return false;
      }
      if (!user) {
        router.push(loginUrlWithAuthRequired(lang));
        return false;
      }
      setIsOpening(true);
      router.push(href);
      return true;
    },
    [getChatHref, user, router, lang],
  );

  return { openChat, getChatHref, isOpening };
}
