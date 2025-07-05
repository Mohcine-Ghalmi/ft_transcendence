'use client'
import React, { useState } from 'react'
import { useAuthStore } from '@/(zustand)/useAuthStore'
import { PingPongGame } from '../game/PingPongGame'

// Add Player Modal Component
const AddPlayerModal = ({ isOpen, onClose, onAddPlayer }) => {
  const [login, setLogin] = useState('')
  const [username, setusername] = useState('')
  const [errors, setErrors] = useState<any>({})
  const [avatar, setAvatar] = useState(null)

  const handleSubmit = () => {
    const newErrors: any = {}

    if (!login.trim()) {
      newErrors.login = 'Userusername is required'
    }

    if (!username.trim()) {
      newErrors.username = 'username is required'
    }

    if (!avatar) {
      newErrors.avatar = 'Avatar is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Clear errors if validation passes
    setErrors({})

    onAddPlayer({
      login: login.trim(),
      username: username.trim(),
      avatar: avatar,
    })

    // Reset form
    setLogin('')
    setusername('')
    setAvatar(null)
  }

  const handleloginChange = (e) => {
    setLogin(e.target.value)
    if (errors.login) {
      setErrors((prev) => ({ ...prev, login: '' }))
    }
  }

  const handleusernameChange = (e) => {
    setusername(e.target.value)
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: '' }))
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setAvatar(e.target.result)
      reader.readAsDataURL(file)
    }
    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0  backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-[#121417] rounded-lg p-8 w-full max-w-md mx-4 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Player 2
        </h2>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={login}
              onChange={handleloginChange}
              className={`w-full px-4 py-3 bg-[#4a5568] text-white rounded-lg border-none outline-none focus:bg-[#5a6578] transition-colors ${
                errors.nickname ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.nickname && (
              <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={handleusernameChange}
              className={`w-full px-4 py-3 bg-[#4a5568] text-white rounded-lg border-none outline-none focus:bg-[#5a6578] transition-colors ${
                errors.username ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              errors.avatar ? 'border-red-500 bg-red-500/10' : 'border-gray-500'
            }`}
          >
            <div className="mb-4">
              <h3 className="text-white font-semibold mb-2">Upload Avatar</h3>
              <p className="text-gray-400 text-sm mb-4">
                Select an avatar for Player 2.
              </p>

              {avatar && (
                <div className="mb-4">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full mx-auto object-cover"
                  />
                </div>
              )}

              <label className="bg-gray-700 hover:bg-[#5a6578] text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                Choose Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            {errors.avatar && (
              <p className="text-red-400 text-sm mt-2">{errors.avatar}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Player Card Component
export const PlayerCard = ({ player, playerNumber, onAddPlayer = null }) => {
  if (!player) {
    return (
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
          Player {playerNumber}
        </h3>
        <div className="border-2 border-dashed border-gray-500 rounded-2xl p-10 md:p-20 mb-8">
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4 text-xl md:text-2xl">
              Add Player {playerNumber}
            </h4>
            <p className="text-gray-400 text-lg md:text-xl mb-6">
              Add a local player to start a 1v1 game.
            </p>
            <button
              onClick={onAddPlayer}
              className="bg-[#4a5568] hover:bg-[#5a6578] text-white px-8 py-4 md:px-12 md:py-5 rounded-xl text-lg md:text-2xl transition-colors"
            >
              Add Player
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">
        Player {playerNumber}
      </h3>
      <div className="mb-8">
        <div className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6">
          <img
            src={`/images/${player.avatar}`}
            alt={player.login}
            className="w-full h-full rounded-full object-cover border-4 border-[#4a5568]"
            onError={(e: any) => {
              e.target.src = '/avatar/Default.svg'
            }}
          />
        </div>
        <h4 className="text-white font-semibold text-2xl md:text-3xl">
          {player.username}
        </h4>
        <p className="text-gray-400 text-lg md:text-xl">@{player.login}</p>
      </div>
    </div>
  )
}

// Main Local 1v1 Component
export default function Local1v1() {
  const [player2, setPlayer2] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const { user } = useAuthStore()

  const handleAddPlayer = (playerData) => {
    setPlayer2(playerData)
    setIsModalOpen(false)
  }

  const handleStartGame = () => {
    if (!player2) {
      alert('Please add Player 2 before starting the game')
      return
    }
    setShowGame(true)
  }

  const handleExitGame = () => {
    setShowGame(false)
    setPlayer2(null)
  }

  // If both players are present and showGame is true, show PingPongGame
  if (showGame && player2) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <PingPongGame
          player1={user}
          player2={player2}
          onExit={handleExitGame}
        />
      </div>
    )
  }

  return (
    <div className="h-full text-white">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-12 md:mb-20">
            Local 1v1
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 mb-12 md:mb-20">
            {/* Player 1 - Current User */}
            <PlayerCard player={user} playerNumber={1} />

            {/* Player 2 - To be added */}
            <PlayerCard
              player={player2}
              playerNumber={2}
              onAddPlayer={() => setIsModalOpen(true)}
            />
          </div>

          {/* Start Game Button */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              disabled={!player2}
              className={`px-10 py-4 md:px-16 md:py-6 rounded-xl text-xl md:text-3xl font-semibold transition-all duration-300 ${
                player2
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlayer={handleAddPlayer}
      />
    </div>
  )
}
