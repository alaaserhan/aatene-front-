"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Settings,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
  TreePine,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  Umbrella,
  UserCircle,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { uploadMedia } from "@/src/features/(dashboard)/mediaCenter/api";

const PRESETS = [
  { id: "Dark Studio", label: "استوديو أسود", icon: Moon },
  { id: "White Studio", label: "استوديو أبيض", icon: Sun },
  { id: "Smoke Studio", label: "استوديو متدرج", icon: Sparkles },
  { id: "Industrial", label: "لينكدإن احترافي", icon: UserCircle },
  { id: "Cafe", label: "مقهى", icon: Coffee },
  { id: "Modern Office", label: "مكتب عصري", icon: Briefcase },
  { id: "Beach", label: "شاطئ", icon: Umbrella },
  { id: "Natural Wood", label: "خشب طبيعي", icon: TreePine },
  { id: "Luxury Marble", label: "رخام فاخر", icon: Sparkles },
];

const LIGHTINGS = [
  { id: "Soft", label: "إضاءة ناعمة" },
  { id: "Dramatic", label: "إضاءة درامية" },
  { id: "Natural", label: "إضاءة طبيعية" },
  { id: "Ring Light", label: "حلقة إضاءة" },
  { id: "Golden Hour", label: "الساعة الذهبية" },
  { id: "Neon", label: "نيون" },
];

const STYLES = [
  { id: "Minimalist", label: "بسيط" },
  { id: "Luxury", label: "فاخر" },
  { id: "Lifestyle", label: "واقعي" },
  { id: "Editorial", label: "تحريري" },
  { id: "E-commerce", label: "تجارة إلكترونية" },
];

const ANGLES = [
  { id: "Front", label: "أمامي" },
  { id: "Hero Shot", label: "زاوية البطل" },
  { id: "Flat Lay", label: "فلات لاي" },
  { id: "45° Angle", label: "زاوية 45" },
  { id: "Side", label: "جانبي" },
];

export function AiPhotographerPage() {
  const [preset, setPreset] = useState<string>("Dark Studio");
  const [lighting, setLighting] = useState<string>("");
  const [visualStyle, setVisualStyle] = useState<string>("");
  const [cameraAngle, setCameraAngle] = useState<string>("");
  const [promptText, setPromptText] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setUploadedPreview(URL.createObjectURL(file));
    setGeneratedImage(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploaded = () => {
    setUploadedFile(null);
    setUploadedPreview(null);
    setGeneratedImage(null);
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      setError("يرجى رفع صورة أولاً.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 1) Upload image
      const mediaResponse = await uploadMedia({ file: uploadedFile, type: "image" });
      if (!mediaResponse.status || !mediaResponse.data?.url) {
        throw new Error("فشل رفع الصورة إلى الخادم.");
      }
      let imageUrl = mediaResponse.data.url;
      if (imageUrl.startsWith("/")) {
        imageUrl = `https://api.mosaady.com${imageUrl}`;
      }

      // 2. Send request to our AI Photographer API
      const form = new FormData();
      form.append("image_url", imageUrl); 
      form.append("image_urls", JSON.stringify([imageUrl]));
      form.append("preset_setting", preset);
      if (lighting) form.append("lighting_style", lighting);
      if (visualStyle) form.append("visual_style", visualStyle);
      if (cameraAngle) form.append("camera_angle", cameraAngle);
      if (promptText) form.append("additional_prompt", promptText);

      const res = await fetch("/api/ai-photographer/image", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء التوليد.");
        return;
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImage(data.images[0]);
      } else {
        setError("لم يتم إرجاع أي صورة.");
      }
    } catch (err: any) {
      setError(err.message || "تعذّر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAFA] w-full text-right flex justify-center py-4 px-2 sm:px-4" dir="rtl">
      {/* Main Container */}
      <div className="w-full max-w-[1280px] h-auto bg-white rounded-[16px] px-4 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6 flex flex-col gap-6 shadow-sm border border-[#E4E9F2]">

        {/* Top Header */}
        <div className="flex items-center justify-between w-full border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5 px-3 py-1.5 border border-[#E4E9F2] bg-[#F8FAFC] rounded-full">
              <span className="text-[#3B70AF] font-bold text-[14px]">1340 رصيد</span>
              <img src="/ai/coins.svg" alt="coins" className="w-[16px] h-[16px]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3B70AF]">
              <span className="font-bold text-lg">A</span>
            </div>
            <h1 className="text-[20px] font-bold text-[#0F172A]">المصور المحترف</h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">

          {/* Right Sidebar (Settings) - Order 1 on Desktop */}
          <div className="w-full lg:w-[340px] space-y-4 shrink-0 order-2 lg:order-1">

            {/* Presets Block */}
            <div className="w-full bg-[#F8FAFC] rounded-[16px] border border-[#E4E9F2] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E4E9F2] bg-[#F1F5F9]/50">
                <div className="w-6 h-6 rounded-full bg-[#EEF2F6] text-[#5A8BC4] flex items-center justify-center">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[15px] text-[#334155]">أختر الإعداد</span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {PRESETS.map((p) => {
                  const isSelected = preset === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id)}
                      className={`flex flex-col items-center justify-center gap-2 h-[84px] rounded-[12px] border transition-all ${isSelected
                        ? "border-[#3B70AF] bg-white text-[#3B70AF] shadow-sm"
                        : "border-[#E4E9F2] bg-white text-[#64748B] hover:border-[#CBD5E1]"
                        }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "text-[#3B70AF]" : "text-[#94A3B8]"}`} />
                      <span className="text-[12px] font-bold">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Options Block */}
            <div className="w-full bg-[#F8FAFC] rounded-[16px] border border-[#E4E9F2] overflow-hidden">
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#F1F5F9]/50 hover:bg-[#F1F5F9] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#EEF2F6] text-[#5A8BC4] flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[15px] text-[#334155]">خيارات متقدمة (اختياري)</span>
                </div>
                {advancedOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                )}
              </button>

              {advancedOpen && (
                <div className="p-5 space-y-5 border-t border-[#E4E9F2] bg-white">
                  {/* Lighting */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-[#475569]">الإضاءة*</label>
                    <div className="flex flex-wrap gap-2">
                      {LIGHTINGS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setLighting(lighting === item.id ? "" : item.id)}
                          className={`px-3 py-1.5 rounded-full text-[12px] border transition-all ${lighting === item.id
                            ? "border-[#3B70AF] text-[#3B70AF] bg-[#EFF6FF]"
                            : "border-[#E4E9F2] text-[#64748B] hover:bg-gray-50"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-[#475569]">الستايل*</label>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setVisualStyle(visualStyle === item.id ? "" : item.id)}
                          className={`px-3 py-1.5 rounded-full text-[12px] border transition-all ${visualStyle === item.id
                            ? "border-[#3B70AF] text-[#3B70AF] bg-[#EFF6FF]"
                            : "border-[#E4E9F2] text-[#64748B] hover:bg-gray-50"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Camera Angle */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-[#475569]">زاوية الكاميرا*</label>
                    <div className="flex flex-wrap gap-2">
                      {ANGLES.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCameraAngle(cameraAngle === item.id ? "" : item.id)}
                          className={`px-3 py-1.5 rounded-full text-[12px] border transition-all ${cameraAngle === item.id
                            ? "border-[#3B70AF] text-[#3B70AF] bg-[#EFF6FF]"
                            : "border-[#E4E9F2] text-[#64748B] hover:bg-gray-50"
                            }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-[12px]">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 text-[13px] font-medium leading-snug">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#4878B5] hover:bg-[#3B669D] disabled:opacity-70 text-white h-[52px] rounded-full font-bold text-[15px] transition-all shadow-[0_4px_14px_rgba(72,120,181,0.25)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {loading ? "جاري الإنشاء..." : "إنشاء الصورة ( 8 رصيد )"}
            </button>
          </div>

          {/* Left Content Area - Order 2 on Desktop */}
          <div className="flex-1 space-y-4 order-1 lg:order-2">

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[220px] rounded-[14px] border-[2px] border-dashed border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {uploadedPreview ? (
                <div 
                  className="relative w-[180px] h-[180px] rounded-[16px] overflow-hidden group/item cursor-pointer z-10 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <img
                    src={uploadedPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2 opacity-80 group-hover/item:opacity-100 transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploaded();
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-md hover:bg-[#EA580C] transition-colors"
                  >
                    <span className="-translate-y-px text-[14px]">×</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 bg-[#F1F5F9] rounded-md flex items-center justify-center mb-3 text-[#94A3B8]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#334155] mb-2">أضف صورة</h3>
                  <p className="text-[13px] text-[#94A3B8] mb-3">
                    ارفع حتى 4 صور من نفس المنتج أو الشخص لنتائج أفضل
                  </p>
                  <div className="px-3 py-1 bg-white border border-[#E4E9F2] rounded-[14px] text-[11px] text-[#94A3B8] font-medium">
                    من 30 ل 39 ثانية
                  </div>
                </>
              )}
            </div>

            {/* Prompt Textarea */}
            <div className="w-full h-[88px] rounded-[12px] bg-[#F8FAFC] p-3 relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                maxLength={200}
                placeholder="أضف تفاصيل إضافية للخلفية (اختياري)"
                className="w-full h-full bg-transparent resize-none outline-none text-[#334155] placeholder:text-[#94A3B8] text-[14px]"
              />
              <div className="absolute bottom-2 left-3 text-[11px] text-[#94A3B8] font-medium">
                {promptText.length}/200
              </div>
            </div>

            {/* Generated State OR Empty State */}
            {loading ? (
              <div className="w-full h-[360px] rounded-[14px] border-2 border-dashed border-[#CBD5E1] bg-white flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-[#EFF6FF] border-t-[#3B70AF] animate-spin" />
                <p className="text-[#3B70AF] font-bold">جاري معالجة الصورة...</p>
              </div>
            ) : generatedImage ? (
              <div className="w-full rounded-[14px] border border-[#E4E9F2] overflow-hidden bg-white shadow-sm flex flex-col">
                <div className="h-[54px] px-4 flex items-center justify-between bg-[#F8FAFC] border-b border-[#E4E9F2]">
                  <button
                    type="button"
                    onClick={() => {
                      if (!generatedImage) return;
                      const a = document.createElement("a");
                      a.href = generatedImage;
                      a.download = "photographer-result.png";
                      a.click();
                    }}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-[#5A8BC4] bg-[#EEF2F6] hover:bg-[#E2E8F0] transition-colors"
                  >
                    <Upload className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="text-[16px] font-bold text-[#334155]">تنزيل الصورة</span>
                </div>

                <div className="p-5 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                      <p className="text-[#94A3B8] text-[14px] font-bold text-center">الصورة المعالجة</p>
                      <div className="aspect-square w-full rounded-[16px] overflow-hidden shadow-sm bg-black">
                        <img src={generatedImage} alt="processed" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-[#94A3B8] text-[14px] font-bold text-center">الصورة الاصلية</p>
                      <div className="aspect-square w-full rounded-[16px] overflow-hidden shadow-sm bg-black">
                        {uploadedPreview ? (
                          <img src={uploadedPreview} alt="original" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#94A3B8] bg-[#F8FAFC]">لا توجد صورة</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <div className="flex gap-2">
                       <button className="text-[#94A3B8] hover:text-[#64748B] transition-colors"><ThumbsDown className="w-5 h-5" /></button>
                       <button className="text-[#94A3B8] hover:text-[#3B70AF] transition-colors"><ThumbsUp className="w-5 h-5" /></button>
                    </div>
                    <p className="text-[12.5px] font-medium text-[#94A3B8]">تقييمك يساعد الذكاء الاصطناعي علي فهمك لاعطائك نتائج أفضل</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full min-h-[360px] h-full rounded-[14px] border-[2px] border-dashed border-[#CBD5E1] bg-[#FAFBFC] flex flex-col items-center justify-center text-center">
                <div className="w-[52px] h-[52px] bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4 text-[#94A3B8]">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-[15px] font-bold text-[#334155] mb-2">ستظهر صورتك هنا</h3>
                <p className="text-[13px] text-[#94A3B8]">أضف صورتك في الاعلي وأضغط علي إنشاء</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
