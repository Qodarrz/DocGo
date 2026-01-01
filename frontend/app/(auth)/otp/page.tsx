"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pending_email");
    if (!pendingEmail) {
      router.push("/register");
    } else {
      setEmail(pendingEmail);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      console.log({ email, otp });

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "OTP salah");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative px-6">
      <div className="w-full max-w-md p-8 rounded-2xl border border-foreground/10 bg-background shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Verifikasi OTP</h1>
        <p className="text-sm opacity-70 mb-8">
          Masukkan kode OTP yang dikirim ke <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Kode OTP</label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Masukkan 6 digit OTP"
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-primary text-background font-medium hover:bg-primary-light transition"
          >
            Verifikasi
          </button>
        </form>
      </div>
    </main>
  );
}
