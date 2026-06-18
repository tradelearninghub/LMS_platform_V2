"use client";

import { useActionState } from "react";
import { createCourseAction } from "../../actions";

type Category = { id: string; name: string };

export function AdminCourseActions({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createCourseAction, {} as any);

  return (
    <form action={formAction} className="p-5 border-t space-y-4">
      {state?.error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          Course created!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium">Title *</span>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <select
            name="categoryId"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Price (in paise/cents)</span>
          <input
            name="priceCents"
            type="number"
            defaultValue="0"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 self-end pb-2">
          <input name="isFeatured" type="checkbox" className="rounded" />
          <span className="text-sm font-medium">Featured</span>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Short description</span>
        <input
          name="shortDescription"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Full description</span>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-6 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Create Course"}
      </button>
    </form>
  );
}
