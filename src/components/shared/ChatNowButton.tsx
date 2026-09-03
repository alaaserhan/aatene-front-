"use client";

import type { ComponentProps, ReactNode } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useOpenChat } from "@/src/hooks/use-open-chat";
import type { ChatTarget } from "@/src/lib/chat-links";

type ButtonProps = ComponentProps<typeof Button>;

export interface ChatNowButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "type"> {
  /** Who to open the conversation with. */
  target: ChatTarget;
  /** Overrides the default `/{lang}/chat` path, e.g. `/ar/admin/chat`. */
  basePath?: string;
  /** Button label. Defaults to the generic "chat" label. */
  label?: ReactNode;
  /** Leading/trailing icon. Omit for the default message icon, pass `null` for none. */
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  /** Classes applied to the icon and to the spinner that replaces it. */
  iconClassName?: string;
  /**
   * Spins over the label instead of beside it, with the label kept in place but
   * hidden — for buttons whose width must not move while the chat opens.
   */
  loadingReplacesLabel?: boolean;
  /**
   * Renders a bare `<button>` carrying only `className`, for the screens whose
   * chat button is styled from scratch rather than on the shared `<Button>`.
   */
  unstyled?: boolean;
  /** Runs before navigating; return `false` to cancel. */
  onBeforeOpen?: () => boolean | void;
}

/**
 * The single "chat now" entry point used across stores, users, products and
 * services. It builds the chat URL through `buildChatHref`, so every screen
 * hands `ChatPage` the same params and lands directly on the conversation.
 */
export function ChatNowButton({
  target,
  basePath,
  label = "دردش",
  icon,
  iconPosition = "start",
  iconClassName = "w-5 h-5 shrink-0",
  loadingReplacesLabel = false,
  unstyled,
  onBeforeOpen,
  className,
  disabled,
  variant,
  size,
  ...rest
}: ChatNowButtonProps) {
  const { openChat, isOpening } = useOpenChat({ basePath });

  const handleClick = () => {
    if (onBeforeOpen?.() === false) return;
    openChat(target);
  };

  /** `undefined` keeps the default icon; an explicit `null` renders no icon. */
  const idleIcon =
    icon === undefined ? <MessageSquareText className={iconClassName} aria-hidden="true" /> : icon;

  const iconNode = isOpening ? (
    <Loader2 className={cn(iconClassName, "animate-spin")} aria-hidden="true" />
  ) : (
    idleIcon
  );

  const labelNode =
    typeof label === "string" ? <span className="shrink-0">{label}</span> : label;

  /**
   * The label still takes its space, so the button is exactly as wide spinning
   * as it is idle — `visibility` is what keeps a box while hiding its ink.
   */
  const content =
    loadingReplacesLabel && isOpening ? (
      <span className="relative inline-flex items-center justify-center">
        <span className="invisible">{labelNode}</span>
        <Loader2
          className={cn(iconClassName, "absolute animate-spin")}
          aria-hidden="true"
        />
      </span>
    ) : (
      <>
        {iconPosition === "start" && iconNode}
        {labelNode}
        {iconPosition === "end" && iconNode}
      </>
    );

  if (unstyled) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isOpening}
        className={className}
        {...rest}
      >
        {content}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isOpening}
      className={className}
      {...rest}
    >
      {content}
    </Button>
  );
}
