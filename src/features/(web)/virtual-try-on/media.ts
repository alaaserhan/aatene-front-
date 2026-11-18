import { toast } from "sonner";
import { fixMediaUrl } from "@/src/lib/utils";

export async function downloadTryOnImage(url: string, filename: string) {
  try {
    const response = await fetch(fixMediaUrl(url));
    if (!response.ok) throw new Error("download");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    toast.error("تعذر تنزيل الصورة. يرجى المحاولة مجددًا.");
  }
}

export async function shareTryOnImage(url: string) {
  try {
    const absoluteUrl = new URL(fixMediaUrl(url), window.location.origin).href;
    if (navigator.share) {
      await navigator.share({ title: "تجربتي على أعطيني", url: absoluteUrl });
    } else {
      await navigator.clipboard.writeText(absoluteUrl);
      toast.success("تم نسخ رابط الصورة.");
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("تعذرت مشاركة الصورة.");
  }
}
