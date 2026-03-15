import Image from "next/image";

export default function ComingSoonPage() {
  return (
    <section className="flex w-full flex-1 items-center justify-center bg-linear-to-br from-[#2F77D6] via-[#2569C0] to-[#1E5AA9] px-0 sm:px-6 py-8 sm:py-16 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="w-full">
          <Image
            src="/coming-soon/col-md-6.svg"
            alt="Coming soon illustration"
            width={1440}
            height={589}
            priority
            fetchPriority="high"
            className="mx-auto h-auto w-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
          />

         
        
        </div>
      </div>
    </section>
  );
}
