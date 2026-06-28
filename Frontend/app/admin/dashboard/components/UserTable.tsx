"use client";
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

type User = {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
  phoneNumber?: string;
  createdAt: string;
};

type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Props = {
  users: User[];
  meta: Meta;
  search: string;
  onSearchChange: (val: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onPageChange: (page: number) => void;
  onCreateClick: () => void;
};

export default function UserTable({ users, meta, search, onSearchChange, onEdit, onDelete, onPageChange, onCreateClick }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Total {meta.total} users</p>
        </div>
        <button onClick={onCreateClick} className="px-4 py-2 bg-[#0057d9] text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm">+ Create User</button>
      </div>
      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search by name or email..." className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0057d9]" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500 font-semibold">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Phone</th>
              <th className="pb-3 pr-4">Created</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 pr-4 font-medium text-gray-800">{user.fullName || user.name || "—"}</td>
                  <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-blue-100 text-blue-700" : user.role === "patient" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{user.phoneNumber || "—"}</td>
                  <td className="py-3 pr-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Pencil size={16} /></button>
                      <button onClick={() => onDelete(user)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(meta.page - 1)} disabled={meta.page === 1} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition">Previous</button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${p === meta.page ? "bg-[#0057d9] text-white border-[#0057d9]" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>{p}</button>
            ))}
            <button onClick={() => onPageChange(meta.page + 1)} disabled={meta.page === meta.totalPages} className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
