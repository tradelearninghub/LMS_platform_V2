"use client";

import { useTransition } from "react";
import { approveOrderAction, rejectOrderAction } from "../../actions";

export function OrderActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => { approveOrderAction(orderId); })}
        className="rounded bg-green-600 px-3 py-1 text-xs text-white font-medium hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          const reason = prompt("Rejection reason (optional):");
          startTransition(() => { rejectOrderAction(orderId, reason || undefined); });
        }}
        className="rounded bg-red-600 px-3 py-1 text-xs text-white font-medium hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
