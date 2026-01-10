export function getRelativeTimeArabic(dateString: string): string {
    const date = new Date(dateString);
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

export function formatDateArabic(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}
