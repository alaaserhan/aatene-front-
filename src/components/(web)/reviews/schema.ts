import { z } from "zod";

export const MAX_CONTENT_LENGTH = 1000;
export const MAX_MEDIA_FILES = 6;
export const MAX_VIDEO_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

/**
 * Replies go through the same endpoint as reviews, and the backend requires
 * `rate >= 1`. The rating UI is hidden for replies, so send a neutral 5.
 */
export const REPLY_DEFAULT_RATE = 5;

/** `z.custom` instead of `z.instanceof(File)` — `File` is not a global during SSR. */
const mediaSchema = z
    .array(z.custom<File>((value) => value instanceof File))
    .max(MAX_MEDIA_FILES, `يمكنك إرفاق ${MAX_MEDIA_FILES} ملفات كحد أقصى`)
    .refine(
        (files) => files.every((file) => !file.type.startsWith("video/") || file.size <= MAX_VIDEO_SIZE_BYTES),
        `حجم الفيديو كبير جدًا — الحد الأقصى المسموح به هو ${MAX_VIDEO_SIZE_MB} ميغابايت`,
    );

const contentSchema = (isReply: boolean) =>
    z
        .string()
        .trim()
        .min(1, isReply ? "يرجى كتابة الرد قبل الإرسال" : "يرجى كتابة مراجعتك قبل الإرسال")
        .max(MAX_CONTENT_LENGTH, `الحد الأقصى ${MAX_CONTENT_LENGTH} حرف`);

/** Stars are hidden for replies, so only reviews require one. */
const rateSchema = (isReply: boolean) =>
    isReply ? z.number() : z.number().min(1, "يرجى اختيار تقييم النجوم");

/** Schema for the create form — a review always carries a rating and may carry media. */
export function buildReviewSchema() {
    return z.object({
        content: contentSchema(false),
        rate: rateSchema(false),
        images: mediaSchema,
    });
}

/** Schema for the inline reply box — text only. */
export function buildReplySchema() {
    return z.object({ content: contentSchema(true) });
}

/**
 * Schema for the inline edit form. Media is split in two: `keptImages` are the
 * URLs already stored on the review that the user did not remove, `images` are
 * newly picked files. Both count against the same limit.
 */
export function buildReviewEditSchema(isReply: boolean) {
    return z
        .object({
            content: contentSchema(isReply),
            rate: rateSchema(isReply),
            keptImages: z.array(z.string()),
            images: mediaSchema,
        })
        .superRefine((values, ctx) => {
            if (values.keptImages.length + values.images.length > MAX_MEDIA_FILES) {
                ctx.addIssue({
                    code: "custom",
                    path: ["images"],
                    message: `يمكنك إرفاق ${MAX_MEDIA_FILES} ملفات كحد أقصى`,
                });
            }
        });
}

export type ReviewFormValues = z.infer<ReturnType<typeof buildReviewSchema>>;
export type ReplyFormValues = z.infer<ReturnType<typeof buildReplySchema>>;
export type ReviewEditValues = z.infer<ReturnType<typeof buildReviewEditSchema>>;

export const EMPTY_REVIEW_VALUES: ReviewFormValues = { content: "", rate: 0, images: [] };
