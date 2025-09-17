"use client";

import { useEffect } from "react";

export default function ForbiddenPage() {
  useEffect(() => {
    // Log the blocked access attempt
    const logBlockedAccess = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log(`Blocked access from IP: ${data.ip} at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Failed to log blocked access:', error);
      }
    };

    logBlockedAccess();

    // Redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Forbidden</h1>
          <p className="text-gray-700 mb-6">
            Your request has been blocked due to suspicious activity or security policy violations.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            If you believe this is an error, please contact the system administrator.
          </div>
          <div className="text-xs text-gray-400">
            You will be redirected automatically in a few seconds...
          </div>
        </div>
        
        <div className="border-t pt-6">
          <p className="text-xs text-gray-500">
            Error Code: 403 - Forbidden<br />
            Timestamp: {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  );
}
