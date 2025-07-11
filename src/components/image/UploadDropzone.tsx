import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadDropzoneProps {
  onImageUpload: (file: File) => void
  selectedImage?: File | null
  onClearImage?: () => void
  isLoading?: boolean
}

export function UploadDropzone({ 
  onImageUpload, 
  selectedImage, 
  onClearImage, 
  isLoading 
}: UploadDropzoneProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onImageUpload(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isLoading
  })

  const handleClear = () => {
    setImagePreview(null)
    onClearImage?.()
  }

  if (selectedImage && imagePreview) {
    return (
      <div className="relative">
        <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <img 
            src={imagePreview} 
            alt="Selected image" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-3 right-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-3">
          {selectedImage.name}
        </p>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative w-full max-w-md mx-auto p-8 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer",
        isDragActive 
          ? "border-blue-400 bg-blue-50" 
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
          {isDragActive ? (
            <Upload className="w-8 h-8 text-blue-600 animate-bounce" />
          ) : (
            <ImageIcon className="w-8 h-8 text-blue-600" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? "Drop your image here" : "Upload an image"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop or click to select an image file
          </p>
          <p className="text-xs text-gray-500">
            Supports JPEG, PNG, GIF, WebP • Max 10MB
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="mt-2"
          disabled={isLoading}
        >
          Browse Files
        </Button>
      </div>
    </div>
  )
}