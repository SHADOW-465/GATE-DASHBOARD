'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { 
  Target, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Flame,
  Plus,
  Brain,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Layout from '@/components/layout'
import { toast } from '@/components/ui/use-toast'

export default function Dashboard() {
  const { user } = useUser()
  const [isCreatingTask, setIsCreatingTask] = useState(false)

  // Fetch user data
  const userProfile = useQuery(api.users.getUserProfile, 
    user?.id ? { clerkId: user.id } : "skip"
  )

  // Fetch subjects
  const subjects = useQuery(api.subjects.getSubjects, 
    user ? {} : "skip"
  )

  // Fetch today's tasks
  const today = new Date().toISOString().split('T')[0]
  const todaysTasks = useQuery(api.tasks.getTasksByDate, 
    user ? { date: today } : "skip"
  )

  // Fetch all tasks for progress calculation
  const allTasks = useQuery(api.tasks.getTasks, 
    user ? {} : "skip"
  )

  // Mutations
  const createUser = useMutation(api.users.createUser)
  const createSubject = useMutation(api.subjects.createSubject)
  const createTask = useMutation(api.tasks.createTask)

  // Initialize user if not exists
  if (user && !userProfile) {
    createUser({
      clerkId: user.id,
      name: user.fullName || '',
      email: user.primaryEmailAddress?.emailAddress || '',
      avatarUrl: user.imageUrl,
      targetScore: 800
    })
  }

  // Initialize default subjects if none exist
  if (userProfile && subjects && subjects.length === 0) {
    const defaultSubjects = [
      { name: 'Digital Electronics', weightage: 15, progress: 0, status: 'pending' as const },
      { name: 'Control Systems', weightage: 12, progress: 0, status: 'pending' as const },
      { name: 'Signals and Systems', weightage: 10, progress: 0, status: 'pending' as const },
      { name: 'Communication Systems', weightage: 8, progress: 0, status: 'pending' as const },
      { name: 'Electromagnetic Theory', weightage: 6, progress: 0, status: 'pending' as const },
      { name: 'Network Theory', weightage: 5, progress: 0, status: 'pending' as const },
      { name: 'Analog Electronics', weightage: 4, progress: 0, status: 'pending' as const }
    ]

    defaultSubjects.forEach(subject => {
      createSubject({
        name: subject.name,
        progress: subject.progress,
        status: subject.status,
        weightage: subject.weightage
      })
    })
  }

  const completedTasks = allTasks?.filter(task => task.status === 'completed').length || 0
  const totalTasks = allTasks?.length || 0
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const studyStreak = 7 // Mock data - can be calculated from actual study sessions
  const daysRemaining = Math.ceil((new Date('2026-02-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const motivationalQuotes = [
    "Success is the sum of small efforts repeated day in and day out.",
    "The expert in anything was once a beginner.",
    "Don't watch the clock; do what it does. Keep going.",
    "Believe you can and you're halfway there.",
    "The future belongs to those who believe in the beauty of their dreams."
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to ace GATE 2026? Let&apos;s make today count.
          </p>
        </div>

        {/* Motivation Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Study Motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{studyStreak}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                <Badge variant="warning" className="mt-1">On Fire!</Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{userProfile?.targetScore || 800}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Target Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{daysRemaining}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days Left</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                  &ldquo;{randomQuote}&rdquo;
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Study Overview
              </CardTitle>
              <CardDescription>
                Track your progress across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                
                <div className="space-y-3">
                  {subjects?.map((subject) => (
                    <div key={subject._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <Badge 
                          variant={
                            subject.status === 'strong' ? 'success' :
                            subject.status === 'weak' ? 'destructive' :
                            subject.status === 'completed' ? 'default' : 'secondary'
                          }
                        >
                          {subject.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{subject.weightage}%</span>
                        <div className="w-20">
                          <Progress value={subject.progress} className="h-1" />
                        </div>
                        <span className="text-xs text-gray-500">{subject.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysTasks && todaysTasks.length > 0 ? (
                  todaysTasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-gray-500">{task.type}</div>
                      </div>
                      <Badge 
                        variant={
                          task.status === 'completed' ? 'success' :
                          task.status === 'revise-again' ? 'destructive' : 'secondary'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{Math.round(overallProgress)}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{userProfile?.targetScore || 800}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Target Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">42</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Study Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{studyStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Study Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Start Pomodoro Timer
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setIsCreatingTask(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Practice Weak Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
