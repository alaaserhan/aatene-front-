'use client';

interface GuideImageRowProps {
    image: string;
    alt: string;
    text: string;
}

export function GuideImageRow({ image, alt, text }: GuideImageRowProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="w-full md:w-auto md:max-w-24 md:shrink-0 text-[#2D496A] text-sm leading-relaxed text-center md:text-right whitespace-pre-line">
                {text}
            </p>
            <img
                src={image}
                alt={alt}
                className="w-full md:flex-1 md:min-w-0 h-auto rounded-lg drop-shadow-xl"
                loading="lazy"
            />
        </div>
    );
}
