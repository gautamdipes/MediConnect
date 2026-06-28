"use client";
import React, { useEffect, useState, useCallback } from "react";
import UserTable from "../components/UserTable";
import UserModal from "../components/UserModal";
import DeleteModal from "../components/DeleteModal";

const BASE_URL = "http://localhost:5000/api/v1/admin/users";

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

type UserForm = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
};

export default function AdminUsersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    setToken(t);
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search ? { search } : {}),
      });
      const res = await fetch(`${BASE_URL}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleCreate = async (form: UserForm) => {
    setModalLoading(true);
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create user");
      setShowCreate(false);
      fetchUsers();
    } catch (err: any) { alert(err.message); }
    finally { setModalLoading(false); }
  };

  const handleEdit = async (form: UserForm) => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const body: Partial<UserForm> = { ...form };
      if (!body.password) delete body.password;
      const res = await fetch(`${BASE_URL}/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update user");
      setShowEdit(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) { alert(err.message); }
    finally { setModalLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/${selectedUser._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setShowDelete(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) { alert(err.message); }
    finally { setModalLoading(false); }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#0057d9] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <UserTable
          users={users}
          meta={meta}
          search={search}
          onSearchChange={setSearch}
          onEdit={(user) => { setSelectedUser(user); setShowEdit(true); }}
          onDelete={(user) => { setSelectedUser(user); setShowDelete(true); }}
          onPageChange={setPage}
          onCreateClick={() => setShowCreate(true)}
        />
      )}
      {showCreate && <UserModal mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={modalLoading} />}
      {showEdit && selectedUser && <UserModal mode="edit" initialData={selectedUser} onSubmit={handleEdit} onCancel={() => { setShowEdit(false); setSelectedUser(null); }} isLoading={modalLoading} />}
      {showDelete && selectedUser && <DeleteModal userName={selectedUser.fullName || selectedUser.name || selectedUser.email} onConfirm={handleDelete} onCancel={() => { setShowDelete(false); setSelectedUser(null); }} isLoading={modalLoading} />}
    </div>
  );
}
