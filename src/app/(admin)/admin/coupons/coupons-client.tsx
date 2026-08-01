"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponAction,
} from "@/app/(admin)/actions";

interface Coupon {
  id: string;
  code: string;
  type: "COUPON" | "REFERRAL";
  discount_kind: "FLAT" | "PERCENT";
  discount_value: number;
  active: boolean;
  course_id: string | null;
  course_title?: string | null;
  created_at: string;
}

interface CourseOption {
  id: string;
  title: string;
}

export function CouponsClient({
  initialCoupons,
  courses,
}: {
  initialCoupons: Coupon[];
  courses: CourseOption[];
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [createState, createAction, isCreating] = useActionState(createCouponAction, { error: "", success: false });
  const [updateState, updateAction, isUpdating] = useActionState(updateCouponAction, { error: "", success: false });
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleCouponAction(id, currentActive);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this discount code?")) {
      startTransition(async () => {
        await deleteCouponAction(id);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coupons & Referrals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create discount codes and referral links for your courses.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          + Add Code
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Discount</th>
              <th className="px-4 py-3 text-left font-medium">Scope</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialCoupons.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-semibold">{item.code}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${
                    item.type === "REFERRAL" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {item.discount_kind === "FLAT" ? `₹${item.discount_value}` : `${item.discount_value}%`}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {item.course_title || "All Courses (Site-wide)"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(item.id, !!item.active)}
                    disabled={isPending}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setEditingCoupon(item)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    className="text-xs text-destructive hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialCoupons.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No discount codes created yet.</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Code</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {createState.error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded">{createState.error}</div>
            )}

            <form action={createAction} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium">Code Name</span>
                <input
                  name="code"
                  type="text"
                  required
                  placeholder="e.g. WELCOME100 or REF-RAHUL"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm uppercase"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Type</span>
                  <select name="type" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                    <option value="COUPON">Coupon</option>
                    <option value="REFERRAL">Referral</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium">Discount Kind</span>
                  <select name="discountKind" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium">Discount Value</span>
                <input
                  name="discountValue"
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 500 for ₹500 or 15 for 15%"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium">Course Scope</span>
                <select name="courseId" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">All Courses (Site-wide)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm rounded-md border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium"
                >
                  {isCreating ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Code ({editingCoupon.code})</h2>
              <button onClick={() => setEditingCoupon(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {updateState.error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded">{updateState.error}</div>
            )}

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={editingCoupon.id} />

              <label className="block">
                <span className="text-xs font-medium">Code Name</span>
                <input
                  name="code"
                  type="text"
                  defaultValue={editingCoupon.code}
                  required
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm uppercase"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium">Type</span>
                  <select name="type" defaultValue={editingCoupon.type} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                    <option value="COUPON">Coupon</option>
                    <option value="REFERRAL">Referral</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium">Discount Kind</span>
                  <select name="discountKind" defaultValue={editingCoupon.discount_kind} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium">Discount Value</span>
                <input
                  name="discountValue"
                  type="number"
                  defaultValue={editingCoupon.discount_value}
                  required
                  min={1}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium">Course Scope</span>
                <select name="courseId" defaultValue={editingCoupon.course_id || ""} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">All Courses (Site-wide)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2">
                <input name="active" type="checkbox" defaultChecked={!!editingCoupon.active} className="rounded" />
                <span className="text-sm font-medium">Active</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 text-sm rounded-md border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium"
                >
                  {isUpdating ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
