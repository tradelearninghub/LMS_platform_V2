"use client";

import { useActionState, useTransition, useState } from "react";
import {
  updateCourseAction,
  createModuleAction,
  createLessonAction,
  updateLessonAction,
  deleteModuleAction,
  deleteLessonAction,
  deleteCourseAction,
  createCategoryAction,
} from "../../../actions";
import { useRouter } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  videoUrl: string | null;
  contentType?: string;
  pdfFileKey?: string | null;
  durationSeconds: number;
  isPreview: boolean;
  description: string | null;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  priceCents: number;
  mrpCents?: number;
  sellingPriceCents?: number;
  manualEnrollmentCount?: number | null;
  currency: string;
  status: string;
  isFeatured: boolean;
  categoryId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  thumbnailUrl: string | null;
  modules: Module[];
};

type Category = { id: string; name: string };

export function CourseEditForm({
  course,
  categories,
}: {
  course: Course;
  categories: Category[];
}) {
  const [courseState, courseAction, isSaving] = useActionState(updateCourseAction, {} as any);
  const [moduleState, moduleAction, isAddingModule] = useActionState(createModuleAction, {} as any);
  const [lessonState, lessonAction, isAddingLesson] = useActionState(createLessonAction, {} as any);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Active lesson content type selection state for lesson creation
  const [selectedContentType, setSelectedContentType] = useState<Record<string, "URL" | "PDF">>({});
  const [uploadedPdfKeys, setUploadedPdfKeys] = useState<Record<string, string>>({});
  const [uploadingPdf, setUploadingPdf] = useState<Record<string, boolean>>({});

  // Lesson editing state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editContentType, setEditContentType] = useState<Record<string, "URL" | "PDF">>({});
  const [editPdfKeys, setEditPdfKeys] = useState<Record<string, string>>({});
  const [uploadingEditPdf, setUploadingEditPdf] = useState<Record<string, boolean>>({});
  const [showReplacePdf, setShowReplacePdf] = useState<Record<string, boolean>>({});

  const handlePdfUpload = async (moduleId: string, file: File) => {
    setUploadingPdf((prev) => ({ ...prev, [moduleId]: true }));
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (data.fileKey) {
        setUploadedPdfKeys((prev) => ({ ...prev, [moduleId]: data.fileKey }));
      } else {
        alert(data.error || "PDF upload failed");
      }
    } catch {
      alert("PDF upload failed");
    } finally {
      setUploadingPdf((prev) => ({ ...prev, [moduleId]: false }));
    }
  };

  const initialMrp = (course.mrpCents || course.priceCents || 0) / 100;
  const initialSellingPrice = (course.sellingPriceCents || course.priceCents || 0) / 100;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Course</h1>
        <button
          onClick={() => {
            if (confirm("Delete this course? This cannot be undone.")) {
              startTransition(async () => {
                await deleteCourseAction(course.id);
                router.push("/admin/courses");
              });
            }
          }}
          disabled={isPending}
          className="text-sm text-destructive hover:underline"
        >
          Delete course
        </button>
      </div>

      {/* Course details form */}
      <form action={courseAction} className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Course Details</h2>

        {courseState?.success && (
          <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
            Saved!
          </div>
        )}
        {courseState?.error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {courseState.error}
          </div>
        )}

        <input type="hidden" name="id" value={course.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Title *</span>
            <input name="title" defaultValue={course.title} required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select name="status" defaultValue={course.status} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <div className="block">
            <span className="text-sm font-medium">Category</span>
            <div className="flex gap-2 mt-1">
              <select name="categoryId" defaultValue={course.categoryId || ""} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">None</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <button type="button" onClick={async () => {
                const name = prompt("New category name:");
                if (name) {
                  const fd = new FormData();
                  fd.append("name", name);
                  startTransition(async () => {
                    const res = await createCategoryAction(null, fd);
                    if (res?.error) {
                      alert(res.error);
                    } else {
                      router.refresh();
                    }
                  });
                }
              }} className="rounded-md border bg-secondary px-3 py-2 text-sm" title="Create Category">+</button>
            </div>
          </div>

          {/* V3 Dual Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm font-medium">MRP (List Price ₹)</span>
              <input name="mrpCents" type="number" step="0.01" defaultValue={initialMrp} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Selling Price (₹)</span>
              <input name="sellingPriceCents" type="number" step="0.01" defaultValue={initialSellingPrice} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Manual Enrolled Students</span>
              <input name="manualEnrollmentCount" type="number" defaultValue={course.manualEnrollmentCount ?? ""} placeholder="e.g. 500" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="block">
            <span className="text-sm font-medium">Thumbnail URL</span>
            <div className="flex items-center gap-2 mt-1">
              <input name="thumbnailUrl" defaultValue={course.thumbnailUrl || ""} id="thumbnailUrlInput" className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <input type="file" accept="image/*" id="thumbnailUpload" className="hidden" onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                const fd = new FormData();
                fd.append("file", e.target.files[0]);
                try {
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (data.url) {
                    (document.getElementById("thumbnailUrlInput") as HTMLInputElement).value = data.url;
                  } else {
                    alert(data.error || "Upload failed");
                  }
                } catch {
                  alert("Upload failed");
                }
              }} />
              <button type="button" onClick={() => document.getElementById('thumbnailUpload')?.click()} className="rounded-md border bg-secondary px-3 py-2 text-sm hover:bg-secondary/80">Upload</button>
            </div>
          </div>
          <label className="flex items-center gap-2 self-end pb-2">
            <input name="isFeatured" type="checkbox" defaultChecked={course.isFeatured} className="rounded" />
            <span className="text-sm font-medium">Featured</span>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Short description</span>
          <input name="shortDescription" defaultValue={course.shortDescription || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Full description</span>
          <textarea name="description" rows={4} defaultValue={course.description || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">SEO Title</span>
            <input name="seoTitle" defaultValue={course.seoTitle || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">SEO Description</span>
            <input name="seoDescription" defaultValue={course.seoDescription || ""} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>

        <button type="submit" disabled={isSaving} className="rounded-md bg-primary px-6 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {/* Modules & Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Modules & Lessons</h2>
        </div>

        {course.modules.map((mod) => {
          const typeForMod = selectedContentType[mod.id] || "URL";
          const uploadedKey = uploadedPdfKeys[mod.id] || "";
          const isUploading = uploadingPdf[mod.id] || false;

          return (
            <div key={mod.id} className="rounded-xl border bg-card">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-medium">{mod.title}</h3>
                <button
                  onClick={() => {
                    if (confirm("Delete this module and all its lessons?")) {
                      startTransition(() => { deleteModuleAction(mod.id); });
                    }
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete module
                </button>
              </div>

              {mod.lessons.map((lesson) => {
                const isEditing = editingLessonId === lesson.id;
                const currentEditType = editContentType[lesson.id] || (lesson.contentType === "PDF" ? "PDF" : "URL");
                const currentEditPdfKey = editPdfKeys[lesson.id] ?? (lesson.pdfFileKey || "");

                return (
                  <div key={lesson.id} className="border-b last:border-b-0">
                    <div className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{lesson.title}</span>
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono font-medium uppercase">
                          {lesson.contentType || "URL"}
                        </span>
                        {lesson.isPreview && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase">
                            Preview
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(lesson.durationSeconds / 60)}m
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingLessonId(isEditing ? null : lesson.id)}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          {isEditing ? "Close" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this lesson?")) {
                              startTransition(() => { deleteLessonAction(lesson.id); });
                            }
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <form
                        action={async (formData) => {
                          startTransition(async () => {
                            await updateLessonAction(null, formData);
                            setEditingLessonId(null);
                            router.refresh();
                          });
                        }}
                        className="px-5 py-4 space-y-3 bg-muted/20 border-t"
                      >
                        <input type="hidden" name="id" value={lesson.id} />

                        <div className="flex items-center gap-4 text-xs font-medium border-b pb-2">
                          <span>Content Type:</span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="contentType"
                              value="URL"
                              checked={currentEditType === "URL"}
                              onChange={() => setEditContentType((prev) => ({ ...prev, [lesson.id]: "URL" }))}
                            />
                            <span>URL (Video Link)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="contentType"
                              value="PDF"
                              checked={currentEditType === "PDF"}
                              onChange={() => setEditContentType((prev) => ({ ...prev, [lesson.id]: "PDF" }))}
                            />
                            <span>Upload PDF Document</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="block">
                            <span className="text-xs font-medium text-muted-foreground">Lesson Title *</span>
                            <input
                              name="title"
                              defaultValue={lesson.title}
                              required
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                            />
                          </label>

                          {currentEditType === "URL" ? (
                            <label className="block">
                              <span className="text-xs font-medium text-muted-foreground">Video URL</span>
                              <input
                                name="videoUrl"
                                defaultValue={lesson.videoUrl || ""}
                                placeholder="https://drive.google.com/..."
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                              />
                            </label>
                          ) : (
                            <div className="block">
                              <span className="text-xs font-medium text-muted-foreground mb-1 block">PDF Document</span>
                              <input type="hidden" name="pdfFileKey" value={currentEditPdfKey} />

                              {currentEditPdfKey && !showReplacePdf[lesson.id] && !editPdfKeys[lesson.id] ? (
                                <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 text-xs">
                                  <span className="font-medium text-emerald-800 truncate">
                                    ✓ Attached: {currentEditPdfKey.split("/").pop()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowReplacePdf((prev) => ({ ...prev, [lesson.id]: true }))}
                                    className="shrink-0 font-semibold text-primary hover:underline text-[11px]"
                                  >
                                    Replace PDF
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={async (e) => {
                                      if (e.target.files?.[0]) {
                                        setUploadingEditPdf((prev) => ({ ...prev, [lesson.id]: true }));
                                        const fd = new FormData();
                                        fd.append("file", e.target.files[0]);
                                        try {
                                          const res = await fetch("/api/upload-pdf", { method: "POST", body: fd });
                                          const data = await res.json();
                                          if (data.fileKey) {
                                            setEditPdfKeys((prev) => ({ ...prev, [lesson.id]: data.fileKey }));
                                          } else {
                                            alert(data.error || "Upload failed");
                                          }
                                        } catch {
                                          alert("Upload failed");
                                        } finally {
                                          setUploadingEditPdf((prev) => ({ ...prev, [lesson.id]: false }));
                                        }
                                      }
                                    }}
                                    className="mt-1 w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground cursor-pointer"
                                  />
                                  {uploadingEditPdf[lesson.id] && <p className="text-[11px] text-muted-foreground mt-1">Uploading new PDF...</p>}
                                  {editPdfKeys[lesson.id] && (
                                    <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                                      ✓ New PDF selected: {editPdfKeys[lesson.id].split("/").pop()}
                                    </p>
                                  )}
                                  {currentEditPdfKey && showReplacePdf[lesson.id] && (
                                    <button
                                      type="button"
                                      onClick={() => setShowReplacePdf((prev) => ({ ...prev, [lesson.id]: false }))}
                                      className="text-[11px] text-muted-foreground hover:text-foreground underline mt-1 block"
                                    >
                                      Keep existing PDF
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <label className="block">
                            <span className="text-xs font-medium text-muted-foreground">Duration (seconds)</span>
                            <input
                              name="durationSeconds"
                              type="number"
                              defaultValue={lesson.durationSeconds}
                              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                            />
                          </label>

                          <label className="flex items-center gap-2 self-center pt-4">
                            <input name="isPreview" type="checkbox" defaultChecked={lesson.isPreview} className="rounded" />
                            <span className="text-sm font-medium">Preview lesson</span>
                          </label>
                        </div>

                        <label className="block">
                          <span className="text-xs font-medium text-muted-foreground">Description</span>
                          <textarea
                            name="description"
                            defaultValue={lesson.description || ""}
                            rows={2}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm resize-none"
                          />
                        </label>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingLessonId(null)}
                            className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={uploadingEditPdf[lesson.id]}
                            className="rounded-md bg-primary px-4 py-1 text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                          >
                            Update Lesson
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}

              {/* Add lesson form */}
              <details className="border-t">
                <summary className="px-5 py-3 text-sm text-primary cursor-pointer hover:bg-accent/50">
                  + Add lesson
                </summary>
                <form action={lessonAction} className="px-5 py-4 space-y-3 border-t">
                  <input type="hidden" name="moduleId" value={mod.id} />
                  {lessonState?.error && (
                    <p className="text-xs text-destructive">{lessonState.error}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-medium border-b pb-2">
                    <span>Content Type:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="contentType"
                        value="URL"
                        checked={typeForMod === "URL"}
                        onChange={() => setSelectedContentType((prev) => ({ ...prev, [mod.id]: "URL" }))}
                      />
                      <span>URL (Video Link)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="contentType"
                        value="PDF"
                        checked={typeForMod === "PDF"}
                        onChange={() => setSelectedContentType((prev) => ({ ...prev, [mod.id]: "PDF" }))}
                      />
                      <span>Upload PDF Document</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input name="title" placeholder="Lesson title *" required className="rounded-md border border-input bg-background px-3 py-2 text-sm" />

                    {typeForMod === "URL" ? (
                      <input name="videoUrl" placeholder="Video URL (Google Drive preview)" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    ) : (
                      <div>
                        <input type="hidden" name="pdfFileKey" value={uploadedKey} />
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={isUploading}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handlePdfUpload(mod.id, e.target.files[0]);
                          }}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground"
                        />
                        {isUploading && <p className="text-[11px] text-muted-foreground mt-1">Uploading PDF...</p>}
                        {uploadedKey && <p className="text-[11px] text-green-600 mt-1">✓ PDF uploaded successfully</p>}
                      </div>
                    )}

                    <input name="durationSeconds" type="number" placeholder="Duration (seconds)" defaultValue="0" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <label className="flex items-center gap-2">
                      <input name="isPreview" type="checkbox" className="rounded" />
                      <span className="text-sm">Preview lesson</span>
                    </label>
                  </div>
                  <textarea name="description" placeholder="Description" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                  <button type="submit" disabled={isAddingLesson || isUploading} className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    {isAddingLesson ? "Adding…" : "Add Lesson"}
                  </button>
                </form>
              </details>
            </div>
          );
        })}

        {/* Add module */}
        <form action={moduleAction} className="rounded-xl border bg-card p-5 flex items-end gap-3">
          <input type="hidden" name="courseId" value={course.id} />
          {moduleState?.error && (
            <p className="text-xs text-destructive">{moduleState.error}</p>
          )}
          <label className="flex-1">
            <span className="text-sm font-medium">New Module</span>
            <input name="title" placeholder="Module title" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <button type="submit" disabled={isAddingModule} className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {isAddingModule ? "Adding…" : "Add Module"}
          </button>
        </form>
      </div>
    </div>
  );
}
