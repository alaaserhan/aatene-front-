'use client';

interface GuideImageRowProps {
    image: string;
    alt: string;
    text: string;
}

export function GuideImageRow({ image, alt, text }: GuideImageRowProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="w-full md:w-auto md:max-w-24 md:shrink-0 flex flex-col gap-4">
                {text.split('\n').map((line, index) => (
                    <p
                        key={index}
                        className="text-[#2D496A] text-sm leading-relaxed text-center md:text-right"
                    >
                        {line}
                    </p>
                ))}
            </div>
            <img
                src={image}
                alt={alt}
                className="w-full md:flex-1 md:min-w-0 h-auto rounded-lg drop-shadow-xl"
                loading="lazy"
            />
        </div>
    );
}
