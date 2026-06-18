"use client";

import { useActionState } from "react";
import { updateHomepageSectionAction } from "../../actions";

type Section = { id: string; key: string; title: string | null; subtitle: string | null; enabled: boolean; data: string };

export function HomepageSectionList({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-4">
      {sections.map((s) => (<SectionRow key={s.id} section={s} />))}
    </div>
  );
}

function SectionRow({ section }: { section: Section }) {
  const [state, formAction, isPending] = useActionState(updateHomepageSectionAction, {} as any);

  return (
    <details className="rounded-xl border bg-card">
      <summary className="px-5 py-4 cursor-pointer hover:bg-accent/50 rounded-xl transition-colors flex items-center justify-between">
        <div>
          <span className="font-medium">{section.title || section.key}</span>
          <span className="ml-2 text-xs text-muted-foreground">({section.key})</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${section.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {section.enabled ? "Enabled" : "Disabled"}
        </span>
      </summary>
      <form action={formAction} className="p-5 border-t space-y-4">
        <input type="hidden" name="id" value={section.id} />
        {state?.success && <p className="text-sm text-green-800">Saved!</p>}

        <label className="flex items-center gap-2">
          <input name="enabled" type="checkbox" defaultChecked={section.enabled} className="rounded" />
          <span className="text-sm font-medium">Enabled</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input name="title" defaultValue={section.title || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitle</span>
            <input name="subtitle" defaultValue={section.subtitle || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Data (JSON)</span>
          <textarea name="data" rows={5} defaultValue={section.data} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-xs resize-none" />
        </label>

        <button type="submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </details>
  );
}
