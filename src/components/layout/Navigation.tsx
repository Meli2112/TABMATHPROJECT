import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Users, Trophy, Target, User, Gamepad2 } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/games', icon: Gamepad2, label: 'Games' },
  { to: '/challenges', icon: Target, label: 'Challenges' },
  { to: '/scoreboard', icon: Trophy, label: 'Scores' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-40">
      <div className="flex justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                isActive
                  ? 'text-pink-600 dark:text-pink-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-pink-500'
              }`
            }
          >
            <Icon className="h-5 w-5 mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}