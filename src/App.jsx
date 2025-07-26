import { useState, useEffect } from 'react'
import './App.css'

const COLORS = [
  { name: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
  { name: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
  { name: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'yellow', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  { name: 'purple', bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { name: 'cyan', bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600' },
  { name: 'white', bg: 'bg-white border-2 border-gray-400', hover: 'hover:bg-gray-100' },
  { name: 'pink', bg: 'bg-pink-500', hover: 'hover:bg-pink-600' }
]

const MAX_ATTEMPTS = 10
const CODE_LENGTH = 4

function App() {
  const [secretCode, setSecretCode] = useState([])
  const [currentGuess, setCurrentGuess] = useState([])
  const [guessHistory, setGuessHistory] = useState([])
  const [gameStatus, setGameStatus] = useState('playing') // 'playing', 'won', 'lost'
  const [showInstructions, setShowInstructions] = useState(true)

  // Generate random secret code (no duplicate colors)
  const generateSecretCode = () => {
    const availableColors = [...COLORS]
    const code = []
    for (let i = 0; i < CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * availableColors.length)
      code.push(availableColors[randomIndex].name)
      availableColors.splice(randomIndex, 1) // Remove used color to prevent duplicates
    }
    return code
  }

  // Initialize game
  useEffect(() => {
    setSecretCode(generateSecretCode())
  }, [])

  // Calculate feedback for a guess
  const calculateFeedback = (guess, secret) => {
    const feedback = new Array(CODE_LENGTH).fill('empty') // Initialize with empty slots
    const secretCopy = [...secret]
    const guessCopy = [...guess]

    // First pass: Check for exact matches (black pegs)
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        feedback[i] = 'black'
        secretCopy[i] = null
        guessCopy[i] = null
      }
    }

    // Second pass: Check for color matches in wrong positions (white pegs)
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] !== null) {
        const secretIndex = secretCopy.indexOf(guessCopy[i])
        if (secretIndex !== -1) {
          feedback[i] = 'white'
          secretCopy[secretIndex] = null
        }
      }
    }

    return feedback
  }

  // Add color to current guess (no duplicates allowed)
  const addColorToGuess = (color) => {
    if (currentGuess.length < CODE_LENGTH &&
        gameStatus === 'playing' &&
        !currentGuess.includes(color)) { // Prevent duplicate colors
      setCurrentGuess([...currentGuess, color])
    }
  }

  // Remove last color from guess
  const removeLastColor = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1))
    }
  }

  // Submit guess
  const submitGuess = () => {
    if (currentGuess.length === CODE_LENGTH && gameStatus === 'playing') {
      const feedback = calculateFeedback(currentGuess, secretCode)
      const newGuess = {
        colors: [...currentGuess],
        feedback: feedback
      }

      const newHistory = [...guessHistory, newGuess]
      setGuessHistory(newHistory)
      setCurrentGuess([])

      // Check win condition
      if (feedback.every(peg => peg === 'black')) {
        setGameStatus('won')
      } else if (newHistory.length >= MAX_ATTEMPTS) {
        setGameStatus('lost')
      }
    }
  }

  // Reset game
  const resetGame = () => {
    setSecretCode(generateSecretCode())
    setCurrentGuess([])
    setGuessHistory([])
    setGameStatus('playing')
  }

  // Get color object by name
  const getColor = (colorName) => COLORS.find(c => c.name === colorName)

  const ColorCircle = ({ colorName, size = 'w-12 h-12', onClick = null }) => {
    const color = getColor(colorName)
    const isUsedInCurrentGuess = currentGuess.includes(colorName)
    const isDisabled = isUsedInCurrentGuess && onClick

    return (
      <div
        className={`${color.bg} ${size} rounded-full transition-all duration-200 ${
          onClick && !isDisabled ? `${color.hover} transform hover:scale-110 cursor-pointer` : ''
        } ${colorName === 'white' ? 'shadow-md' : 'shadow-lg'} ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={isDisabled ? undefined : onClick}
        title={isDisabled ? `${colorName} (already used)` : colorName}
      />
    )
  }

  const FeedbackPegs = ({ feedback }) => {
    return (
      <div className="flex gap-1">
        {feedback.map((peg, index) => {
          if (peg === 'black') {
            return <div key={index} className="w-3 h-3 bg-black rounded-full" />
          } else if (peg === 'white') {
            return <div key={index} className="w-3 h-3 bg-white border border-gray-400 rounded-full" />
          } else {
            return <div key={index} className="w-3 h-3 bg-gray-200 rounded-full" />
          }
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">🎯 Code Buster</h1>
          <p className="text-lg text-gray-700">Can you crack the secret code?</p>
        </div>

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">How to Play</h2>
              <ul className="text-sm space-y-2 mb-4 text-gray-700">
                <li>🎯 Guess the secret 4-color code</li>
                <li>🖤 Black peg = right color, right spot</li>
                <li>⚪ White peg = right color, wrong spot</li>
                <li>🔄 You have 10 tries to win</li>
                <li>🌈 Choose from 8 colors</li>
                <li>⚠️ No duplicate colors allowed!</li>
              </ul>
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Playing! 🚀
              </button>
            </div>
          </div>
        )}

        {/* Game Status */}
        <div className="text-center mb-6">
          {gameStatus === 'playing' && (
            <p className="text-lg">
              Attempt {guessHistory.length + 1} of {MAX_ATTEMPTS}
              {guessHistory.length > 0 && " • Keep going! 💪"}
            </p>
          )}
          {gameStatus === 'won' && (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 border-4 border-yellow-400 rounded-lg p-6 shadow-2xl animate-pulse">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉🏆🎉</div>
                <p className="text-4xl font-bold text-white mb-2 drop-shadow-lg">CONGRATULATIONS!</p>
                <p className="text-2xl font-bold text-yellow-200 mb-4">You cracked the code! 🕵️‍♀️</p>
                <div className="bg-white rounded-lg p-4 mb-4 shadow-lg">
                  <p className="text-lg text-gray-800 font-semibold mb-2">The secret code was:</p>
                  <div className="flex justify-center gap-3">
                    {secretCode.map((color, i) => (
                      <div key={i} className="text-center">
                        <ColorCircle colorName={color} size="w-16 h-16" />
                        <p className="text-sm font-medium text-gray-700 mt-1 capitalize">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xl text-white font-medium">
                  Amazing detective work! 🔍✨
                </p>
                <p className="text-lg text-yellow-200 mt-2">
                  You solved it in {guessHistory.length} {guessHistory.length === 1 ? 'try' : 'tries'}!
                </p>
              </div>
            </div>
          )}
          {gameStatus === 'lost' && (
            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-800">Game Over! 🕵️</p>
              <p className="text-red-700">The secret code was:</p>
              <div className="flex justify-center gap-2 mt-2">
                {secretCode.map((color, i) => (
                  <ColorCircle key={i} colorName={color} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Color Palette - Move to top for mobile accessibility */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Colors</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {COLORS.map((color) => (
                <div key={color.name} className="text-center">
                  <ColorCircle
                    colorName={color.name}
                    onClick={() => addColorToGuess(color.name)}
                  />
                  <p className="text-sm mt-2 capitalize font-medium">{color.name}</p>
                </div>
              ))}
            </div>

            {/* Current Guess Display and Controls */}
            {gameStatus === 'playing' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Current Guess ({currentGuess.length}/4)</h3>
                {/* Current guess preview */}
                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({ length: CODE_LENGTH }, (_, j) => {
                    if (currentGuess[j]) {
                      return <ColorCircle key={j} colorName={currentGuess[j]} size="w-12 h-12" />
                    } else {
                      return <div key={j} className="w-12 h-12 bg-gray-300 rounded-full border-2 border-dashed border-gray-400" />
                    }
                  })}
                </div>
                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={removeLastColor}
                    disabled={currentGuess.length === 0}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    ↶ Undo
                  </button>
                  <button
                    onClick={submitGuess}
                    disabled={currentGuess.length !== CODE_LENGTH}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    ✓ Submit Guess
                  </button>
                </div>
              </div>
            )}

            {/* Game Controls */}
            <div className="space-y-3 mt-6">
              <button
                onClick={resetGame}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                🔄 New Game
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📖 How to Play
              </button>
            </div>
          </div>

          {/* Game Board - Move below for better mobile experience */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Guesses</h2>

            {/* Guess History */}
            <div className="space-y-3 mb-6">
              {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
                const guess = guessHistory[i]
                const isCurrentRow = i === guessHistory.length && gameStatus === 'playing'

                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                    guess ? 'bg-gray-50' : isCurrentRow ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-100'
                  }`}>
                    <div className="flex gap-2">
                      {Array.from({ length: CODE_LENGTH }, (_, j) => {
                        if (guess) {
                          return <ColorCircle key={j} colorName={guess.colors[j]} size="w-10 h-10" />
                        } else if (isCurrentRow && currentGuess[j]) {
                          return <ColorCircle key={j} colorName={currentGuess[j]} size="w-10 h-10" />
                        } else {
                          return <div key={j} className="w-10 h-10 bg-gray-300 rounded-full border-2 border-dashed border-gray-400" />
                        }
                      })}
                    </div>
                    <div className="ml-4">
                      {guess ? <FeedbackPegs feedback={guess.feedback} /> : <div className="w-16"></div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Fun encouragement messages */}
            {gameStatus === 'playing' && guessHistory.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  {guessHistory.length <= 3 ? "Great start! 🌟" :
                   guessHistory.length <= 6 ? "You're getting closer! 🔍" :
                   guessHistory.length <= 8 ? "Almost there! 💪" :
                   "Last chance! You can do it! 🚀"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
