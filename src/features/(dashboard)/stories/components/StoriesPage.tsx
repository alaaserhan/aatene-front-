// src/features/(dashboard)/stories/components/StoriesPage.tsx
"use client";

import {
  useGetStories,
  useGetHighlights,
  useCreateStory,
  useUpdateStory,
  useDeleteStory,
  useCreateHighlight,
  useUpdateHighlight,
  useDeleteHighlight
} from "../hooks";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { HighlightsSection } from "./HighlightsSection";
import { StoriesList } from "./StoriesList";
import { Loader2 } from "lucide-react";
import { StoreEmptyState } from "@/src/components/(dashboard)/StoreEmptyState";
import Cookies from "js-cookie";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";

export function StoriesPage() {
  const storeId = Number(Cookies.get("current_store_id"));
  const hasStore = !isNaN(storeId);
  const { data: storiesData, isLoading: storiesLoading } = useGetStories(storeId, { enabled: hasStore });
  const { data: highlightsData, isLoading: highlightsLoading } = useGetHighlights(storeId, { enabled: hasStore });

  // The mutation hooks own the success/error toasts.
  const { mutate: createStory, isPending: isCreatingStory } = useCreateStory();
  const { mutate: updateStory, isPending: isUpdatingStory } = useUpdateStory();
  const { mutate: deleteStory, isPending: isDeletingStory } = useDeleteStory();

  const { mutate: createHighlight, isPending: isCreatingHighlight } = useCreateHighlight();
  const { mutate: updateHighlight, isPending: isUpdatingHighlight } = useUpdateHighlight();
  const { mutate: deleteHighlight, isPending: isDeletingHighlight } = useDeleteHighlight();

  const isStoryPending = isCreatingStory || isUpdatingStory;
  const isHighlightPending = isCreatingHighlight || isUpdatingHighlight;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin/home" },
    { label: "القصص" },
  ];

  if (storiesLoading || highlightsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <StoreEmptyState
          title="يجب إنشاء متجر أولاً"
          description="لإضافة القصص والهايلايتس، يجب أن تمتلك متجراً واحداً على الأقل."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <HighlightsSection
          highlights={highlightsData?.data || []}
          stories={storiesData?.data || []}
          onCreateHighlight={(payload, onSuccess) => {
            createHighlight({ payload, storeId: String(storeId) }, { onSuccess: () => onSuccess?.() });
          }}
          onUpdateHighlight={(id, payload, onSuccess) => {
            updateHighlight({ id: String(id), payload, storeId: String(storeId) }, { onSuccess: () => onSuccess?.() });
          }}
          onDeleteHighlight={(id, onSuccess) => {
            deleteHighlight({ id: String(id), storeId: String(storeId) }, { onSuccess: () => onSuccess?.() });
          }}
          isPending={isHighlightPending}
          isDeleting={isDeletingHighlight}
        />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 min-h-[300px]">
        <StoriesList
          stories={storiesData?.data || []}
          onCreateStory={(payload, onSuccess) => {
            createStory({ payload, storeId: String(storeId) }, { onSuccess: () => onSuccess?.() });
          }}
          onUpdateStory={(id, payload, onSuccess) => {
            updateStory({ id: String(id), payload, storeId: String(storeId) }, { onSuccess: () => onSuccess?.() });
          }}
          onDeleteStory={(id, onSuccess) => {
            deleteStory({ id: String(id), storeId: String(storeId) }, { onSuccess: () => onSuccess?.() });
          }}
          isPending={isStoryPending}
          isDeleting={isDeletingStory}
          MediaPickerComponent={MediaCenterModal}
        />
      </div>
    </div>
  );
}