import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HomeViewAllLinkProps {
  href: string;
  label?: string;
  className?: string;
}

/** نفس زر «عرض الكل» في متاجر مميزة — سهم واحد فقط */
export default function HomeViewAllLink({
  href,
  label = "عرض الكل",
  className,
}: HomeViewAllLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-1 p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors shrink-0",
        className
      )}
    >
      {label}
      <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
    </Link>
  );
}
