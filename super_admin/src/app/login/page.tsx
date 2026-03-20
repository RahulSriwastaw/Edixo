"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export default function SuperAdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, role: "SUPER_ADMIN" }),
            });

            const data = await res.json();

            if (data.success) {
                // Use a simple API route or js-cookie to set the token, then redirect.
                // For simplicity right now, we stash it in localStorage and use a simple document.cookie hack or rely on middleware.
                document.cookie = `sb_token=${data.data.accessToken}; path=/; max-age=86400;`;
                toast.success("Login successful!");
                router.push("/");
            } else {
                toast.error(data.error?.message || "Login failed");
            }
        } catch (err) {
            toast.error("Network error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-bg flex flex-col justify-center items-center p-4">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">EduHub Super Admin</h1>
                <p className="text-gray-500">Platform Management System</p>
            </div>

            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email address</label>
                            <Input
                                type="email"
                                placeholder="admin@eduhub.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="SuperAdmin@123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-sm text-gray-400">
                Use <span className="font-mono text-gray-500">admin@eduhub.in</span> / <span className="font-mono text-gray-500">SuperAdmin@123</span>
            </p>
        </div>
    );
}
