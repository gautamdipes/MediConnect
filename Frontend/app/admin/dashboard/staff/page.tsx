"use client";

import React, { useState } from "react";

/* ============================================================
   Doctor Management — CONTENT ONLY (no sidebar / no topbar)
   Use this inside your existing admin layout, which already
   renders the sidebar and topbar for every page.
   ============================================================ */

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  hospital: string;
  phone: string;
  status: "verified" | "pending";
}

const DOCTORS: Doctor[] = [
  {
    id: "#DOC-1024",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    initials: "SJ",
    avatarBg: "#DBEAFE",
    avatarText: "#2563EB",
    hospital: "Central General",
    phone: "+1 (555) 012-3456",
    status: "verified",
  },
  {
    id: "#DOC-1025",
    name: "Dr. Marcus Chen",
    specialty: "Surgery",
    initials: "MC",
    avatarBg: "#DCFCE7",
    avatarText: "#16A34A",
    hospital: "North Star Surgical",
    phone: "+1 (555) 012-3457",
    status: "verified",
  },
  {
    id: "#DOC-1026",
    name: "Dr. Elena Rodriguez",
    specialty: "Pediatrics",
    initials: "ER",
    avatarBg: "#FFEDD5",
    avatarText: "#EA580C",
    hospital: "Eastside Community",
    phone: "+1 (555) 012-3458",
    status: "pending",
  },
  {
    id: "#DOC-1049",
    name: "Dr. James Wilson",
    specialty: "Neurology",
    initials: "DJW",
    avatarBg: "#E0E7FF",
    avatarText: "#4F46E5",
    hospital: "Central Hospital",
    phone: "+1 (555) 012-4449",
    status: "verified",
  },
];

export default function DoctorManagementContent() {
  const [page] = useState(1);

  return (
    <div style={{ padding: "24px", fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: "#F8FAFC" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0F172A", margin: 0 }}>Doctor Management</h1>
          <p style={{ color: "#64748B", margin: "4px 0 0 0", fontSize: "14px" }}>
            Manage and monitor hospital medical staff across the network.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <SquareIconButton>
            <RefreshIcon />
          </SquareIconButton>
          <PillButton>
            <FilterIcon /> Filter
          </PillButton>
          <PillButton>
            <ExportIcon /> Export
          </PillButton>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            <span style={{ fontSize: "15px", lineHeight: 1 }}>+</span> Add Doctor
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "18px" }}>
        <StatCard icon={<UsersIcon />} iconBg="#DBEAFE" iconColor="#2563EB" value="342" label="Total Medical Staff" badge="↗ +12" badgeColor="#16A34A" />
        <StatCard icon={<CheckCircleIcon />} iconBg="#DCFCE7" iconColor="#16A34A" value="298" label="Active Practitioners" badge="87% ACTIVE" badgeColor="#16A34A" />
        <StatCard icon={<StethoscopeIcon />} iconBg="#DCFCE7" iconColor="#16A34A" value="156" valueColor="#16A34A" label="Specialists on File" />
        <StatCard icon={<CalendarCheckIcon />} iconBg="#DCFCE7" iconColor="#16A34A" value="84" valueColor="#16A34A" label="Available Today" />
        <StatCard icon={<UserOffIcon />} iconBg="#FEE2E2" iconColor="#DC2626" value="12" valueColor="#DC2626" label="Staff on Leave" />
      </div>

      {/* Search row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", padding: "2px 10px" }}>
          <SearchIcon />
          <input
            placeholder="Search by name, license ID, or specialty..."
            style={{ border: "none", outline: "none", flex: 1, fontSize: "14px", color: "#334155", background: "transparent" }}
          />
        </div>
        <PillButton>
          <SlidersIcon /> Advanced Search
        </PillButton>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "820px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                <Th width="40px">
                  <input type="checkbox" />
                </Th>
                <Th>Practitioner ID</Th>
                <Th>Practitioner Info</Th>
                <Th>Assigned Hospital</Th>
                <Th>Phone/Contact</Th>
                <Th>Verification Status</Th>
                <Th align="right">Management Actions</Th>
              </tr>
            </thead>
            <tbody>
              {DOCTORS.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <Td>
                    <input type="checkbox" />
                  </Td>
                  <Td>
                    <span style={{ fontWeight: 600, color: "#0F172A", fontSize: "14px" }}>{doc.id}</span>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          backgroundColor: doc.avatarBg,
                          color: doc.avatarText,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {doc.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#0F172A", fontSize: "14px" }}>{doc.name}</div>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>{doc.specialty}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span style={{ fontSize: "14px", color: "#334155" }}>{doc.hospital}</span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: "14px", color: "#334155" }}>{doc.phone}</span>
                  </Td>
                  <Td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        backgroundColor: doc.status === "verified" ? "#DCFCE7" : "#DBEAFE",
                        color: doc.status === "verified" ? "#15803D" : "#1D4ED8",
                      }}
                    >
                      {doc.status === "verified" ? "VERIFIED" : "PENDING"}
                    </span>
                  </Td>
                  <Td align="right">
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <ActionIcon>
                        <EyeIcon />
                      </ActionIcon>
                      <ActionIcon>
                        <EditIcon />
                      </ActionIcon>
                      <ActionIcon color="#DC2626">
                        <TrashIcon />
                      </ActionIcon>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#FAFAFA",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#64748B" }}>Showing 20 of 342 doctors</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <PageButton>Previous</PageButton>
            <PageButton active={page === 1}>1</PageButton>
            <PageButton>2</PageButton>
            <PageButton>3</PageButton>
            <PageButton>Next</PageButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Presentational helpers
   ============================================================ */

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  badge,
  badgeColor,
  valueColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  badge?: string;
  badgeColor?: string;
  valueColor?: string;
}) {
  return (
    <div style={{ backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            backgroundColor: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        {badge && <span style={{ fontSize: "11px", fontWeight: 700, color: badgeColor }}>{badge}</span>}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: valueColor || "#0F172A", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "5px" }}>{label}</div>
    </div>
  );
}

function Th({ children, width, align }: { children: React.ReactNode; width?: string; align?: "left" | "right" }) {
  return (
    <th
      style={{
        padding: "11px 16px",
        color: "#475569",
        fontWeight: 600,
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        width,
        textAlign: align || "left",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <td style={{ padding: "13px 16px", textAlign: align || "left" }}>{children}</td>;
}

function ActionIcon({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <button style={{ border: "none", background: "none", cursor: "pointer", color: color || "#64748B", display: "flex", alignItems: "center" }}>
      {children}
    </button>
  );
}

function PageButton({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      style={{
        padding: "6px 12px",
        border: `1px solid ${active ? "#2563EB" : "#CBD5E1"}`,
        borderRadius: "6px",
        backgroundColor: active ? "#2563EB" : "white",
        color: active ? "white" : "#334155",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: active ? 600 : 500,
        minWidth: "34px",
      }}
    >
      {children}
    </button>
  );
}

function PillButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        border: "1px solid #CBD5E1",
        borderRadius: "8px",
        backgroundColor: "white",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        color: "#334155",
      }}
    >
      {children}
    </button>
  );
}

function SquareIconButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #CBD5E1",
        borderRadius: "8px",
        backgroundColor: "white",
        cursor: "pointer",
        color: "#475569",
      }}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Inline icon set
   ============================================================ */

const ip = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg {...ip}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg {...ip}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg {...ip}>
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg {...ip}>
      <path d="M4 21v-7" />
      <path d="M4 10V3" />
      <path d="M12 21v-9" />
      <path d="M12 8V3" />
      <path d="M20 21v-5" />
      <path d="M20 12V3" />
      <path d="M1 14h6" />
      <path d="M9 8h6" />
      <path d="M17 16h6" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg {...ip}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg {...ip}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}
function StethoscopeIcon() {
  return (
    <svg {...ip}>
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6" />
      <path d="M8 15a6 6 0 0 0 6-6V7" />
      <circle cx="20" cy="10" r="2" />
      <path d="M20 12v3a4 4 0 0 1-8 0" />
    </svg>
  );
}
function CalendarCheckIcon() {
  return (
    <svg {...ip}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}
function UserOffIcon() {
  return (
    <svg {...ip}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}