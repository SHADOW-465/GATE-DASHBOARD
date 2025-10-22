'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useState } from 'react'
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Target,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Layout from '@/components/layout'
import { toast } from '@/components/ui/use-toast'

export default function StudyPlanner() {
  const { user } = useUser()
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterType, setFilterType] = useState('all')

  // Fetch user data
  const userProfile = useQuery(api.users.getUserProfile, 
    user?.id ? { clerkId: user.id } : "skip"
  )

  // Fetch subjects
  const subjects = useQuery(api.subjects.getSubjects, 
    user ? {} : "skip"
  )

  // Fetch all tasks
  const allTasks = useQuery(api.tasks.getTasks, 
    user ? {} : "skip"
  )

  // Fetch tasks for selected date
  const selectedDateTasks = useQuery(api.tasks.getTasksByDate, 
    user ? { date: selectedDate } : "skip"
  )

  // Mutations
  const createTask = useMutation(api.tasks.createTask)
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus)
  const deleteTask = useMutation(api.tasks.deleteTask)

  // Filter tasks based on type
  const filteredTasks = allTasks?.filter(task => 
    filterType === 'all' || task.type === filterType
  ) || []

  const handleCreateTask = async (formData: FormData) => {
    if (!userProfile || !subjects || subjects.length === 0) return

    const title = formData.get('title') as string
    const subjectId = formData.get('subjectId') as string
    const type = formData.get('type') as string
    const priority = formData.get('priority') as string
    const dueDate = formData.get('dueDate') as string

    try {
      await createTask({
        title,
        subjectId: subjectId as Id<"subjects">,
        type: type as "Theory" | "PYQs" | "Mock Test" | "Revision",
        status: 'pending',
        priority: priority as "high" | "medium" | "low",
        dueDate: dueDate || undefined
      })
      
      toast({
        title: "Task created successfully",
        description: "Your new study task has been added.",
      })
      
      setIsCreatingTask(false)
    } catch (error) {
      toast({
        title: "Error creating task",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: 'pending' | 'completed' | 'revise-again') => {
    try {
      await updateTaskStatus({ taskId: taskId as Id<"tasks">, status })
      toast({
        title: "Task updated",
        description: `Task marked as ${status}.`,
      })
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ taskId: taskId as Id<"tasks"> })
      toast({
        title: "Task deleted",
        description: "Task has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Study Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Plan and manage your study schedule
            </p>
          </div>
          <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form action={handleCreateTask}>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new study task to your schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input id="title" name="title" placeholder="e.g., Study Digital Electronics Chapter 1" required />
                  </div>
                  <div>
                    <Label htmlFor="subjectId">Subject</Label>
                    <Select name="subjectId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Theory">Theory</SelectItem>
                          <SelectItem value="PYQs">PYQs</SelectItem>
                          <SelectItem value="Mock Test">Mock Test</SelectItem>
                          <SelectItem value="Revision">Revision</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select name="priority" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreatingTask(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Calendar
              </CardTitle>
              <CardDescription>
                Select a date to view scheduled tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  {selectedDateTasks && selectedDateTasks.length > 0 ? (
                    selectedDateTasks.map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-gray-500">
                              {subjects?.find(s => s._id === task.subjectId)?.name} • {task.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'warning' : 'secondary'
                          }>
                            {task.priority}
                          </Badge>
                          <Badge variant={
                            task.status === 'completed' ? 'success' :
                            task.status === 'revise-again' ? 'destructive' : 'secondary'
                          }>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks scheduled for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Task Manager
              </CardTitle>
              <CardDescription>
                Manage your study tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filter">Filter by Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Theory">Theory</SelectItem>
                      <SelectItem value="PYQs">PYQs</SelectItem>
                      <SelectItem value="Mock Test">Mock Test</SelectItem>
                      <SelectItem value="Revision">Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTasks.map((task) => (
                    <div key={task._id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="text-xs text-gray-500">
                            {subjects?.find(s => s._id === task.subjectId)?.name} • {task.type}
                          </div>
                          {task.dueDate && (
                            <div className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <Badge variant={
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'warning' : 'secondary'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={task.status === 'completed' ? 'default' : 'outline'}
                          onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant={task.status === 'revise-again' ? 'destructive' : 'outline'}
                          onClick={() => handleUpdateTaskStatus(task._id, 'revise-again')}
                        >
                          Revise
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
            <CardDescription>
              Set and track your weekly study goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subjects?.slice(0, 3).map((subject) => (
                <div key={subject._id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant={
                      subject.status === 'strong' ? 'success' :
                      subject.status === 'weak' ? 'destructive' : 'secondary'
                    }>
                      {subject.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {subject.weightage}% weightage
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
