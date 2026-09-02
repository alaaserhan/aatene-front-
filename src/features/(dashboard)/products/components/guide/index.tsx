'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { NoProductsStep } from './steps/NoProductsStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { VariationsStep } from './steps/VariationsStep';

const STEPS = [NoProductsStep, BasicInfoStep, VariationsStep];
const STEP_COUNT = STEPS.length;

interface ProductGuideProps {
    onClose: () => void;
}

export function ProductGuide({ onClose }: ProductGuideProps) {
    const [guideStep, setGuideStep] = useState(1);
    const StepContent = STEPS[guideStep - 1];

    return (
        <div className="flex-1 px-4 pt-4 pb-6 overflow-y-auto" dir="rtl">
            <div className="bg-white rounded-xl border border-[#E5EBF0] shadow-sm overflow-hidden">

                {/* Welcome Banner */}
                <div className="px-4 md:px-8 pt-4 md:pt-6">
                    <div className="bg-[#DDE9F5] border-r-4 border-r-[#5B87B9] rounded-xl p-4 md:p-6 mb-4 md:mb-8 shadow-sm">
                        <div className="flex items-start gap-3 md:gap-4">
                            <img src="/guide-images/idea-01.png" alt="" className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-[#2D496A] font-bold text-base md:text-lg mb-2 md:mb-3">مرحباً بك في دليل إضافة المنتجات.</h3>
                                <p className="text-[#5B7C93] text-sm md:text-base leading-relaxed mb-2 md:mb-3">
                                    هذا الدليل التفصيلي سيساعدك على إضافة منتجات جديدة إلى متجرك خطوة بخطوة.
                                </p>
                                <p className="text-[#5B7C93] text-sm md:text-base leading-relaxed mb-2 md:mb-3">
                                    كل خطوة تتضمن صوراً توضيحية من لوحة التحكم والموقع الرئيسي لتوضيح كيفية ظهور المنتجات.
                                </p>
                                <p className="text-[#5B7C93] text-sm md:text-base leading-relaxed">
                                    اتبع الخطوات بالترتيب للتمكن من إضافة منتجك الأول في دقائق معدودة.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="px-4 md:px-8 pb-4 md:pb-8">
                    <div className="border border-[#E5EBF0] rounded-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-8">
                        <StepContent />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        {/* زر إغلاق - يسار */}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 bg-[#2D496A] hover:bg-[#223952] text-white px-4 md:px-6 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors"
                        >
                            <span>إغلاق</span>
                            <X className="w-4 h-4" />
                        </button>

                        {/* Dots - منتصف */}
                        <div className="flex items-center gap-2">
                            {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setGuideStep(s)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-200",
                                        guideStep === s ? "bg-[#2D496A] w-6" : "w-2 bg-[#C8D7E8] hover:bg-[#5B87B9]"
                                    )}
                                />
                            ))}
                        </div>

                        {/* أزرار التنقل - يمين */}
                        <div className="flex items-center gap-2">
                            {guideStep > 1 && guideStep < STEP_COUNT && (
                                <button
                                    onClick={() => setGuideStep((s) => Math.max(1, s - 1))}
                                    className="flex items-center justify-center gap-2 border border-[#E8EDF2] bg-white hover:bg-[#F8FAFB] text-[#2D496A] px-4 md:px-6 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                                        <path d="M8 15L13 10L8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    رجوع
                                </button>
                            )}
                            {guideStep < STEP_COUNT ? (
                                <button
                                    onClick={() => setGuideStep((s) => Math.min(STEP_COUNT, s + 1))}
                                    className="flex items-center justify-center gap-2 bg-[#2D496A] hover:bg-[#223952] text-white px-4 md:px-6 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors"
                                >
                                    التالي
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                                        <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setGuideStep((s) => Math.max(1, s - 1))}
                                    className="flex items-center justify-center gap-2 border border-[#E8EDF2] bg-white hover:bg-[#F8FAFB] text-[#2D496A] px-4 md:px-6 py-2.5 rounded-lg text-sm md:text-base font-medium transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                                        <path d="M8 15L13 10L8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    رجوع
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
