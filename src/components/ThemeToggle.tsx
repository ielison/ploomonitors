"use client"

import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      <div className="w-6 h-6 relative">
        {/* Ícone do Sol */}
        <motion.div
          initial={{ opacity: theme === "light" ? 1 : 0, rotate: theme === "light" ? 0 : 45 }}
          animate={{ opacity: theme === "light" ? 1 : 0, rotate: theme === "light" ? 0 : 45 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun className="w-5 h-5 text-amber-500" />
        </motion.div>

        {/* Ícone da Lua */}
        <motion.div
          initial={{ opacity: theme === "dark" ? 1 : 0, rotate: theme === "dark" ? 0 : -45 }}
          animate={{ opacity: theme === "dark" ? 1 : 0, rotate: theme === "dark" ? 0 : -45 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon className="w-5 h-5 text-indigo-300" />
        </motion.div>
      </div>
    </motion.button>
  )
}
