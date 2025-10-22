'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useState } from 'react'
import { 
  Brain, 
  BookOpen, 
  Search, 
  Plus, 
  Star,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  XCircle
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

export default function RevisionHub() {
  const { user } = useUser()
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Fetch user data
  const userProfile = useQuery(api.users.getUserProfile, 
    user?.id ? { clerkId: user.id } : "skip"
  )

  // Fetch subjects
  const subjects = useQuery(api.subjects.getSubjects, 
    user ? {} : "skip"
  )

  // Fetch flashcard decks
  const flashcardDecks = useQuery(api.revision.getFlashcardDecks, 
    user ? {} : "skip"
  )

  // Fetch flashcards for selected deck
  const flashcards = useQuery(api.revision.getFlashcards, 
    selectedDeck ? { deckId: selectedDeck as Id<"flashcardDecks"> } : "skip"
  )

  // Fetch weak topics
  const weakTopics = useQuery(api.revision.getWeakTopics, 
    user ? {} : "skip"
  )

  // Fetch revision recommendations
  const recommendations = useQuery(api.revision.getRevisionRecommendations, 
    user ? {} : "skip"
  )

  // Mutations
  const createFlashcardDeck = useMutation(api.revision.createFlashcardDeck)
  const createFlashcard = useMutation(api.revision.createFlashcard)
  const updateFlashcard = useMutation(api.revision.updateFlashcard)

  const handleCreateDeck = async (formData: FormData) => {
    if (!userProfile || !subjects || subjects.length === 0) return

    const name = formData.get('name') as string
    const subjectId = formData.get('subjectId') as string

    try {
      await createFlashcardDeck({
        name,
        subjectId: subjectId as Id<"subjects">
      })
      
      toast({
        title: "Deck created successfully",
        description: "Your new flashcard deck has been created.",
      })
      
      setIsCreatingDeck(false)
    } catch (error) {
      toast({
        title: "Error creating deck",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleCreateCard = async (formData: FormData) => {
    if (!selectedDeck) return

    const front = formData.get('front') as string
    const back = formData.get('back') as string

    try {
      await createFlashcard({
        deckId: selectedDeck as Id<"flashcardDecks">,
        front,
        back,
        masteryLevel: 'new'
      })
      
      toast({
        title: "Card created successfully",
        description: "Your new flashcard has been added.",
      })
      
      setIsCreatingCard(false)
    } catch (error) {
      toast({
        title: "Error creating card",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRateCard = async (cardId: string, masteryLevel: 'new' | 'learning' | 'mastered') => {
    try {
      await updateFlashcard({
        flashcardId: cardId as Id<"flashcards">,
        masteryLevel
      })
      
      // Move to next card
      if (flashcards && currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1)
        setShowAnswer(false)
      }
      
      toast({
        title: "Card rated",
        description: `Card marked as ${masteryLevel}.`,
      })
    } catch (error) {
      toast({
        title: "Error rating card",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const currentCard = flashcards?.[currentCardIndex]
  const filteredDecks = flashcardDecks?.filter(deck => 
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Revision Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Master concepts with flashcards and focused revision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formula Sheet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Formula Sheet
              </CardTitle>
              <CardDescription>
                Quick reference for important formulas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search formulas..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border">
                    <div className="font-medium">Ohm&apos;s Law</div>
                    <div className="text-sm text-gray-600">V = I × R</div>
                    <div className="text-xs text-gray-500">Network Theory</div>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="font-medium">Power Formula</div>
                    <div className="text-sm text-gray-600">P = V × I</div>
                    <div className="text-xs text-gray-500">Network Theory</div>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="font-medium">Fourier Transform</div>
                    <div className="text-sm text-gray-600">F(ω) = ∫ f(t)e^(-jωt) dt</div>
                    <div className="text-xs text-gray-500">Signals & Systems</div>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Formula
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard System */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Flashcard System
              </CardTitle>
              <CardDescription>
                Learn with spaced repetition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Deck Selection */}
                <div className="flex items-center gap-2">
                  <Select value={selectedDeck || ''} onValueChange={setSelectedDeck}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a deck" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDecks.map((deck) => (
                        <SelectItem key={deck._id} value={deck._id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isCreatingDeck} onOpenChange={setIsCreatingDeck}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form action={handleCreateDeck}>
                        <DialogHeader>
                          <DialogTitle>Create New Deck</DialogTitle>
                          <DialogDescription>
                            Create a new flashcard deck for a subject
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="name">Deck Name</Label>
                            <Input id="name" name="name" placeholder="e.g., Digital Electronics Basics" required />
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
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsCreatingDeck(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create Deck</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Flashcard Display */}
                {selectedDeck && flashcards && flashcards.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Card {currentCardIndex + 1} of {flashcards.length}
                    </div>
                    
                    <div className="min-h-[200px] flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-medium mb-4">
                          {showAnswer ? currentCard?.back : currentCard?.front}
                        </div>
                        {!showAnswer && (
                          <Button onClick={() => setShowAnswer(true)}>
                            Show Answer
                          </Button>
                        )}
                      </div>
                    </div>

                    {showAnswer && (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleRateCard(currentCard?._id || '', 'new')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Again
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleRateCard(currentCard?._id || '', 'learning')}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Hard
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => handleRateCard(currentCard?._id || '', 'mastered')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Easy
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentCardIndex > 0) {
                            setCurrentCardIndex(currentCardIndex - 1)
                            setShowAnswer(false)
                          }
                        }}
                        disabled={currentCardIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (currentCardIndex < flashcards.length - 1) {
                            setCurrentCardIndex(currentCardIndex + 1)
                            setShowAnswer(false)
                          }
                        }}
                        disabled={currentCardIndex === flashcards.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : selectedDeck ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No flashcards in this deck yet</p>
                    <Dialog open={isCreatingCard} onOpenChange={setIsCreatingCard}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form action={handleCreateCard}>
                          <DialogHeader>
                            <DialogTitle>Create New Card</DialogTitle>
                            <DialogDescription>
                              Add a new flashcard to this deck
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="front">Front (Question)</Label>
                              <Input id="front" name="front" placeholder="What is Ohm's Law?" required />
                            </div>
                            <div>
                              <Label htmlFor="back">Back (Answer)</Label>
                              <Input id="back" name="back" placeholder="V = I × R" required />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreatingCard(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Card</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Select a deck to start studying</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Weak Topics
            </CardTitle>
            <CardDescription>
              Focus on areas that need improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weakTopics?.map((topic, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{topic.topic}</h3>
                    <Badge variant={
                      topic.accuracy > 60 ? 'success' :
                      topic.accuracy > 40 ? 'warning' : 'destructive'
                    }>
                      {topic.accuracy}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{topic.subject}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Accuracy</span>
                      <span>{topic.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-red-500 h-1 rounded-full" 
                        style={{ width: `${topic.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    <Target className="h-3 w-3 mr-2" />
                    Study Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revision Planner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Revision Planner
            </CardTitle>
            <CardDescription>
              Scheduled revision sessions based on spaced repetition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations?.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{rec.topic}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Priority: {rec.priority} • Study Time: {rec.studyTime}
                      </p>
                    </div>
                    <Badge variant={
                      rec.priority === 'high' ? 'destructive' :
                      rec.priority === 'medium' ? 'warning' : 'secondary'
                    }>
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Resources:</strong>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rec.resources.map((resource, resIndex) => (
                        <Badge key={resIndex} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Deadline: {rec.deadline}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Clock className="h-3 w-3 mr-2" />
                      Schedule
                    </Button>
                    <Button size="sm">
                      <Star className="h-3 w-3 mr-2" />
                      Start Now
                    </Button>
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

