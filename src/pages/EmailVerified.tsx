import React from "react";

const EmailVerified = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">✅ Email Verified!</h1>
        <p className="text-lg text-gray-700">Your email address has been successfully verified.</p>
        <a href="/login" className="text-blue-600 hover:underline">
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default EmailVerified;
