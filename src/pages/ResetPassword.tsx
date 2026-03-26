import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-indigo-700">
            Reset Your Password
          </CardTitle>
          <p className="text-sm text-gray-500">
            Enter a new password to recover your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <Label className="text-gray-700">New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-700">Confirm Password</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            {message && (
              <Alert className="text-center bg-gray-100 border">
                <AlertDescription className="text-sm">{message}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
