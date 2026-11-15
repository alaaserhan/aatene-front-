"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";
import { useSettingsStore } from "@/src/stores/settings-store";
import { upgradeHttpToHttps, fixMediaUrl } from "@/src/lib/utils";

/** Lives outside Navbar.tsx so navbar-less pages can use it without bundling the whole navbar. */
export const Logo = () => {
  const lang = useLanguage();
  const { settings } = useSettingsStore();
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);

  const logoUrl = settings?.logo_url
    ? upgradeHttpToHttps(fixMediaUrl(settings.logo_url))
    : null;
  const useRemoteLogo = !!logoUrl && failedLogoUrl !== logoUrl;

  return (
    <Link href={`/${lang}`} className="flex shrink-0 items-center">
      <Image
        src={useRemoteLogo ? logoUrl : "/black.svg"}
        className="h-10 w-auto object-contain"
        alt={(useRemoteLogo && settings?.name) || "أعطيني"}
        width={150}
        height={40}
        priority
        onError={useRemoteLogo ? () => setFailedLogoUrl(logoUrl) : undefined}
      />
    </Link>
  );
};
