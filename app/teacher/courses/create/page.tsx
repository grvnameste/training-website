'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Upload, Plus, X } from 'lucide-react'

export default function CreateCoursePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
    content: '',
    videos: [] as { id: string; name: string; file: string }[],
  })
  const [videoName, setVideoName] = useState('')

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, thumbnail: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && videoName.trim()) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({
          ...formData,
          videos: [
            ...formData.videos,
            {
              id: Date.now().toString(),
              name: videoName,
              file: event.target?.result as string,
            },
          ],
        })
        setVideoName('')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.price || formData.videos.length === 0) {
      alert('Please fill in all fields and add at least one video')
      return
    }

    const newCourse = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      thumbnail: formData.thumbnail || '/online-learning-platform.png',
      content: formData.content,
      videos: formData.videos,
      enrollments: 0,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    courses.push(newCourse)
    localStorage.setItem('lms_courses', JSON.stringify(courses))

    router.push('/teacher/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/teacher/dashboard">
        <Button variant="outline" className="text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Course Title</CardTitle>
            <CardDescription>Enter an engaging title for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="e.g., Complete Web Development Bootcamp"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-input text-foreground"
              required
            />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Description</CardTitle>
            <CardDescription>Describe what students will learn</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Enter detailed course description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-border rounded-lg bg-input text-foreground min-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Course Price</CardTitle>
            <CardDescription>Set the price for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">$</span>
              <Input
                type="number"
                placeholder="99.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-input text-foreground"
                step="0.01"
                min="0"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Course Thumbnail</CardTitle>
            <CardDescription>Upload a cover image for your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.thumbnail && (
              <img
                src={formData.thumbnail || "/placeholder.svg"}
                alt="Thumbnail preview"
                className="w-full max-w-sm h-48 object-cover rounded-lg border border-border"
              />
            )}
            <label className="flex flex-col gap-2 cursor-pointer">
              <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center hover:bg-primary/5 transition">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <span className="text-sm font-medium text-foreground">Click to upload thumbnail</span>
                <span className="text-xs text-foreground/60">PNG, JPG, GIF up to 5MB</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Course Content</CardTitle>
            <CardDescription>Add text content or syllabus for your course</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Enter course content, modules, or syllabus..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-3 border border-border rounded-lg bg-input text-foreground min-h-32 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Course Videos</CardTitle>
            <CardDescription>Upload video lectures for your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Upload Form */}
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Video title (e.g., 'Introduction to React')"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                className="bg-input text-foreground"
              />
              <label className="flex flex-col gap-2 cursor-pointer">
                <div className="border-2 border-dashed border-primary rounded-lg p-6 text-center hover:bg-primary/5 transition">
                  <Upload className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-sm font-medium text-foreground">Upload video file</span>
                  <span className="text-xs text-foreground/60">MP4, WebM up to 1GB</span>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoAdd}
                  className="hidden"
                />
              </label>
            </div>

            {/* Video List */}
            {formData.videos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Uploaded Videos</h3>
                <div className="space-y-2">
                  {formData.videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                    >
                      <span className="text-foreground">{video.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            videos: formData.videos.filter((v) => v.id !== video.id),
                          })
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-lg h-11 px-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </Button>
          <Link href="/teacher/dashboard">
            <Button variant="outline" className="text-lg h-11 px-8">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
