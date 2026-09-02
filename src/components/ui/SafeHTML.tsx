import { sanitizeHtml } from "@/src/lib/utils";

type SafeHTMLProps = {
  html: string | null | undefined;
  fallback?: string;
  as?: "div" | "span" | "p" | "section" | "article";
} & Omit<React.HTMLAttributes<HTMLElement>, "children">;

export function SafeHTML({
  html,
  fallback = "",
  as: Tag = "div",
  ...props
}: SafeHTMLProps) {
  return (
    <Tag
      {...(props as React.HTMLAttributes<HTMLElement>)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || fallback) }}
    />
  );
}
