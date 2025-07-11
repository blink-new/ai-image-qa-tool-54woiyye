import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface QuestionInputProps {
  onSubmit: (question: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function QuestionInput({ onSubmit, isLoading, disabled }: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isLoading && !disabled) {
      onSubmit(question.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your image... (e.g., 'What do you see in this image?', 'Describe the colors and objects', 'What is the mood of this photo?')"
          className="min-h-[120px] pr-16 resize-none rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base"
          disabled={isLoading || disabled}
        />
        
        <Button
          type="submit"
          size="sm"
          disabled={!question.trim() || isLoading || disabled}
          className="absolute bottom-4 right-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-sm text-gray-500">Quick questions:</span>
        {[
          "What's in this image?",
          "Describe the colors",
          "What's the mood?",
          "Count the objects"
        ].map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setQuestion(suggestion)}
            disabled={isLoading || disabled}
            className="text-xs h-7 rounded-full"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </form>
  )
}