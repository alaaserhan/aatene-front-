"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Flag } from "lucide-react";
import { RequestedService } from "../types";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { ReportAbuse } from "../../reports/components/ReportAbuse";
import { stripHtmlTags } from "@/src/lib/utils";
import { useLanguage } from "@/src/hooks/use-language";

interface RequestedServiceCardProps {
  service: RequestedService;
  className?: string;
}

export default function RequestedServiceCard({
  service,
  className,
}: RequestedServiceCardProps) {
  const lang = useLanguage();
  const user = service.user;

  return (
    <div
      className={`group relative border border-gray-200 rounded-lg p-6 flex flex-col gap-4 hover:border-blue-2 transition-colors bg-white ${className || ""}`}
    >
      <Link
        href={`/${lang}/requested-services/${service.slug}`}
        className="absolute inset-0 z-[1] rounded-lg"
        aria-label={`عرض تفاصيل: ${service.title}`}
      />
      <div className="relative z-[2] flex gap-4 items-start pointer-events-none">
        <div className="shrink-0 w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          {user?.avatar_url ?
            <Image
              src={user.avatar_url}
              alt={`${user.first_name || ""} ${user.last_name || ""}`}
              width={50}
              height={50}
              className="object-cover w-full h-full"
            />
          : <div className="w-full h-full bg-gray-200" />}
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-normal line-clamp-2 text-black-1 group-hover:text-blue-2 transition-colors text-right">
              {service.title}
            </h3>

            <div className="pointer-events-auto shrink-0">
              <ReportAbuse type="requested_service" id={service.id}>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 text-[#F00] font-medium text-xs hover:underline shrink-0"
                >
                  <Flag className="w-3 h-3" />
                  <span>بلغ عن إساءة</span>
                </button>
              </ReportAbuse>
            </div>
          </div>

          <p className="text-gray-2 text-sm leading-[1.7] line-clamp-2 text-right">
            {stripHtmlTags(service.content)}
          </p>
          <div className="flex items-center gap-4 mt-1 justify-start">
            <div className="flex items-center gap-1.5 text-blue-3">
              <img src="/icons/Profile.svg" alt="Profile" />
              <span className="text-sm">
                {user ? `${user.first_name} ${user.last_name}` : "مستخدم"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-3">
              <img src="/icons/Time.svg" alt="Time" />
              <span className="text-xs">
                {getRelativeTimeArabic(service.created_at)}
              </span>
            </div>
          </div>
          {service.last_comment && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {service.last_comment.user.avatar ?
                  <Image
                    src={service.last_comment.user.avatar}
                    alt="User"
                    width={24}
                    height={24}
                    className="object-cover w-full h-full"
                  />
                : <div className="w-full h-full bg-gray-200" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-3">
                <span>آخر تفاعل</span>
                <span className="text-black-1">
                  {getRelativeTimeArabic(service.last_comment.created_at || "")}
                </span>
                <span>من قبل</span>
                <span className="text-blue-3">
                  {service.last_comment.user.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RequestedServiceCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 flex gap-4 items-start animate-pulse bg-white">
      <div className="shrink-0 w-[60px] h-[60px] rounded-full bg-gray-200" />
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="h-5 bg-gray-200 rounded w-3/4 mr-auto" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}
