
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    useGetStories,
    useCreateStory,
    useUpdateStory,
    useDeleteStory,
    useGetHighlights,
    useCreateHighlight,
    useUpdateHighlight,
    useDeleteHighlight
} from "../../hooks";
import { StoriesList } from "@/src/features/(dashboard)/stories/components/StoriesList";
import { HighlightsSection } from "@/src/features/(dashboard)/stories/components/HighlightsSection";
import { SimpleMediaPicker } from "../SimpleMediaPicker";

export function StoriesTab() {
    const { data: storiesData, isLoading: storiesLoading } = useGetStories();
    const { data: highlightsData, isLoading: highlightsLoading } = useGetHighlights();

    const { mutate: createStory, isPending: isCreatingStory } = useCreateStory();
    const { mutate: updateStory, isPending: isUpdatingStory } = useUpdateStory();
    const { mutate: deleteStory } = useDeleteStory();

    const { mutate: createHighlight, isPending: isCreatingHighlight } = useCreateHighlight();
    const { mutate: updateHighlight, isPending: isUpdatingHighlight } = useUpdateHighlight();
    const { mutate: deleteHighlight } = useDeleteHighlight();

    const isStoryPending = isCreatingStory || isUpdatingStory;
    const isHighlightPending = isCreatingHighlight || isUpdatingHighlight;

    if (storiesLoading || highlightsLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-medium text-[#3D3D3D]">القصص والهايلايتس</h2>
                <p className="text-gray-400 text-sm">قم بإدارة القصص والمجموعات المميزة الخاصة بملفك الشخصي</p>
            </div>

            <div className="border-b border-gray-100 w-full" />

            {/* Highlights Section */}
            <div className="">
                <HighlightsSection
                    highlights={highlightsData?.data || []}
                    stories={storiesData?.data || []}
                    onCreateHighlight={(payload, onSuccess) => {
                        createHighlight(payload, {
                            onSuccess: () => {
                                // toast is handled in hook but we can add extra if needed
                                onSuccess?.();
                            }
                        });
                    }}
                    onUpdateHighlight={(id, payload, onSuccess) => {
                        updateHighlight({ id, payload }, {
                            onSuccess: () => {
                                onSuccess?.();
                            }
                        });
                    }}
                    onDeleteHighlight={(id) => {
                        deleteHighlight(id, {
                            onSuccess: () => { /* toast handled in hook */ }
                        });
                    }}
                    isPending={isHighlightPending}
                />
            </div>

            {/* Stories Section */}
            <div className="min-h-[300px]">
                <StoriesList
                    stories={storiesData?.data || []}
                    onCreateStory={(payload, onSuccess) => {
                        createStory(payload, {
                            onSuccess: () => {
                                onSuccess?.();
                            }
                        });
                    }}
                    onUpdateStory={(id, payload, onSuccess) => {
                        updateStory({ id, payload }, {
                            onSuccess: () => {
                                onSuccess?.();
                            }
                        });
                    }}
                    onDeleteStory={(id) => {
                        deleteStory(id);
                    }}
                    isPending={isStoryPending}
                    MediaPickerComponent={SimpleMediaPicker}
                />
            </div>
        </div>
    );
}
