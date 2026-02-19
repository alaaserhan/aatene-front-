import { StarRating } from "@/src/components/ui/StarRating";

export interface ReviewStatisticsData {
    total_reviews: number;
    average_rate: number;
    stars: {
        1: number | string;
        2: number | string;
        3: number | string;
        4: number | string;
        5: number | string;
    };
}

export function ReviewStatisticsDisplay({ stats }: { stats: ReviewStatisticsData }) {
    const starLabels = {
        5: "ممتاز",
        4: "جيد",
        3: "متوسط",
        2: "ليس سيئاً",
        1: "سيئ",
    };

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <div className="w-full md:w-[220px] shrink-0 bg-[#AAAAAA1A] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 h-[160px]">
                    <span className="text-5xl font-medium">{Number(stats.average_rate).toFixed(1)}</span>
                    <span className="text-xs text-gray-400">من {stats.total_reviews} مراجعة</span>
                    <StarRating rating={Number(stats.average_rate)} size={20} />
                </div>

                <div className="flex-1 w-full flex flex-col justify-center h-[160px] gap-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const starValue = stats.stars[star as keyof typeof stats.stars];
                        const count = Number(starValue) || 0;

                        const calculatedTotal = [1, 2, 3, 4, 5].reduce((acc, key) => acc + (Number(stats.stars[key as keyof typeof stats.stars]) || 0), 0);
                        const total = stats.total_reviews || calculatedTotal || 1;

                        const percentage = Number(total) > 0 ? (count / Number(total)) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-4">
                                <span className="w-14 text-sm font-medium">{starLabels[star as keyof typeof starLabels]}</span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#FA9130] rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="w-8 text-sm text-gray-2 font-medium">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
