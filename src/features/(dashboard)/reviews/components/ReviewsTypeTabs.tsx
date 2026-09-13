"use client";

import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import type { ReviewTargetType } from "../api";
import { REVIEW_TYPES, REVIEW_TYPE_META } from "../constants";

interface ReviewsTypeTabsProps {
    value: ReviewTargetType;
    onChange: (type: ReviewTargetType) => void;
}

/** Switches the reviewed-entity type. No panels — the table below is the panel. */
export function ReviewsTypeTabs({ value, onChange }: ReviewsTypeTabsProps) {
    return (
        <Tabs value={value} onValueChange={(next) => onChange(next as ReviewTargetType)}>
            <TabsList className="w-full max-w-full justify-start overflow-x-auto">
                {REVIEW_TYPES.map((type) => (
                    <TabsTrigger key={type} value={type} className="min-w-30">
                        {REVIEW_TYPE_META[type].tab}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
