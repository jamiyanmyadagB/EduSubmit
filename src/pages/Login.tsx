/**
 * EduSubmit Login Page
 * Local JWT authentication with email/password
 * Default credentials displayed for demo
 */

import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Loader2, AlertCircle, BookOpen, Users, Shield } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("edusubmit_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const fillCredentials = (role: string) => {
    setEmail(`${role}@gmail.com`);
    setPassword("123");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        {/* Left side - Branding */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">EduSubmit</h1>
              <p className="text-muted-foreground">AI-Powered Academic Portal</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Welcome Back</h2>
            <p className="text-muted-foreground leading-relaxed">
              Submit assignments, get AI-powered feedback, track your grades, and manage your academic journey all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => fillCredentials("student")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors text-left"
            >
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">Student</span>
              <span className="text-xs text-muted-foreground">student@gmail.com</span>
            </button>
            <button
              onClick={() => fillCredentials("teacher")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors text-left"
            >
              <Users className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium">Teacher</span>
              <span className="text-xs text-muted-foreground">teacher@gmail.com</span>
            </button>
            <button
              onClick={() => fillCredentials("admin")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors text-left"
            >
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="text-sm font-medium">Admin</span>
              <span className="text-xs text-muted-foreground">admin@gmail.com</span>
            </button>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>Password for all accounts: <span className="font-mono font-medium text-foreground">123</span></p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center">
          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
