"use client"

import { useState, useEffect } from "react"
import { RefreshCw, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { Login } from "./components/Login"
import { setAuthToken, removeAuthToken } from "./utils/auth"
import HistoricWebhookData from "./components/HistoricWebhookData"
import { mockHistoricWebhookData } from "./data/mockHistoricWebhookData"

export default function App() {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("userKey"))
  }, [])

  const updateData = async () => {
    try {
      setLoading(true)
      // Por enquanto não fazemos nada aqui, pois estamos usando dados mock
      // Quando o backend estiver pronto, aqui será feita a chamada para buscar dados históricos
      setError(null)
    } catch (err: unknown) {
      setError("Failed to fetch data")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (Email: string, Password: string) => {
    try {
      const response = await fetch("https://internal-api.ploomes.com/Self/Login?$select=UserKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email, Password }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setAuthToken(data.UserKey)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const handleLogout = () => {
    removeAuthToken()
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Monitor por Shard - Histórico</h1>
          <div className="flex space-x-4">
            <motion.button
              onClick={updateData}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {loading && <p className="text-center py-16 font-semibold text-2xl">Carregando...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <HistoricWebhookData data={mockHistoricWebhookData} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
