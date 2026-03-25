"use client";

import React, { useEffect, useState } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { WeekOffersData, Product } from "../types";
import Image from "next/image";
import Link from "next/link";
import { useWeekOffers } from "../hooks";

interface HomeWeeklyOffersProps {
    data?: WeekOffersData | null;
}

export default function HomeWeeklyOffers({ data: initialData }: HomeWeeklyOffersProps) {
    const { data: response } = useWeekOffers();
    const data = initialData || response?.data || null;

    if (!data || !data.products || data.products.length === 0) return null;

    const products = data.products;
    const endDate = data.last_date;

    // Show up to 4 products
    const displayItems = products.slice(0, 4);

    return (
        <section className="py-8 bg-gray-50 bg-linear-to-b from-gray-50 to-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Right Side: Title & Timer (in RTL layout) */}
                        <div className="w-full lg:w-[300px] p-6 lg:p-8 flex flex-col items-center justify-center gap-6 text-center border-b lg:border-b-0 lg:border-l border-gray-100 shrink-0">
                            <h2 className="text-2xl font-medium">الصفقات والعروض</h2>

                            <CountdownTimer targetDate={endDate} />
                        </div>

                        {/* Left Side: Products Grid */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-gray-100">
                            {displayItems.map((product: Product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.slug}`}
                                    className="p-4 flex flex-col items-center group hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg">
                                        <Image
                                            src={product.cover || "/placeholder.png"}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    <h3 className="text-sm font-medium text-center line-clamp-2 mb-3 ">
                                        {product.name}
                                    </h3>

                                    {product.discount_present > 0 && (
                                        <span className="inline-block pt-1 bg-[#FFE3E3] text-[#EB001B] text-xs font-medium px-3 pb-0.5 rounded-full" dir="ltr">
                                            -{product.discount_present}%
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timeBlocks = [
        { label: "الأيام", value: timeLeft.days },
        { label: "ساعة", value: timeLeft.hours },
        { label: "دقيقة", value: timeLeft.minutes },
        { label: "ثانية", value: timeLeft.seconds },
    ];

    return (
        <div className="flex gap-2" dir="ltr">
            {timeBlocks.map((block, index) => (
                <div key={index} className="flex flex-col items-center justify-center bg-blue-3 rounded-sm w-12 h-16 ">
                    <div className=" flex items-center justify-center text-white font-medium text-lg mb-0.5">
                        {String(block.value).padStart(2, '0')}
                    </div>
                    <span className="text-xs text-white  ">{block.label}</span>
                </div>
            ))}
        </div>
    );
}
