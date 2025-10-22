'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import { 
  BookOpen, 
  Play, 
  BarChart3, 
  Target, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Layout from '@/components/layout'
import { toast } from '@/components/ui/use-toast'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function TestsAndPractice() {
  const { user } = useUser()
  const [selectedTestType, setSelectedTestType] = useState('all')

  // Fetch user data
  const userProfile = useQuery(api.users.getUserProfile, 
    user?.id ? { clerkId: user.id } : "skip"
  )

  // Fetch tests
  const tests = useQuery(api.tests.getTests, 
    user ? {} : "skip"
  )

  // Fetch performance trends
  const performanceTrends = useQuery(api.tests.getPerformanceTrends, 
    user ? {} : "skip"
  )

  // Fetch weak topics
  const weakTopics = useQuery(api.revision.getWeakTopics, 
    user ? {} : "skip"
  )

  // Mutations
  const createTest = useMutation(api.tests.createTest)
  const logTestResult = useMutation(api.tests.logTestResult)

  // Filter tests based on type
  const filteredTests = tests?.filter(test => 
    selectedTestType === 'all' || test.type === selectedTestType
  ) || []

  const attemptedTests = tests?.filter(test => test.status === 'attempted') || []
  const averageScore = attemptedTests.length > 0 
    ? attemptedTests.reduce((sum, test) => sum + (test.score || 0), 0) / attemptedTests.length 
    : 0

  const averageAccuracy = attemptedTests.length > 0 
    ? attemptedTests.reduce((sum, test) => sum + (test.accuracy || 0), 0) / attemptedTests.length 
    : 0

  const handleStartTest = async (testType: string) => {
    if (!userProfile) return

    try {
      const testId = await createTest({
        name: `${testType} Test - ${new Date().toLocaleDateString()}`,
        type: testType as any,
        status: 'not_attempted'
      })

      toast({
        title: "Test created",
        description: "You can now start the test.",
      })
    } catch (error) {
      toast({
        title: "Error creating test",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleLogResult = async (testId: string, score: number, accuracy: number) => {
    try {
      await logTestResult({
        testId: testId as any,
        score,
        accuracy,
        status: 'attempted'
      })

      toast({
        title: "Test result logged",
        description: "Your performance has been recorded.",
      })
    } catch (error) {
      toast({
        title: "Error logging result",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  // Mock performance data
  const performanceData = performanceTrends?.scoreTrend || [
    { date: 'Week 1', score: 65, accuracy: 70 },
    { date: 'Week 2', score: 68, accuracy: 72 },
    { date: 'Week 3', score: 72, accuracy: 75 },
    { date: 'Week 4', score: 75, accuracy: 78 },
    { date: 'Week 5', score: 78, accuracy: 80 }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tests & Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practice with mock tests and previous year questions
          </p>
        </div>

        {/* Test Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tests Taken</p>
                  <p className="text-2xl font-bold">{attemptedTests.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                  <p className="text-2xl font-bold">{Math.round(averageScore)}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accuracy</p>
                  <p className="text-2xl font-bold">{Math.round(averageAccuracy)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weak Areas</p>
                  <p className="text-2xl font-bold">{weakTopics?.length || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mock Test Simulator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Mock Test Simulator
              </CardTitle>
              <CardDescription>
                Take practice tests in a simulated environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="justify-start h-auto p-4"
                    onClick={() => handleStartTest('Full Length')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-medium">Full Length Mock Test</div>
                        <div className="text-sm opacity-80">3 hours • 100 questions</div>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </Button>
                  
                  <Button 
                    className="justify-start h-auto p-4"
                    variant="outline"
                    onClick={() => handleStartTest('Subject Test')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-medium">Subject-wise Tests</div>
                        <div className="text-sm opacity-80">1-2 hours • 25-50 questions</div>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </Button>
                  
                  <Button 
                    className="justify-start h-auto p-4"
                    variant="outline"
                    onClick={() => handleStartTest('PYQ')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-medium">Previous Year Questions</div>
                        <div className="text-sm opacity-80">30-60 minutes • 10-20 questions</div>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PYQ Practice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                PYQ Practice
              </CardTitle>
              <CardDescription>
                Practice with previous year questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <div className="font-medium">2023</div>
                      <div className="text-sm opacity-80">100 questions</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <div className="font-medium">2022</div>
                      <div className="text-sm opacity-80">100 questions</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <div className="font-medium">2021</div>
                      <div className="text-sm opacity-80">100 questions</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <div className="font-medium">2020</div>
                      <div className="text-sm opacity-80">100 questions</div>
                    </div>
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>450/1000 questions</span>
                    <span>85% accuracy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Performance
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
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Analysis
            </CardTitle>
            <CardDescription>
              Identify and work on your weak areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weakTopics?.map((topic, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{topic.topic}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{topic.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        topic.accuracy > 60 ? 'success' :
                        topic.accuracy > 40 ? 'warning' : 'destructive'
                      }>
                        {topic.accuracy}% accuracy
                      </Badge>
                      <Badge variant={
                        topic.trend === 'improving' ? 'success' :
                        topic.trend === 'stable' ? 'secondary' : 'destructive'
                      }>
                        {topic.trend}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-blue-600">{topic.attempts}</div>
                      <div className="text-gray-500">Attempts</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{topic.accuracy}%</div>
                      <div className="text-gray-500">Accuracy</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-600">
                        {new Date(topic.lastStudied).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">Last Studied</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      {topic.recommendedActions.map((action, actionIndex) => (
                        <Badge key={actionIndex} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Study Topic
                    </Button>
                    <Button size="sm" variant="outline">
                      Practice More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
            <CardDescription>
              Your latest test attempts and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTests.slice(0, 5).map((test) => (
                <div key={test._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {test.status === 'attempted' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {test.type} • {new Date(test._creationTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.status === 'attempted' && (
                      <>
                        <Badge variant="success">{test.score} marks</Badge>
                        <Badge variant="secondary">{test.accuracy}% accuracy</Badge>
                      </>
                    )}
                    <Badge variant={
                      test.status === 'attempted' ? 'success' : 'secondary'
                    }>
                      {test.status}
                    </Badge>
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

