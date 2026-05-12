import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "../store/auth";

export function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { username, email, password });
      const form = new URLSearchParams();
      form.set("username", username);
      form.set("password", password);
      const login = await axios.post("/api/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setTokens(login.data.access_token, login.data.refresh_token);
      navigate("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0]?.msg ?? "Registration failed" : detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-12 p-8 rounded-2xl bg-surface border border-border"
    >
      <h1 className="font-display text-3xl text-text mb-1">Forge an account</h1>
      <p className="text-text-dim mb-6">Your campaigns live on your machine.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username" value={username} onChange={setUsername} autoFocus />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        {error && <div className="text-danger text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Forging…" : "Create account"}
        </button>
      </form>
      <div className="mt-6 text-sm text-text-dim text-center">
        Already have one?{" "}
        <Link to="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-text-dim mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-text outline-none focus:border-accent transition"
        required
      />
    </label>
  );
}
