export default function Loading() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div className="h-72 rounded-3xl border border-white/70 bg-white/80 shadow-lg" />
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-80 rounded-3xl border border-white/70 bg-white/80 shadow-lg" />
          <div className="h-80 rounded-3xl border border-white/70 bg-white/80 shadow-lg" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="h-80 rounded-3xl border border-white/70 bg-white/80 shadow-lg" />
          <div className="h-80 rounded-3xl border border-white/70 bg-white/80 shadow-lg" />
        </div>
      </div>
    </main>
  );
}
