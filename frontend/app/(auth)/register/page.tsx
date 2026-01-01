"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/client/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      password_confirmation: formData.get("confirmPassword") as string,
    };

    try {
      const res: any = await register(payload);

      // Normal flow → redirect ke OTP
      sessionStorage.setItem("pending_email", payload.email);
      router.push("/otp");
    } catch (err: any) {
      // jika error karena email sudah ada tapi belum OTP
      if (err.code === "email_pending_verification") {
        sessionStorage.setItem("pending_email", payload.email);
        router.push("/otp"); // langsung ke OTP
      } else {
        setError(err.message || "Registrasi gagal");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative px-6">
      <div className="w-full max-w-md p-8 rounded-2xl border border-foreground/10 bg-background shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Registrasi</h1>
        <p className="text-sm opacity-70 mb-8">
          Buat akun baru untuk mengakses layanan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Nama */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Nama lengkap"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:border-primary"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="email@domain.com"
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
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:border-primary"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Konfirmasi Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Ulangi password"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-background font-medium hover:bg-primary-light transition disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 opacity-70">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
