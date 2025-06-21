import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },emailRedirectTo: "https://10-tn-bn-attendence.vercel.app/email-verified"
      },
    });

    if (error) {
      setMessage("❌ Signup failed: " + error.message);
    } else {
      setMessage("✅ Signup successful. Please check your email to confirm.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-100 to-indigo-100">
      {/* Left Panel */}
      <div className="hidden md:flex items-center justify-center bg-indigo-700 text-white p-10">
        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl font-bold">👋 Welcome!</h2>
          <p className="text-lg">Join the smart attendance system</p>
          <p className="text-sm text-indigo-200">
            Seamless tracking, simple records, and admin approval for secure access.
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={handleSignup}
          className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-indigo-700">
            Create Account
          </h2>

          <div>
            <Label className="text-sm font-medium text-gray-700">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
            />
          </div>

          {message && (
            <Alert>
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Sign Up
          </Button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
