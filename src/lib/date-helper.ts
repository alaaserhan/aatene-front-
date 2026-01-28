import { format } from "date-fns";
import { arSA } from "date-fns/locale";

/**
 * Converts a server date string (UTC) to a local Date object.
 * Attempts to handle cases where the server string implies UTC but lacks the 'Z' suffix.
 */
export function toLocal(dateString: string | Date | null | undefined): Date {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;

    let str = String(dateString);
    // If it looks like "yyyy-MM-dd HH:mm:ss" replacing space with T makes it ISO compatible
    if (str.includes(" ")) {
        str = str.replace(" ", "T");
    }
    // If it doesn't indicate timezone, assume UTC
    if (!str.endsWith("Z") && !str.includes("+")) {
        str += "Z";
    }
    return new Date(str);
}

export function formatDateTime(dateString: string | Date | null | undefined, pattern: string = "dd/MM/yyyy - hh:mm aa"): string {
    if (!dateString) return "-";
    const date = toLocal(dateString);
    // Check for invalid date
    if (isNaN(date.getTime())) return "-";
    return format(date, pattern, { locale: arSA });
}

export function formatDate(dateString: string | Date | null | undefined, pattern: string = "dd/MM/yyyy"): string {
    if (!dateString) return "-";
    const date = toLocal(dateString);
    if (isNaN(date.getTime())) return "-";
    return format(date, pattern, { locale: arSA });
}

export function getRelativeTimeArabic(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";
    const date = toLocal(dateString); // Use toLocal here as well for consistency
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "منذ لحظات";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `منذ ${diffInMinutes} دقيقة`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `منذ ${diffInHours} ساعة`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return "منذ أمس";
    }
    if (diffInDays === 2) {
        return "منذ يومين";
    }
    if (diffInDays < 30) {
        return `منذ ${diffInDays} يوم`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) {
        return "منذ شهر";
    }
    if (diffInMonths === 2) {
        return "منذ شهرين";
    }
    if (diffInMonths < 12) {
        return `منذ ${diffInMonths} شهر`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    if (diffInYears === 1) {
        return "منذ سنة";
    }
    if (diffInYears === 2) {
        return "منذ سنتين";
    }
    return `منذ ${diffInYears} سنة`;
}

export function formatDateArabic(dateString: string | Date | null | undefined): string {
    if (!dateString) return "-";
    const date = toLocal(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}
