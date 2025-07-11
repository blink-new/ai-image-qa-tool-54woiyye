import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'
import { UploadDropzone } from '@/components/image/UploadDropzone'
import { QuestionInput } from '@/components/image/QuestionInput'
import { ResultBlock } from '@/components/image/ResultBlock'
import { HistoryView } from '@/components/image/HistoryView'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { blink } from '@/lib/blink'

interface User {
  id: string
  email: string
}

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

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('qa')

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setAuthLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleImageUpload = (file: File) => {
    setSelectedImage(file)
    // Clear previous results when new image is uploaded
    setQuestion('')
    setAnswer('')
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setQuestion('')
    setAnswer('')
  }

  const saveResultToDatabase = async (questionText: string, answerText: string, imageFile: File) => {
    try {
      const resultId = `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.imageQaResults.create({
        id: resultId,
        userId: user!.id,
        question: questionText,
        answer: answerText,
        imageName: imageFile.name,
        imageSize: imageFile.size,
        imageType: imageFile.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      toast.success('Result saved to history')
    } catch (error) {
      console.error('Error saving result:', error)
      toast.error('Failed to save result')
    }
  }

  const handleQuestionSubmit = async (questionText: string) => {
    if (!selectedImage) {
      toast.error('Please upload an image first')
      return
    }

    setQuestion(questionText)
    setAnswer('')
    setIsLoading(true)
    setIsStreaming(true)

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const base64Data = dataUrl.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedImage)
      })

      // Create data URL for AI
      const imageDataUrl = `data:${selectedImage.type};base64,${base64}`

      let accumulatedAnswer = ''
      
      // Stream the AI response
      await blink.ai.streamText(
        {
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: questionText },
                { type: "image", image: imageDataUrl }
              ]
            }
          ],
          model: 'gpt-4o-mini'
        },
        (chunk) => {
          accumulatedAnswer += chunk
          setAnswer(accumulatedAnswer)
        }
      )

      // Save to database after streaming is complete
      if (accumulatedAnswer && selectedImage) {
        await saveResultToDatabase(questionText, accumulatedAnswer, selectedImage)
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      toast.error('Failed to analyze image. Please try again.')
      setAnswer('Sorry, I encountered an error while analyzing your image. Please try again.')
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  const handleClearResults = () => {
    setQuestion('')
    setAnswer('')
  }

  const handleSelectHistoryResult = (result: QAResult) => {
    setQuestion(result.question)
    setAnswer(result.answer)
    setActiveTab('qa')
    toast.success('Result loaded from history')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to use the AI Image QA Tool</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            AI Image Q&A Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any image and ask questions about it. Our AI will analyze the image and provide detailed answers about what it sees.
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="qa">Q&A Tool</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="qa" className="space-y-8">
            {/* Image Upload */}
            <div className="flex justify-center">
              <UploadDropzone
                onImageUpload={handleImageUpload}
                selectedImage={selectedImage}
                onClearImage={handleClearImage}
                isLoading={isLoading}
              />
            </div>

            {/* Question Input */}
            {selectedImage && (
              <div className="animate-slide-up">
                <QuestionInput
                  onSubmit={handleQuestionSubmit}
                  isLoading={isLoading}
                  disabled={!selectedImage}
                />
              </div>
            )}

            {/* Results */}
            {(question || answer) && (
              <ResultBlock
                question={question}
                answer={answer}
                isStreaming={isStreaming}
                onClear={handleClearResults}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <HistoryView onSelectResult={handleSelectHistoryResult} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Powered by AI • Upload an image and start asking questions
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App