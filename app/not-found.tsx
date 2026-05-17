// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121820] text-white px-4">
      <Image
        src="/image/fblthp.png"
        alt="Lost"
        width={120}
        height={120}
        className="mb-8 object-contain opacity-80"
      />
      <p className="text-sm uppercase tracking-[0.24em] text-violet-300">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-md text-center text-sm leading-7 text-slate-400">
        The page you're looking for doesn't exist or is still under
        construction.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-violet-600 px-6 py-2 text-sm font-medium transition hover:bg-violet-700"
      >
        Back to Home
      </Link>
    </main>
  );
}
