"use client";

import { useTransition } from "react";
import { markLessonCompleteAction, markLessonIncompleteAction } from "../../../actions";

export function LessonCompleteButton({
  lessonId,
  isCompleted,
}: {
  lessonId: string;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          if (isCompleted) {
            await markLessonIncompleteAction(lessonId);
          } else {
            await markLessonCompleteAction(lessonId);
          }
        });
      }}
      className={`flex-shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-all ${
        isCompleted
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-primary text-primary-foreground hover:opacity-90"
      } disabled:opacity-50`}
    >
      {isPending ? "…" : isCompleted ? "✓ Completed" : "Mark complete"}
    </button>
  );
}
