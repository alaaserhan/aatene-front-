/**
 * Helper: استخراج embed URL من روابط الفيديو (YouTube, Vimeo, Dailymotion)
 */
export function getEmbedUrl(url: string, autoplay = false): string | null {
    if (!url) return null;
    
    const autoplayParam = autoplay ? "?autoplay=1" : "";
    
    try {
        // YouTube
        let match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
        if (match) return `https://www.youtube.com/embed/${match[1]}${autoplayParam}`;
        
        // Vimeo
        match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (match) return `https://player.vimeo.com/video/${match[1]}${autoplayParam}`;
        
        // Dailymotion
        match = url.match(/dailymotion\.com\/video\/([\w]+)/);
        if (match) return `https://www.dailymotion.com/embed/video/${match[1]}${autoplayParam}`;
    } catch {
        // Ignore parsing errors
    }
    
    return null;
}
