"use client";

import HomeSingleBanner from "./HomeSingleBanner";
import { SingleBannerSkeleton } from "./HomeSkeletons";
import {
    useFifthBanner,
    useFourthBanner,
    useSixthBanner,
    useThirdBanner,
} from "../hooks";

type BannerSlot = "third" | "fourth" | "fifth" | "sixth";

interface HomeSingleBannerSlotProps {
    slot: BannerSlot;
}

export default function HomeSingleBannerSlot({ slot }: HomeSingleBannerSlotProps) {
    const third = useThirdBanner({ enabled: slot === "third" });
    const fourth = useFourthBanner({ enabled: slot === "fourth" });
    const fifth = useFifthBanner({ enabled: slot === "fifth" });
    const sixth = useSixthBanner({ enabled: slot === "sixth" });

    const response =
        slot === "third" ? third.data :
        slot === "fourth" ? fourth.data :
        slot === "fifth" ? fifth.data :
        sixth.data;
    const isLoading =
        slot === "third" ? third.isLoading :
        slot === "fourth" ? fourth.isLoading :
        slot === "fifth" ? fifth.isLoading :
        sixth.isLoading;

    if (isLoading) return <SingleBannerSkeleton />;
    return <HomeSingleBanner banner={response?.data || null} />;
}
