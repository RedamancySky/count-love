import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-pink-100 p-6">
      <section className="w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Count Love</h1>
        <p className="mt-2 text-slate-600">Start by creating your account and complete onboarding.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/register" className="rounded-lg bg-rose-600 px-4 py-2 text-white">
            Đăng ký
          </Link>
          <Link href="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700">
            Đăng nhập
          </Link>
        </div>
      </section>
    </main>
  );
}
