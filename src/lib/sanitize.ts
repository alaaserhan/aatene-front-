import DOMPurify from "isomorphic-dompurify";

/**
 * Kept out of utils.ts on purpose: on the server isomorphic-dompurify loads jsdom, so
 * anything importing `cn()` from a server component would drag jsdom in with it.
 */

/**
 * Strips HTML tags safely and decodes the common entities.
 */
export function stripHtmlTags(html: string | null | undefined): string {
    if (!html) return "";

    const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [],
        KEEP_CONTENT: true,
    });

    // DOMPurify decodes most entities already; these are a safety net.
    return cleanHtml
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return "";
    return DOMPurify.sanitize(html);
}

/**
 * Normalizes any notification body shape (plain text, JSON payload, or HTML
 * email document) into a single-line plain-text summary for list/table cells.
 * Render the HTML itself with NotificationBodyModal instead of this.
 */
export function notificationBodyToText(body: string | null | undefined): string {
    if (!body) return "";

    let raw = body;

    try {
        const parsed = JSON.parse(body);
        raw = typeof parsed === "object" && parsed !== null
            ? parsed.message || parsed.body || parsed.text || parsed.title || ""
            : String(parsed);
    } catch {
        // Not JSON — treat the body as text/HTML as-is.
    }

    return stripHtmlTags(raw).replace(/\s+/g, " ").trim();
}

/**
 * Sanitizes a full HTML document (email template) while keeping <head>, <style>
 * and the document structure intact. The result is only safe to render inside a
 * sandboxed iframe — never inline, since its <style> rules are document-global.
 */
export function sanitizeHtmlDocument(html: string | null | undefined): string {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
        WHOLE_DOCUMENT: true,
        ADD_TAGS: ["style"],
        ADD_ATTR: ["target"],
    });
}
