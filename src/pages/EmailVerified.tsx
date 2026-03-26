import React from "react";

const EmailVerified = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-6 border rounded shadow-md bg-white">
        <h1 className="text-2xl font-bold text-green-600">✅ Email Verified!</h1>
        <p className="mt-2 text-gray-700">Your email has been successfully verified. You can now log in.</p>
        <a
          href="/login"
          className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default EmailVerified;
