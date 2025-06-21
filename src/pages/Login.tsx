import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) navigate("/dashboard");
      else setError("Invalid email or password. Please try again.");
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Left Column */}
      <div className="md:w-1/2 bg-indigo-600 text-white flex flex-col justify-center items-start px-12 py-16 space-y-4">
        <h1 className="text-3xl font-bold">👋 Welcome Back!</h1>
        <p className="text-lg">Track attendance easily.</p>
        <p className="text-lg">Smart attendance system.</p>
      </div>

      {/* Right Column */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-md">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-center">Login to Admin Panel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-indigo-600 text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="text-right text-sm">
  <Link to="/reset-password" className="text-indigo-600 hover:underline">
    Forgot password?
  </Link>
</div>

            <div className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="/signup" className="text-indigo-600 hover:underline">Sign up</a>
              <div className="mt-6 text-xs text-center text-gray-400">
  Made by: <strong>Seeram Shanmukh Srinivas</strong>, <strong>Akash N</strong>, <strong>Nikitha N</strong>
</div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
