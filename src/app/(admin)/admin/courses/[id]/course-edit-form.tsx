"use client";

import { useActionState, useTransition } from "react";
import {
  updateCourseAction,
  createModuleAction,
  createLessonAction,
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
          <label className="block">
            <span className="text-sm font-medium">Price (INR / Rupees)</span>
            <input name="priceCents" type="number" step="0.01" defaultValue={course.priceCents / 100} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
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

        {course.modules.map((mod) => (
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

            {mod.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between px-5 py-3 border-b last:border-b-0 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span>{lesson.title}</span>
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
            ))}

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="title" placeholder="Lesson title *" required className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="videoUrl" placeholder="Video URL (Google Drive)" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input name="durationSeconds" type="number" placeholder="Duration (seconds)" defaultValue="0" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <label className="flex items-center gap-2">
                    <input name="isPreview" type="checkbox" className="rounded" />
                    <span className="text-sm">Preview lesson</span>
                  </label>
                </div>
                <textarea name="description" placeholder="Description" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                <button type="submit" disabled={isAddingLesson} className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {isAddingLesson ? "Adding…" : "Add Lesson"}
                </button>
              </form>
            </details>
          </div>
        ))}

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
