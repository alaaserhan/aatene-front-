export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="box-border flex w-full flex-1 flex-col items-center px-4 py-7 sm:py-8 md:py-10 lg:py-12 xl:py-14">
      <div className="flex w-full max-w-[1018px] flex-1 flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
