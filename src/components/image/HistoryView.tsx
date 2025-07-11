import { useState, useEffect } from 'react'
import { Clock, MessageSquare, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { blink } from '@/lib/blink'
import { toast } from 'react-hot-toast'

interface QAResult {
  id: string
  user_id: string
  question: string
  answer: string
  image_name: string | null
  image_size: number | null
  image_type: string | null
  created_at: string
  updated_at: string
}

interface HistoryViewProps {
  onSelectResult?: (result: QAResult) => void
}

export function HistoryView({ onSelectResult }: HistoryViewProps) {
  const [results, setResults] = useState<QAResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredResults, setFilteredResults] = useState<QAResult[]>([])

  useEffect(() => {
    loadResults()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = results.filter(result => 
        result.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredResults(filtered)
    } else {
      setFilteredResults(results)
    }
  }, [searchQuery, results])

  const loadResults = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      const data = await blink.db.imageQaResults.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      
      setResults(data)
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const deleteResult = async (id: string) => {
    try {
      await blink.db.imageQaResults.delete(id)
      setResults(prev => prev.filter(r => r.id !== id))
      toast.success('Result deleted')
    } catch (error) {
      console.error('Error deleting result:', error)
      toast.error('Failed to delete result')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QA History</h2>
          <p className="text-gray-600">Your previous image questions and answers</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {results.length} results
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search questions and answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No matching results' : 'No QA history yet'}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Upload an image and ask questions to see your history here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card 
              key={result.id} 
              className="bg-white shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectResult?.(result)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-gray-900 mb-1">
                      {truncateText(result.question, 100)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(result.created_at)}</span>
                      {result.image_name && (
                        <span className="flex items-center gap-1">
                          📷 {result.image_name}
                        </span>
                      )}
                      {result.image_size && (
                        <span>{(result.image_size / 1024).toFixed(1)} KB</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteResult(result.id)
                    }}
                    className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {truncateText(result.answer, 200)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}