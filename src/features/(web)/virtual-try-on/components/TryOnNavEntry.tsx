"use client";

import Link from "next/link";
import { NavIconButton } from "@/src/components/(web)/NavIconButton";
import { useLanguage } from "@/src/hooks/use-language";
import { useTryOnInfo } from "../hooks";
import { TryOnIcon } from "./TryOnIcon";

export function TryOnNavEntry() {
  const locale = useLanguage();
  const { data } = useTryOnInfo();
  if (!data?.is_active) return null;
  return <Link href={`/${locale}/virtual-try-on`} aria-label="غرفة التجربة" title="غرفة التجربة"><NavIconButton tabIndex={-1} className="size-10 bg-[#aaaaaa]/10" count={data.list_count} badgeTone="alert"><span className="grid size-6 place-items-center"><TryOnIcon name="nav" /></span></NavIconButton></Link>;
}
