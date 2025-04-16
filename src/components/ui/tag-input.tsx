import React, { useState } from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
  disabled?: boolean
}

export function TagInput({ tags, onTagsChange, className, disabled }: TagInputProps) {
  const [newTag, setNewTag] = useState("")

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      if (!tags.includes(newTag.trim())) {
        onTagsChange([...tags, newTag.trim()])
      }
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-gray-500 hover:text-gray-700"
              disabled={disabled}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleAddTag}
        placeholder="Add tags (press Enter)"
        disabled={disabled}
      />
    </div>
  )
} 