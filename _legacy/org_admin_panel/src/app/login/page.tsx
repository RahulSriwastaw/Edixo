"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export default function OrgAdminLogin() {
    const router = useRouter();
    const [orgId, setOrgId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api'}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orgId, email, password, role: "ORG_STAFF" }),
            });

            const data = await res.json();

            if (data.success) {
                document.cookie = `token=${data.data.accessToken}; path=/; max-age=86400;`;
                toast.success("Login successful!");
                router.push("/");
            } else {
                toast.error(data.message || "Login failed");
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
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">EduHub Org Admin</h1>
                <p className="text-gray-500">Institute Management System</p>
            </div>

            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Enter your institute credentials to access the panel</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organization ID</label>
                            <Input
                                placeholder="demo-org"
                                value={orgId}
                                onChange={(e) => setOrgId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email address</label>
                            <Input
                                type="email"
                                placeholder="orgadmin@eduhub.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-sm text-gray-400">
                Use <span className="font-mono text-gray-500">demo-org</span> / <span className="font-mono text-gray-500">orgadmin@eduhub.com</span> / <span className="font-mono text-gray-500">password123</span> for demo
            </p>
        </div>
    );
}
