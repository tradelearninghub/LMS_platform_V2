"use client";

import { useActionState, useState } from "react";
import { updateEmailTemplateAction } from "../../actions";
import { ArrowUp, ArrowDown, Trash2, Plus, Eye, Code, Layers } from "lucide-react";

type Template = {
  id: string;
  event: string;
  name: string;
  subject: string;
  blocksJson: string;
  isActive: boolean;
};

export function EmailTemplateList({ templates }: { templates: Template[] }) {
  return (
    <div className="space-y-6">
      {templates.map((t) => (
        <TemplateRow key={t.id} template={t} />
      ))}
      {templates.length === 0 && (
        <p className="text-sm text-muted-foreground">No templates found. Run the seed script.</p>
      )}
    </div>
  );
}

function TemplateRow({ template }: { template: Template }) {
  const [state, formAction, isPending] = useActionState(updateEmailTemplateAction, {} as any);
  
  const [blocks, setBlocks] = useState<any[]>(() => {
    try {
      return JSON.parse(template.blocksJson);
    } catch (e) {
      return [];
    }
  });

  const [tab, setTab] = useState<"visual" | "raw">("visual");
  const [rawText, setRawText] = useState(() => {
    try {
      return JSON.stringify(JSON.parse(template.blocksJson), null, 2);
    } catch {
      return template.blocksJson;
    }
  });

  const [newType, setNewType] = useState("text");
  const [subject, setSubject] = useState(template.subject);

  const updateBlocks = (newBlocks: any[]) => {
    setBlocks(newBlocks);
    setRawText(JSON.stringify(newBlocks, null, 2));
  };

  const handleRawChange = (val: string) => {
    setRawText(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setBlocks(parsed);
      }
    } catch (e) {
      // Allow user to keep typing if JSON is partially invalid
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;
    updateBlocks(newBlocks);
  };

  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;
    updateBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    updateBlocks(newBlocks);
  };

  const addBlock = () => {
    const block: any = { type: newType };
    if (newType === "header") {
      block.logo = true;
    } else if (newType === "button") {
      block.text = "Click Here";
      block.url = "";
    } else {
      block.text = "";
    }
    updateBlocks([...blocks, block]);
  };

  return (
    <details className="rounded-xl border bg-card overflow-hidden transition-all duration-200">
      <summary className="px-5 py-4 cursor-pointer hover:bg-accent/50 rounded-xl transition-colors select-none flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{template.name}</span>
          <span className="text-xs text-muted-foreground font-mono bg-accent/80 px-2 py-0.5 rounded-md">
            {template.event}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!template.isActive && (
            <span className="text-[10px] uppercase font-bold tracking-wider bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-0.5 rounded-full">
              Disabled
            </span>
          )}
          <svg
            className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>

      <div className="border-t p-6 bg-background">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="id" value={template.id} />
          <input type="hidden" name="blocksJson" value={JSON.stringify(blocks)} />

          {state?.success && (
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 p-3 text-sm flex items-center gap-2 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400">
              <span className="font-semibold">Success!</span> Template changes saved successfully.
            </div>
          )}
          {state?.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive p-3 text-sm">
              {state.error}
            </div>
          )}

          {/* Toggle status & subject */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Email Subject
                </span>
                <input
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </label>
            </div>
            <div className="flex items-center md:justify-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none mt-4 md:mt-0">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={template.isActive}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground block">Active status</span>
                  <span className="text-xs text-muted-foreground block -mt-0.5">
                    Toggle emails on this system event
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Block Editor Side-by-Side with Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t">
            
            {/* Left Column: Editor controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Content Layout Blocks</span>
                  <span className="text-xs font-mono text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                    {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
                  </span>
                </div>
                {/* Tab selector */}
                <div className="inline-flex rounded-lg border bg-muted p-0.5 text-muted-foreground text-xs">
                  <button
                    type="button"
                    onClick={() => setTab("visual")}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                      tab === "visual"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "hover:text-foreground"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visual Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("raw")}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                      tab === "raw"
                        ? "bg-background text-foreground shadow-sm font-semibold"
                        : "hover:text-foreground"
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Raw JSON
                  </button>
                </div>
              </div>

              {tab === "visual" ? (
                <div className="space-y-4">
                  {/* Blocks List */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {blocks.map((block, index) => {
                      const isHeader = block.type === "header";
                      const isButton = block.type === "button";
                      const isFooter = block.type === "footer";

                      let accentClass = "border-l-primary bg-indigo-50/10 dark:bg-indigo-950/5";
                      if (isHeader) accentClass = "border-l-violet-500 bg-violet-50/20 dark:bg-violet-950/10";
                      if (isButton) accentClass = "border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10";
                      if (isFooter) accentClass = "border-l-zinc-400 bg-zinc-50/20 dark:bg-zinc-950/5";

                      return (
                        <div
                          key={index}
                          className={`border border-l-4 rounded-xl p-3.5 space-y-2 relative transition-all ${accentClass}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-muted-foreground/80" />
                              {block.type} Block
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-accent"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveDown(index)}
                                disabled={index === blocks.length - 1}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-accent"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlock(index)}
                                className="p-1 text-destructive hover:bg-destructive/10 rounded ml-1"
                                title="Delete Block"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Block Inputs */}
                          {block.type === "header" && (
                            <label className="flex items-center gap-2 mt-1 select-none">
                              <input
                                type="checkbox"
                                checked={!!block.logo}
                                onChange={(e) => {
                                  const newBlocks = [...blocks];
                                  newBlocks[index] = { ...block, logo: e.target.checked };
                                  updateBlocks(newBlocks);
                                }}
                                className="rounded border-input text-primary focus:ring-primary"
                              />
                              <span className="text-xs text-foreground font-medium">Include Trade Learning Hub Logo</span>
                            </label>
                          )}

                          {block.type === "text" && (
                            <textarea
                              value={block.text || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[index] = { ...block, text: e.target.value };
                                updateBlocks(newBlocks);
                              }}
                              placeholder="Write your message body... Variables like {{siteName}}, {{courseTitle}}, {{reason}}, {{message}} are dynamically substituted."
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                              rows={4}
                            />
                          )}

                          {(block.type === "title" || block.type === "subtitle" || block.type === "footer") && (
                            <input
                              type="text"
                              value={block.text || ""}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[index] = { ...block, text: e.target.value };
                                updateBlocks(newBlocks);
                              }}
                              placeholder={`Enter block text content...`}
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          )}

                          {block.type === "button" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                              <div>
                                <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                  Button Title
                                </label>
                                <input
                                  type="text"
                                  value={block.text || ""}
                                  onChange={(e) => {
                                    const newBlocks = [...blocks];
                                    newBlocks[index] = { ...block, text: e.target.value };
                                    updateBlocks(newBlocks);
                                  }}
                                  placeholder="e.g. Access Course"
                                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                                  Destination Link
                                </label>
                                <input
                                  type="text"
                                  value={block.url || ""}
                                  onChange={(e) => {
                                    const newBlocks = [...blocks];
                                    newBlocks[index] = { ...block, url: e.target.value };
                                    updateBlocks(newBlocks);
                                  }}
                                  placeholder="e.g. {{appUrl}}/dashboard"
                                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Block Selector */}
                  <div className="flex gap-2 items-center border rounded-xl p-3 bg-muted/40">
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-ring flex-1"
                    >
                      <option value="text">Text Block</option>
                      <option value="title">Header Title</option>
                      <option value="subtitle">Subtitle</option>
                      <option value="button">Call-To-Action Button</option>
                      <option value="header">Site Logo Header</option>
                      <option value="footer">Sleek Footer</option>
                    </select>
                    <button
                      type="button"
                      onClick={addBlock}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Block
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={12}
                    value={rawText}
                    onChange={(e) => handleRawChange(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Enter blocks layout list as JSON array..."
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Format: Array of objects with keys `type` and optional `text`, `url`, `logo`. Updates visual cards on correct parses.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Live Mockup Preview */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Live E-Mail Preview
              </span>
              <div className="flex-1">
                <EmailLivePreview blocks={blocks} subject={subject} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-5 py-2.5 text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {isPending ? "Saving changes..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}

function EmailLivePreview({ blocks, subject }: { blocks: any[]; subject: string }) {
  return (
    <div className="border rounded-xl bg-slate-50 dark:bg-zinc-900/50 p-4 h-full flex flex-col min-h-[400px]">
      <div className="text-[11px] text-muted-foreground border-b pb-2 mb-4 space-y-1">
        <div>
          <span className="font-semibold text-foreground">Subject:</span> {subject || <span className="italic text-muted-foreground/60">(No Subject)</span>}
        </div>
        <div>
          <span className="font-semibold text-foreground">Sender:</span> Trade Learning Hub &lt;noreply@tradelearninghub.local&gt;
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-950 border rounded-xl shadow-sm p-6 flex-1 flex flex-col justify-between max-w-md mx-auto w-full font-sans text-sm text-zinc-800 dark:text-zinc-200">
        <div className="space-y-4">
          {blocks.map((block, index) => {
            if (block.type === "header") {
              return (
                <div key={index} className="border-b pb-3 text-center">
                  {block.logo ? (
                    <div className="inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 select-none text-base">
                      <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-black">TLH</span>
                      Trade Learning Hub
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                      System Broadcast
                    </div>
                  )}
                </div>
              );
            }

            if (block.type === "title") {
              return (
                <h2 key={index} className="text-lg font-bold text-zinc-900 dark:text-zinc-100 text-center tracking-tight mt-2">
                  {replacePlaceholders(block.text || "Title Placeholder Text")}
                </h2>
              );
            }

            if (block.type === "subtitle") {
              return (
                <p key={index} className="text-center text-xs text-muted-foreground -mt-1.5 font-medium">
                  {replacePlaceholders(block.text || "Subtitle Placeholder Text")}
                </p>
              );
            }

            if (block.type === "text") {
              return (
                <div key={index} className="whitespace-pre-wrap leading-relaxed text-xs text-zinc-600 dark:text-zinc-300">
                  {replacePlaceholders(block.text || "Provide message content blocks here.")}
                </div>
              );
            }

            if (block.type === "button") {
              return (
                <div key={index} className="py-2 text-center">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-block bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm hover:opacity-90 select-none"
                  >
                    {block.text || "Action Button"}
                  </a>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Footer rendering block */}
        {blocks.some((b) => b.type === "footer") ? (
          blocks.map((block, index) => {
            if (block.type === "footer") {
              return (
                <div key={index} className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-center text-muted-foreground font-medium">
                  {replacePlaceholders(block.text || "Trade Learning Hub")}
                </div>
              );
            }
            return null;
          })
        ) : (
          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-center text-muted-foreground">
            © {new Date().getFullYear()} Trade Learning Hub. All rights reserved.
          </div>
        )}
      </div>
    </div>
  );
}

function replacePlaceholders(text: string) {
  const parts = text.split(/(\{\{[a-zA-Z0-9_]+\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const varName = part.slice(2, -2);
      return (
        <span key={i} className="inline-block bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 px-1 py-0.2 rounded text-[11px] font-mono select-all">
          {varName}
        </span>
      );
    }
    return part;
  });
}

