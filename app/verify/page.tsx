"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) router.push("/signup");
  }, [email, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Email verified!");
        // The verify endpoint sets the cookie, just refresh auth state
        setTimeout(() => window.location.href = "/", 500);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      // Re-signup triggers a new OTP
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "resend-placeholder", name: "resend" }),
      });
      if (res.ok) {
        setSuccess("New code sent! Check your email.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to resend");
      }
    } catch {
      setError("Network error");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">Verify your email</h1>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-2">
          We sent a 6-digit code to
        </p>
        <p className="text-sm text-[var(--accent)] text-center mb-8 font-medium">
          {email}
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              autoFocus
              className="w-full px-3 py-3 rounded-lg bg-[var(--bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {success && <p className="text-sm text-green-500 text-center">{success}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-secondary)] text-center mt-6">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-[var(--accent)] hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
