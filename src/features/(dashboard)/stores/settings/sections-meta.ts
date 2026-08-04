// src/features/(dashboard)/stores/settings/sections-meta.ts

import { Clock, LucideIcon, Store, Share2, Tags } from "lucide-react";
import { StoreSettingsSectionId } from "./types";

export interface StoreSettingsSectionMeta {
  id: StoreSettingsSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for the settings navigation and each panel header,
 * so the sidebar entry and the panel it opens always read the same.
 */
export const STORE_SETTINGS_SECTIONS: StoreSettingsSectionMeta[] = [
  {
    id: "mainData",
    label: "البيانات الأساسية",
    description: "اسم المتجر، هويته، وصفه والمدن التي يعمل بها",
    icon: Store,
  },
  {
    id: "socialMedia",
    label: "الاتصال والسوشيال ميديا",
    description: "رقم الهاتف وروابط حسابات التواصل الاجتماعي",
    icon: Share2,
  },
  {
    id: "workingHours",
    label: "أوقات العمل والعطلات",
    description: "حالة المتجر ومواعيد العمل خلال أيام الأسبوع",
    icon: Clock,
  },
  {
    id: "keywords",
    label: "الكلمات المفتاحية",
    description: "كلمات تساعد العملاء على الوصول لمتجرك في البحث",
    icon: Tags,
  },
];

export const getStoreSettingsSection = (id: StoreSettingsSectionId) =>
  STORE_SETTINGS_SECTIONS.find((section) => section.id === id)!;
