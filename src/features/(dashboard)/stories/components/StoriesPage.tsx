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
import { toast } from "sonner";

export function StoriesPage() {
  const storeId = Number(Cookies.get("current_store_id"));
  const hasStore = !isNaN(storeId);
  const { data: storiesData, isLoading: storiesLoading } = useGetStories(storeId, { enabled: hasStore });
  const { data: highlightsData, isLoading: highlightsLoading } = useGetHighlights(storeId, { enabled: hasStore });

  // Story Mutations
  const { mutate: createStory, isPending: isCreatingStory } = useCreateStory();
  const { mutate: updateStory, isPending: isUpdatingStory } = useUpdateStory();
  const { mutate: deleteStory } = useDeleteStory(); // isPending is not typically needed for delete in the list unless we want to show loading on the specific item, but StoriesList handles optimistic UI or we can pass it if we want.

  // Highlight Mutations
  const { mutate: createHighlight, isPending: isCreatingHighlight } = useCreateHighlight();
  const { mutate: updateHighlight, isPending: isUpdatingHighlight } = useUpdateHighlight();
  const { mutate: deleteHighlight } = useDeleteHighlight();

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

  // Handlers for Stories
  const handleCreateStory = (payload: any, onSuccess?: () => void) => {
    createStory({ payload, storeId: String(storeId) }, {
      onSuccess: () => {
        toast.success("تم إنشاء القصة بنجاح");
        onSuccess?.();
      }
    });
  };

  // Let's fix this in `StoriesPage` by redefining the handlers to accept an optional callback or just using `mutateAsync`.
  // Actually, `StoriesList` manages the modal state `isAddModalOpen`.
  // `StoriesList` calls `onCreateStory(payload)`.
  // Use `mutateAsync` might be better or pass a callback.
  // Let's look at `StoriesList`: It passes `onCreateStory` to `AddStoryModal`.
  // `AddStoryModal` calls `onSave(payload)`.
  // It does NOT close the modal.
  // The User will be stuck with open modal?
  // I need to update `AddStoryModal` to accept `onSuccess`?
  // Or make `onSave` return a Promise?

  // Let's modify handlers to return a Promise so children can wait and close.



  return (
    <div className="flex flex-col gap-4 p-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* قسم القصص المميزة (Highlights) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <HighlightsSection
          highlights={highlightsData?.data || []}
          stories={storiesData?.data || []} // نحتاج القصص لإنشاء هايلايت جديد
          onCreateHighlight={(payload, onSuccess) => {
            createHighlight({ payload, storeId: String(storeId) }, {
              onSuccess: () => {
                toast.success("تم إنشاء القصة المميزة بنجاح");
                onSuccess?.();
              }
            });
          }}
          onUpdateHighlight={(id, payload, onSuccess) => {
            updateHighlight({ id: String(id), payload, storeId: String(storeId) }, {
              onSuccess: () => {
                toast.success("تم تحديث القصة المميزة بنجاح");
                onSuccess?.();
              }
            });
          }}
          onDeleteHighlight={(id) => {
            deleteHighlight({ id: String(id), storeId: String(storeId) }, {
              onSuccess: () => { toast.success("تم حذف القصة المميزة بنجاح"); }
            });
          }}
          isPending={isHighlightPending}
        />
      </div>

      {/* قسم القصص (Stories) */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[300px]">
        <StoriesList
          stories={storiesData?.data || []}
          onCreateStory={handleCreateStory}
          onUpdateStory={(id, payload, onSuccess) => {
            updateStory({ id: String(id), payload, storeId: String(storeId) }, {
              onSuccess: () => {
                toast.success("تم تحديث القصة بنجاح");
                onSuccess?.();
              }
            });
          }}
          onDeleteStory={(id) => {
            deleteStory({ id: String(id), storeId: String(storeId) }, {
              onSuccess: () => { toast.success("تم حذف القصة بنجاح"); }
            });
          }}
          isPending={isStoryPending}
          MediaPickerComponent={MediaCenterModal}
        />
      </div>
    </div>
  );
}