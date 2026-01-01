"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/client/auth";
import { setTokenCookie } from "@/client/token";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res: any = await login({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      const token = res.token;
      if (token) {
        setTokenCookie(token);
        console.log(document.cookie);
      }

      const role = res.user?.role;
      if (role === "admin") router.push("/admin");
      else if (role === "doctor") router.push("/doctor");
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative px-6">
      {/* Decorative pattern */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-5 bg-[radial-gradient(circle,var(--color-white)_1px,transparent_1px)] bg-[length:20px_20px]" />
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 bg-[radial-gradient(circle,var(--color-white)_1px,transparent_1px)] bg-[length:20px_20px]" />

      <div className="w-full max-w-md p-8 rounded-2xl border border-foreground/10 bg-background shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Login</h1>
        <p className="text-sm opacity-70 mb-8">
          Masuk untuk mengakses sistem layanan kesehatan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@hospital.com"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:border-primary"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:border-primary"
            />
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-background font-medium hover:bg-primary-light transition disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 opacity-70">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
