export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-brand-dark px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm tracking-widest text-accent">THE SHARP TANGJEONG INFINITY CITY 2</p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            더샵 탕정인피니티시티 2차
          </h1>
          <p className="mt-1 text-sm text-white/60">입주예정자 전용 현장안내</p>
        </div>
        <div className="rounded-2xl bg-card p-8 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
