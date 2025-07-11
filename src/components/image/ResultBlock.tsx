import { useState, useEffect } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ResultBlockProps {
  question: string
  answer: string
  isStreaming?: boolean
  onClear?: () => void
}

export function ResultBlock({ question, answer, isStreaming, onClear }: ResultBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  useEffect(() => {
    setCopied(false)
  }, [answer])

  if (!question && !answer) return null

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">Q</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Your Question</h3>
                <p className="text-gray-900 text-base">{question}</p>
              </div>
            </div>
          </div>

          {/* Answer */}
          <div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">AI Answer</h3>
                  <div className="flex items-center gap-2">
                    {isStreaming && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Generating...
                      </div>
                    )}
                    {answer && !isStreaming && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-8 px-2 rounded-lg"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {answer ? (
                    <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
                      {answer}
                      {isStreaming && <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1"></span>}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-base italic">
                      Analyzing your image and generating an answer...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {answer && !isStreaming && onClear && (
            <div className="flex justify-center pt-6 mt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={onClear}
                className="rounded-xl"
              >
                Ask Another Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}