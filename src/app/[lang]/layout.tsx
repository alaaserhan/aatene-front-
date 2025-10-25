// app/[lang]/layout.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params;           
  const siteName = lang === "ar" ? "أعطيني" : "Aatene";

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: "موقع أعطيني هو منصتك الأولى للتجارة الإلكترونية...",
  };
}

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
