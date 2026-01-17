"use client";

import { useState } from "react";
import { signIn } from "@/shared/utils/supabaseAuth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 text-black">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full border p-2 mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button onClick={handleLogin} className="w-full bg-black text-white py-2">
        Sign in
      </button>
    </div>
  );
}
