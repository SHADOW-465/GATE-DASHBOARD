'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  BookOpen,
  PieChart,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Layout from '@/components/layout'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'

export default function ProgressTracker() {
  const { user } = useUser()

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

  // Fetch tests
  const tests = useQuery(api.tests.getTests, 
    user ? {} : "skip"
  )

  // Fetch performance trends
  const performanceTrends = useQuery(api.tests.getPerformanceTrends, 
    user ? {} : "skip"
  )

  const completedTasks = allTasks?.filter(task => task.status === 'completed').length || 0
  const totalTasks = allTasks?.length || 0
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Mock data for charts
  const subjectCoverageData = subjects?.map(subject => ({
    name: subject.name,
    value: subject.progress,
    color: subject.status === 'strong' ? '#10b981' : 
           subject.status === 'weak' ? '#ef4444' : '#6b7280'
  })) || []

  const weeklyStudyData = [
    { day: 'Mon', theory: 2, pyqs: 1, mock: 0, revision: 1 },
    { day: 'Tue', theory: 3, pyqs: 2, mock: 0, revision: 0 },
    { day: 'Wed', theory: 1, pyqs: 3, mock: 1, revision: 1 },
    { day: 'Thu', theory: 2, pyqs: 1, mock: 0, revision: 2 },
    { day: 'Fri', theory: 4, pyqs: 2, mock: 0, revision: 0 },
    { day: 'Sat', theory: 1, pyqs: 1, mock: 2, revision: 1 },
    { day: 'Sun', theory: 2, pyqs: 1, mock: 1, revision: 2 }
  ]

  const performanceData = performanceTrends?.scoreTrend || [
    { date: '2024-01-01', score: 65, accuracy: 70 },
    { date: '2024-01-08', score: 68, accuracy: 72 },
    { date: '2024-01-15', score: 72, accuracy: 75 },
    { date: '2024-01-22', score: 75, accuracy: 78 },
    { date: '2024-01-29', score: 78, accuracy: 80 }
  ]

  const studyStreak = 7 // Mock data
  const totalStudyDays = 25 // Mock data

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Progress Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your study progress and performance
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                  <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Target Score</p>
                  <p className="text-2xl font-bold">{userProfile?.targetScore || 800}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Hours</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Streak</p>
                  <p className="text-2xl font-bold">{studyStreak}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Streak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Study Streak
            </CardTitle>
            <CardDescription>
              Track your consistency in studying
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{studyStreak}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">15</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{totalStudyDays}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Study Days</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{totalStudyDays}/30 days</span>
              </div>
              <Progress value={(totalStudyDays / 30) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Syllabus Coverage
              </CardTitle>
              <CardDescription>
                Progress by subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={subjectCoverageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {subjectCoverageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Study Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Study Hours
              </CardTitle>
              <CardDescription>
                Breakdown by activity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStudyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="theory" stackId="a" fill="#3b82f6" name="Theory" />
                    <Bar dataKey="pyqs" stackId="a" fill="#10b981" name="PYQs" />
                    <Bar dataKey="mock" stackId="a" fill="#f59e0b" name="Mock Tests" />
                    <Bar dataKey="revision" stackId="a" fill="#8b5cf6" name="Revision" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subject Analytics
            </CardTitle>
            <CardDescription>
              Detailed analysis of each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects?.map((subject) => (
                <div key={subject._id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Weightage: {subject.weightage}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        subject.status === 'strong' ? 'success' :
                        subject.status === 'weak' ? 'destructive' : 'secondary'
                      }>
                        {subject.status}
                      </Badge>
                      <span className="text-sm font-medium">{subject.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium text-green-600">85%</div>
                        <div className="text-gray-500">Accuracy</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">Improving</div>
                        <div className="text-gray-500">Trend</div>
                      </div>
                      <div>
                        <div className="font-medium text-purple-600">3</div>
                        <div className="text-gray-500">Weak Topics</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Track your improvement over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score" />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Review */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Review</CardTitle>
            <CardDescription>
              Summary of this week&apos;s performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Study Hours vs Target</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="text-sm font-medium">28/35 hours</span>
                  </div>
                  <Progress value={(28/35) * 100} className="h-2" />
                  <div className="text-xs text-gray-500">80% of target achieved</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Subject Breakdown</h4>
                <div className="space-y-2">
                  {subjects?.slice(0, 3).map((subject) => (
                    <div key={subject._id} className="flex justify-between text-sm">
                      <span>{subject.name}</span>
                      <span>{Math.floor(Math.random() * 8) + 2}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
