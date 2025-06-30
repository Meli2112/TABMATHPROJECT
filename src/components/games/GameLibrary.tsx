import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Trophy,
  Heart,
  Target,
  MessageSquare,
  Zap,
  Play
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GameInterface from './GameInterface'

interface Game {
  id: string
  title: string
  description: string
  category: string
  difficultyLevel: number
  estimatedDuration: number
  pointsReward: number
  isPremium: boolean
}

export default function GameLibrary() {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'All Games', icon: Trophy },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'trust', name: 'Trust Building', icon: Heart },
    { id: 'intimacy', name: 'Intimacy', icon: Users },
    { id: 'conflict-resolution', name: 'Conflict Resolution', icon: Target },
    { id: 'fun', name: 'Fun & Playful', icon: Star },
    { id: 'emotional-intelligence', name: 'Emotional Intelligence', icon: Zap }
  ]

  const mockGames: Game[] = [
    {
      id: '1',
      title: 'Truth or Trust',
      description: 'A revealing game where partners choose between sharing deep truths or completing trust-building challenges.',
      category: 'trust',
      difficultyLevel: 3,
      estimatedDuration: 20,
      pointsReward: 100,
      isPremium: false
    },
    {
      id: '2',
      title: 'Love Language Detective',
      description: 'Discover and explore each other\'s love languages through interactive scenarios.',
      category: 'communication',
      difficultyLevel: 1,
      estimatedDuration: 25,
      pointsReward: 75,
      isPremium: false
    },
    {
      id: '3',
      title: 'Emotional Charades',
      description: 'Act out complex emotions and relationship scenarios without words.',
      category: 'emotional-intelligence',
      difficultyLevel: 2,
      estimatedDuration: 15,
      pointsReward: 80,
      isPremium: false
    },
    {
      id: '4',
      title: 'Secrets & Strengths',
      description: 'Share personal stories and celebrate each other\'s strengths in a safe environment.',
      category: 'trust',
      difficultyLevel: 4,
      estimatedDuration: 40,
      pointsReward: 200,
      isPremium: true
    },
    {
      id: '5',
      title: 'The Great Perspective Swap',
      description: 'Practice seeing conflicts from your partner\'s point of view through role-playing.',
      category: 'conflict-resolution',
      difficultyLevel: 4,
      estimatedDuration: 45,
      pointsReward: 250,
      isPremium: true
    },
    {
      id: '6',
      title: 'Relationship Time Machine',
      description: 'Travel through your relationship timeline and create new memories together.',
      category: 'fun',
      difficultyLevel: 1,
      estimatedDuration: 35,
      pointsReward: 130,
      isPremium: false
    }
  ]

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    filterGames()
  }, [games, searchTerm, selectedCategory, selectedDifficulty])

  const loadGames = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGames(mockGames)
    } catch (error) {
      console.error('Error loading games:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterGames = () => {
    let filtered = games

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory)
    }

    // Filter by difficulty
    if (selectedDifficulty > 0) {
      filtered = filtered.filter(game => game.difficultyLevel === selectedDifficulty)
    }

    setFilteredGames(filtered)
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-500'
      case 2: return 'text-yellow-500'
      case 3: return 'text-orange-500'
      case 4: return 'text-red-500'
      case 5: return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner'
      case 2: return 'Easy'
      case 3: return 'Medium'
      case 4: return 'Hard'
      case 5: return 'Expert'
      default: return 'Unknown'
    }
  }

  if (selectedGame) {
    return (
      <GameInterface
        game={selectedGame}
        onComplete={() => setSelectedGame(null)}
        onExit={() => setSelectedGame(null)}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-4">
          Dr. Marcie's Game Library
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose from expertly designed therapy games to strengthen your relationship
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value={0}>All Difficulties</option>
            <option value={1}>Beginner</option>
            <option value={2}>Easy</option>
            <option value={3}>Medium</option>
            <option value={4}>Hard</option>
            <option value={5}>Expert</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty(0)
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Games Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card hover className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                      {game.title}
                    </h3>
                    {game.isPremium && (
                      <Badge variant="primary" size="sm">
                        Premium
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">
                    {game.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {game.estimatedDuration} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {game.pointsReward} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" size="sm">
                        {game.category.replace('-', ' ')}
                      </Badge>
                      <div className={`text-sm font-medium ${getDifficultyColor(game.difficultyLevel)}`}>
                        {getDifficultyLabel(game.difficultyLevel)}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedGame(game)}
                    className="w-full"
                    variant={game.isPremium ? 'primary' : 'secondary'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {filteredGames.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No games found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search criteria or browse all games
          </p>
          <Button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty(0)
            }}
          >
            Show All Games
          </Button>
        </div>
      )}
    </div>
  )
}