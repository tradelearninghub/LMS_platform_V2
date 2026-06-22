"use client";

import { useTransition, useState } from "react";
import { updateCourseSortOrderAction } from "../../actions";

export function CourseSortInput({ courseId, initialSortOrder }: { courseId: string; initialSortOrder: number }) {
  const [isPending, startTransition] = useTransition();
  const [val, setVal] = useState(initialSortOrder);

  const handleBlur = () => {
    if (val !== initialSortOrder) {
      startTransition(() => {
        updateCourseSortOrderAction(courseId, val);
      });
    }
  };

  return (
    <input
      type="number"
      value={val}
      onChange={(e) => setVal(Number(e.target.value))}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      disabled={isPending}
      className="w-16 rounded border px-2 py-1 text-xs"
      title="Sort Order"
    />
  );
}
