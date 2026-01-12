// src/components/ui/RichTextEditor.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { HelpCircle, X } from "lucide-react";
import { Tooltip } from "@/src/components/ui/Tooltip";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  helpTooltip?: string;
  maxLength?: number | null;
  maxWords?: number | null;
  rows?: number;
  error?: string;
  className?: string;
  dir?: "rtl" | "ltr";
}

type ModalType = "link" | "image" | "table" | "color" | "hiliteColor" | null;

// دالة مساعدة للتحقق من صحة الرابط
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

export function RichTextEditor({
  value,
  onChange,
  label = "وصف المنتج",
  placeholder = "...نص المحتوى",
  helpText = "ماهو وصف المنتج",
  helpTooltip = "اكتب وصفًا تفصيليًا يشرح مميزات المنتج، خامته، طريقة استخدامه، والمعلومات الإضافية التي قد تساعد العميل في اتخاذ قرار الشراء. يمكنك استخدام فقرات أو نقاط مرتبة لتوضيح التفاصيل.",
  maxLength,
  maxWords,
  error,
  className,
  dir: initialDir = "rtl",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [currentDir, setCurrentDir] = useState<"rtl" | "ltr">(initialDir);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState(""); // حالة لرسالة خطأ الرابط
  const [textInput, setTextInput] = useState("");
  const [rowsInput, setRowsInput] = useState(2);
  const [colsInput, setColsInput] = useState(2);
  const [colorInput, setColorInput] = useState("#000000");

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    setIsEmpty(!value || value === "<br>" || value === "");
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.dir = currentDir;
    }
  }, [currentDir]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
    }
  };

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setIsEmpty(!html || html === "<br>" || html === "");
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const openModal = (type: ModalType) => {
    saveSelection();
    setModalType(type);

    setUrlInput("");
    setUrlError(""); // تصفير الخطأ عند الفتح
    setTextInput("");
    setRowsInput(2);
    setColsInput(2);
    setColorInput(type === "hiliteColor" ? "#ffff00" : "#000000");

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSavedRange(null);
  };

  const handleModalSave = () => {
    restoreSelection();

    if (modalType === "link" || modalType === "image") {
      // التحقق من صحة الرابط
      if (!urlInput || !isValidUrl(urlInput)) {
        setUrlError("الرجاء إدخال رابط صحيح (مثال: https://example.com)");
        return; // إيقاف العملية إذا كان الرابط غير صالح
      }

      if (modalType === "link") {
        execCommand("createLink", urlInput);
      } else {
        execCommand("insertImage", urlInput);
      }
    } else if (modalType === "color") {
      execCommand("foreColor", colorInput);
    } else if (modalType === "hiliteColor") {
      execCommand("hiliteColor", colorInput);
    } else if (modalType === "table") {
      if (rowsInput > 0 && colsInput > 0) {
        let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 8px 0;"><tbody>';
        for (let i = 0; i < rowsInput; i++) {
          tableHtml += "<tr>";
          for (let j = 0; j < colsInput; j++) {
            tableHtml += '<td style="border: 1px solid #e5e7eb; padding: 8px;">&nbsp;</td>';
          }
          tableHtml += "</tr>";
        }
        tableHtml += "</tbody></table>";
        execCommand("insertHTML", tableHtml);
      }
    }

    closeModal();
  };

  const charCount = value.replace(/<[^>]*>/g, "").length;

  return (
    <div className={cn("space-y-2 relative flex flex-col", className)}>
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          {label && <label className="text-sm font-medium">{label}</label>}
          {
            (maxLength || maxWords) &&
            <div>
              <span className="text-xs text-gray-3">
                عدد الكلمات المتاحة في الوصف هي {maxWords} كلمة
              </span>
              <span className="text-xs text-gray-3 ms-2">
                {charCount}/{maxLength}
              </span>
            </div>

          }
        </div>
        <div className="flex items-center gap-4">

          {helpTooltip && (
            <Tooltip
              trigger={
                <div className="flex items-center gap-1 text-blue-4 cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{helpText}</span>
                </div>
              }
              content={helpTooltip}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all flex flex-col flex-1 min-h-0",
          isFocused
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-gray-200",
          error && "border-red-500"
        )}
      >
        <div className="flex items-center p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto shrink-0" dir="rtl">
          <div className="flex items-center gap-0.5 flex-nowrap">
            <ToolbarButton onClick={() => execCommand("bold")} title="عريض">
              <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("italic")} title="مائل">
              <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("underline")} title="تسطير">
              <span className="underline">U</span>
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => execCommand("insertParagraph")} title="فقرة">
              <span>¶</span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setCurrentDir("rtl")}
              title="اتجاه من اليمين لليسار"
              className={cn(currentDir === "rtl" && "bg-gray-200 text-black")}
            >
              <RightToLeftIcon />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setCurrentDir("ltr")}
              title="اتجاه من اليسار لليمين"
              className={cn(currentDir === "ltr" && "bg-gray-200 text-black")}
            >
              <LeftToRightIcon />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => execCommand("justifyRight")} title="محاذاة لليمين">
              <AlignRightIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("justifyCenter")} title="توسيط">
              <AlignCenterIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("justifyLeft")} title="محاذاة لليسار">
              <AlignLeftIcon />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="قائمة نقطية">
              <BulletListIcon />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="قائمة مرقمة">
              <NumberedListIcon />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => execCommand("formatBlock", "<h1>")} title="عنوان 1">
              <span className="text-xs font-semibold">H₁</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("formatBlock", "<h2>")} title="عنوان 2">
              <span className="text-xs font-semibold">H₂</span>
            </ToolbarButton>

            <Divider />

            <ToolbarButton
              onClick={() => openModal("color")}
              title="لون النص"
            >
              <span className="relative">
                <span className="font-semibold text-red-600">A</span>
                <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-red-500 rounded" />
              </span>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => openModal("hiliteColor")}
              title="لون الخلفية"
            >
              <span className="bg-yellow-200 px-1 font-semibold rounded">A</span>
            </ToolbarButton>

            <Divider />

            <ToolbarButton
              onClick={() => openModal("image")}
              title="إدراج صورة"
            >
              <ImageIcon />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => openModal("table")}
              title="إدراج جدول"
            >
              <TableIcon />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
              onClick={() => openModal("link")}
              title="إدراج رابط"
            >
              <LinkIcon />
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => execCommand("removeFormat")} title="مسح التنسيق">
              <span className="text-xs">T<sub>x</sub></span>
            </ToolbarButton>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden flex flex-col min-h-0">
          <div
            ref={editorRef}
            contentEditable
            dir={currentDir}
            className={cn(
              "w-full px-4 py-3 focus:outline-none text-sm bg-white overflow-y-auto flex-1 h-full",
              currentDir === "rtl" ? "text-right" : "text-left"
            )}
            onInput={handleInput}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {isEmpty && (
            <div
              className={cn(
                "absolute top-3 text-gray-2 text-sm pointer-events-none",
                currentDir === "rtl" ? "right-4" : "left-4"
              )}
            >
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold ">
                {modalType === "link" && "إضافة رابط"}
                {modalType === "image" && "إضافة صورة"}
                {modalType === "table" && "إضافة جدول"}
                {modalType === "color" && "لون النص"}
                {modalType === "hiliteColor" && "لون الخلفية"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-2 hover:text-gray-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {(modalType === "link" || modalType === "image") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-start">
                    {modalType === "link" ? "الرابط (URL)" : "رابط الصورة"}
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (urlError) setUrlError(""); // إخفاء الخطأ عند الكتابة
                    }}
                    placeholder="https://example.com"
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ltr",
                      urlError ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    )}
                    autoFocus
                  />
                  {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
                </div>
              )}

              {modalType === "table" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 text-start">عدد الصفوف</label>
                    <input
                      type="number"
                      min="1"
                      value={rowsInput}
                      onChange={(e) => setRowsInput(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 text-start">عدد الأعمدة</label>
                    <input
                      type="number"
                      min="1"
                      value={colsInput}
                      onChange={(e) => setColsInput(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}

              {(modalType === "color" || modalType === "hiliteColor") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-start">اختر اللون</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="h-10 w-full cursor-pointer rounded border border-gray-200"
                    />
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm ltr"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={handleModalSave}
                className="px-6 py-2 bg-[#3A5779] text-white rounded-lg text-sm font-medium hover:bg-[#2c425e] transition-colors"
              >
                حفظ
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        [contenteditable] blockquote {
          border-right: 3px solid #3b82f6;
          padding-right: 1rem;
          padding-left: 0;
          margin: 0.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        [contenteditable][dir="ltr"] blockquote {
          border-right: none;
          border-left: 3px solid #3b82f6;
          padding-right: 0;
          padding-left: 1rem;
        }
        [contenteditable] pre {
          background: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-family: ui-monospace, monospace;
          overflow-x: auto;
          margin: 0.5rem 0;
          direction: ltr;
          text-align: left;
        }
        [contenteditable] h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.5rem 0;
          line-height: 1.3;
        }
        [contenteditable] h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
          line-height: 1.3;
        }
        [contenteditable] ul {
          list-style-type: disc;
          padding-right: 1.5rem;
          margin: 0.5rem 0;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          padding-right: 1.5rem;
          margin: 0.5rem 0;
        }
        [contenteditable][dir="ltr"] ul,
        [contenteditable][dir="ltr"] ol {
          padding-right: 0;
          padding-left: 1.5rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
          border-radius: 0.375rem;
        }
        [contenteditable] table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.5rem 0;
        }
        [contenteditable] td,
        [contenteditable] th {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: right;
        }
        [contenteditable][dir="ltr"] td,
        [contenteditable][dir="ltr"] th {
          text-align: left;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded text-gray-2 hover:bg-gray-200 hover: transition-colors",
        className
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-1 flex-shrink-0" />;
}

function RightToLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19h16" />
      <path d="M10 5v14" />
      <path d="M14 5v14" />
      <path d="M8 5a4 4 0 1 1 8 0" />
      <path d="M20 19l-3 3" />
      <path d="M20 19l-3-3" />
    </svg>
  );
}

function LeftToRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 19H4" />
      <path d="M10 5v14" />
      <path d="M14 5v14" />
      <path d="M8 5a4 4 0 1 1 8 0" />
      <path d="M4 19l3 3" />
      <path d="M4 19l3-3" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="12" x2="9" y2="12" />
      <line x1="21" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="17" y1="12" x2="7" y2="12" />
      <line x1="21" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="15" y1="12" x2="3" y2="12" />
      <line x1="21" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" strokeWidth="1.5" />
      <path d="M4 12h2" strokeWidth="1.5" />
      <path d="M4 18h2" strokeWidth="1.5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}