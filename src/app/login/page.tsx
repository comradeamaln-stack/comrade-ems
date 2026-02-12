"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-actions";
import { Handshake, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(email, password);
            if (result.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <div className="card" style={{ width: "400px", padding: "2.5rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        background: "var(--primary)",
                        color: "white",
                        width: "60px",
                        height: "60px",
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem"
                    }}>
                        <Handshake size={32} />
                    </div>
                    <h1 className="h1" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Welcome Back</h1>
                    <p className="text-muted">Sign in to manage your enquiries</p>
                </div>

                {error && (
                    <div style={{
                        background: "#fef2f2",
                        color: "#991b1b",
                        padding: "0.75rem",
                        borderRadius: "var(--radius)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.875rem"
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label className="label">Email Address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                            <input
                                type="email"
                                className="input"
                                placeholder="name@company.com"
                                style={{ paddingLeft: "2.75rem" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="label">Password</label>
                            <a href="#" style={{ fontSize: "0.75rem", color: "var(--primary)" }}>Forgot password?</a>
                        </div>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                style={{ paddingLeft: "2.75rem" }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", height: "2.75rem", marginTop: "0.5rem" }}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                    Don't have an account? <span style={{ color: "var(--primary)", fontWeight: "600" }}>Contact Administrator</span>
                </div>
            </div>
        </div>
    );
}
