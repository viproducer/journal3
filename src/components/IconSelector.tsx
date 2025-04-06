import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

const EMOJI_CATEGORIES = [
  {
    name: "Common",
    emojis: ["📝", "📊", "📈", "📅", "⭐", "💡", "🎯", "✨", "🔥", "💪", "🌟", "📌", "🎨", "💭", "💫", "⚡"]
  },
  {
    name: "Activities",
    emojis: ["🏃", "🚶", "🧘", "🏋️", "🚴", "🎨", "📚", "🎵", "🎮", "🎯", "⚽", "🎪", "🎭", "🎪", "🎲", "🎳"]
  },
  {
    name: "Health",
    emojis: ["💊", "🏥", "🍎", "🥗", "💪", "🧘", "🏃", "💧", "🫀", "🧠", "👁️", "🦷", "🩺", "🌿", "🧪", "⚕️"]
  },
  {
    name: "Nature",
    emojis: ["🌱", "🌿", "🌺", "🌸", "🌼", "🌻", "🌹", "🍀", "🌳", "🌲", "🌴", "🌵", "🍄", "🌎", "☀️", "🌙"]
  },
  {
    name: "Objects",
    emojis: ["📱", "💻", "⌚", "📷", "🔋", "💡", "🔍", "📚", "✏️", "📝", "📌", "📎", "🔒", "🔑", "💼", "🎁"]
  },
  {
    name: "Food",
    emojis: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🥝", "🍅", "🥑", "🥦", "🥕", "🌽", "🥩"]
  }
]

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Common")

  const filteredEmojis = search
    ? EMOJI_CATEGORIES.flatMap(cat => cat.emojis).filter(emoji => 
        emoji.includes(search) || getEmojiName(emoji).includes(search.toLowerCase())
      )
    : EMOJI_CATEGORIES.find(cat => cat.name === selectedCategory)?.emojis || []

  function getEmojiName(emoji: string): string {
    // This is a simple implementation. You might want to use a proper emoji database
    return emoji
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-16 h-16 text-3xl"
        >
          {value}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
          <DialogDescription>
            Select an emoji to represent your template. You can search or browse by category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            placeholder="Search emojis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!search && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {EMOJI_CATEGORIES.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-8 gap-2">
              {filteredEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-8 h-8 p-0 text-lg"
                  onClick={() => {
                    onChange(emoji)
                    setIsOpen(false)
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 