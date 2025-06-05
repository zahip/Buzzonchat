import React from "react";

export default function ProductTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags?.map((tag, i) => (
        <span
          key={i}
          className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
