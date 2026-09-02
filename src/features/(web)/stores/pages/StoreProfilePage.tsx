"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { useStoreProfile, useStorePageData } from "../hooks";
import StoreHeader from "../components/StoreHeader";
import StoreStoriesSection from "../components/StoreStoriesSection";
import StoreTabs from "../components/StoreTabs";
import StoreProductsSection from "../components/StoreProductsSection";
import { useAuthStore } from "@/src/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import {
    useCreateStory,
    useCreateHighlight,
    useGetStories,
} from "@/src/features/(dashboard)/stories/hooks";
import { AddStoryModal } from "@/src/features/(dashboard)/stories/components/AddStoryModal";
import { CreateHighlightModal } from "@/src/features/(dashboard)/stories/components/CreateHighlightModal";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";
import { CreateStoryPayload } from "@/src/features/(dashboard)/stories/api";

import { Loader2 } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";

export default function StoreProfilePage({ slug }: { slug: string }) {
    const { data: profileData, isPending: isPendingProfile, error: profileError } = useStoreProfile(slug);
    const { data: pageData, isPending: isPendingPageData } = useStorePageData(slug);
    const authUser = useAuthStore(state => state.user);
    const queryClient = useQueryClient();

    const store = profileData?.store;
    const isOwnStore = authUser?.id === Number(store?.owner_id);

    const isAdmin = authUser?.user_type === "admin";

    const { mutate: createStory, isPending: isCreatingStory } = useCreateStory();
    const { mutate: createHighlight, isPending: isCreatingHighlight } = useCreateHighlight();
    const { data: storiesData } = useGetStories(isOwnStore ? store?.id : undefined, { enabled: !!isOwnStore && !!store?.id });

    const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
    const [addStoryMode, setAddStoryMode] = useState<"text" | "media">("text");
    const [isCreateHighlightOpen, setIsCreateHighlightOpen] = useState(false);

    if (isPendingProfile || isPendingPageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
            </div>
        );
    }

    if (profileError || !store) {
        notFound();
        return null;
    }


    const handleCreateStory = (payload: CreateStoryPayload, onSuccess?: () => void) => {
        if (!store) return;
        createStory({ payload, storeId: store.id }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                queryClient.invalidateQueries({ queryKey: ["storePageData"] });
                onSuccess?.();
            }
        });
    };

    const handleCreateHighlight = (payload: { name: string; stories: number[] }, onSuccess?: () => void) => {
        if (!store) return;
        createHighlight({ payload, storeId: store.id }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                queryClient.invalidateQueries({ queryKey: ["storePageData"] });
                onSuccess?.();
            }
        });
    };

    const handleOpenAddStory = (mode: "text" | "media") => {
        setAddStoryMode(mode);
        setIsAddStoryOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <StoreHeader
                store={store!}
                followers={pageData?.followers}
                stories={pageData?.stories}
                isOwnStore={isOwnStore}
            />
            <MaxWidthWrapper className="mt-8 flex flex-col gap-6 lg:max-w-[70%] lg:mr-auto">
                <div className="flex flex-col gap-6 w-full">
                    <StoreStoriesSection
                        highlights={pageData?.highlights || []}
                        isOwnStore={isOwnStore}
                        isAdmin={isAdmin}
                        storeId={store!.id}
                        onAddHighlight={() => setIsCreateHighlightOpen(true)}
                        onAddStory={handleOpenAddStory}
                    />

                    {pageData && store && <StoreTabs store={store} pageData={pageData} />}

                    {store && (
                        <>
                            {/* <StoreFavoritesSection storeId={store.id} storeType={store.type} /> */}
                            <StoreProductsSection storeId={store.id} storeType={store.type} sections={pageData?.sections || []} />
                        </>
                    )}
                </div>
            </MaxWidthWrapper>

            <CreateHighlightModal
                isOpen={isCreateHighlightOpen}
                onClose={() => setIsCreateHighlightOpen(false)}
                availableStories={Array.isArray(storiesData?.data) ? storiesData.data : []}
                onSave={handleCreateHighlight}
                isPending={isCreatingHighlight}
            />

            <AddStoryModal
                isOpen={isAddStoryOpen}
                onClose={() => setIsAddStoryOpen(false)}
                mode={addStoryMode}
                onSave={handleCreateStory}
                isPending={isCreatingStory}
                MediaPickerComponent={MediaCenterModal}
            />
        </div>
    );
}
