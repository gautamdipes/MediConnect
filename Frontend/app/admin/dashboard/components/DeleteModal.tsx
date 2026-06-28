"use client";
import React from "react";

type Props = {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function DeleteModal({ userName, onConfirm, onCancel, isLoading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Delete User</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-red-600">{userName}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50">
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
