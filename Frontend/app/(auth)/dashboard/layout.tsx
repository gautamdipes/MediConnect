import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-xl font-semibold mb-4">MediConnect</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard/profile" className="block py-2 px-3 rounded hover:bg-gray-100">
              Profile
            </Link>
          </li>
          <li>
            <Link href="/dashboard/password" className="block py-2 px-3 rounded hover:bg-gray-100">
              Change Password
            </Link>
          </li>
        </ul>
      </nav>
      {/* Main content area */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
