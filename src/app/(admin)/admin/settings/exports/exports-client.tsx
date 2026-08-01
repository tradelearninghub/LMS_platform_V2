"use client";

import { useState, useTransition } from "react";
import {
  exportStudentsAction,
  exportOrdersAction,
  exportEnrollmentsAction,
} from "@/app/(admin)/actions";

export function ExportsClient() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const convertToCSV = (rows: any[]) => {
    if (rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(",")];

    for (const row of rows) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      });
      csvLines.push(values.join(","));
    }

    return csvLines.join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (type: "students" | "orders" | "enrollments") => {
    setExportingType(type);
    startTransition(async () => {
      try {
        let data: any[] = [];
        let filename = `${type}-export`;
        if (startDate || endDate) {
          filename += `-${startDate || "start"}-to-${endDate || "present"}`;
        }
        filename += ".csv";

        if (type === "students") {
          data = await exportStudentsAction(startDate, endDate);
        } else if (type === "orders") {
          data = await exportOrdersAction(startDate, endDate);
        } else if (type === "enrollments") {
          data = await exportEnrollmentsAction(startDate, endDate);
        }

        if (data.length === 0) {
          alert("No records found for the selected date range.");
        } else {
          const csv = convertToCSV(data);
          downloadFile(csv, filename, "text/csv;charset=utf-8;");
        }
      } catch (err) {
        alert("Export failed.");
        console.error(err);
      } finally {
        setExportingType(null);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Data Exports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Export students, order ledgers, and enrollment records in CSV/Excel-compatible format with optional date range filters.
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold text-sm">Date Range Filter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            Clear date filter
          </button>
        )}
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export Students */}
        <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3">
              👥
            </div>
            <h3 className="font-semibold text-base">Students List</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Export all registered student profiles, emails, mobile numbers, and join dates.
            </p>
          </div>
          <button
            onClick={() => handleExport("students")}
            disabled={isPending}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {exportingType === "students" ? "Exporting CSV..." : "Export Students CSV"}
          </button>
        </div>

        {/* Export Orders */}
        <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center font-bold mb-3">
              💳
            </div>
            <h3 className="font-semibold text-base">Order Ledger</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Export all payment transactions, applied coupons, discounts, final amounts, and status.
            </p>
          </div>
          <button
            onClick={() => handleExport("orders")}
            disabled={isPending}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {exportingType === "orders" ? "Exporting CSV..." : "Export Orders CSV"}
          </button>
        </div>

        {/* Export Enrollments */}
        <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3">
              📚
            </div>
            <h3 className="font-semibold text-base">Enrollments Report</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Export active and revoked course access records, enrollment dates, and enrollment source.
            </p>
          </div>
          <button
            onClick={() => handleExport("enrollments")}
            disabled={isPending}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {exportingType === "enrollments" ? "Exporting CSV..." : "Export Enrollments CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
