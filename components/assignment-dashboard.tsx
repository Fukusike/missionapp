"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, ImageIcon, Calendar, BookOpen, X, Eye, Download } from "lucide-react"
import Image from "next/image"

interface AssignmentData {
  title: string
  dueDate: string
  description: string
  subject: string
  priority: "low" | "medium" | "high"
  points: number
}

export default function AssignmentDashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback((file: File) => {
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      setUploadedFile(file)

      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null) // PDF preview would require additional handling
      }

      // Clear previous assignment data
      setAssignmentData(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = e.dataTransfer.files
      if (files && files[0]) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const detectAssignment = async () => {
    if (!uploadedFile) return

    setIsDetecting(true)

    // Simulate API call for assignment detection
    setTimeout(() => {
      // Mock extracted data
      const mockData: AssignmentData = {
        title: "Advanced React Patterns and State Management",
        dueDate: "2024-01-15",
        description:
          "Complete the React assignment focusing on advanced patterns including custom hooks, context API, and state management. Implement a todo application with drag-and-drop functionality and real-time updates.",
        subject: "Computer Science",
        priority: "high",
        points: 100,
      }

      setAssignmentData(mockData)
      setIsDetecting(false)
    }, 2000)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setFilePreview(null)
    setAssignmentData(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Assignment Dashboard</h1>
          <p className="text-gray-600">Upload your assignment screenshots or PDFs to extract key information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Upload className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your files here, or{" "}
                      <Label
                        htmlFor="file-upload"
                        className="text-blue-600 hover:text-blue-500 cursor-pointer underline"
                      >
                        browse
                      </Label>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Supports PNG, JPG, JPEG, PDF up to 10MB</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* File Preview */}
              {uploadedFile && (
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded">
                          {uploadedFile.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {filePreview && (
                      <div className="mt-4">
                        <Image
                          src={filePreview || "/placeholder.svg"}
                          alt="File preview"
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover rounded border"
                        />
                      </div>
                    )}

                    {uploadedFile.type === "application/pdf" && (
                      <div className="mt-4 p-4 bg-gray-50 rounded border text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">PDF Preview</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Eye className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Detect Button */}
              <Button onClick={detectAssignment} disabled={!uploadedFile || isDetecting} className="w-full" size="lg">
                {isDetecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Detecting Assignment...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Detect Assignment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Assignment Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentData ? (
                <div className="space-y-6">
                  {/* Assignment Title */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Assignment Title</Label>
                    <h3 className="text-xl font-semibold text-gray-900 mt-1">{assignmentData.title}</h3>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{formatDate(assignmentData.dueDate)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Subject</Label>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{assignmentData.subject}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority and Points */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Priority</Label>
                      <Badge className={getPriorityColor(assignmentData.priority)}>
                        {assignmentData.priority.charAt(0).toUpperCase() + assignmentData.priority.slice(1)}
                      </Badge>
                    </div>

                    <div className="text-right space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Points</Label>
                      <div className="text-2xl font-bold text-blue-600">{assignmentData.points}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-gray-700 leading-relaxed">{assignmentData.description}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignment Detected</h3>
                  <p className="text-gray-500">
                    Upload an assignment file and click "Detect Assignment" to extract information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
