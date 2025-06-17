"use client"

import { useState, useEffect } from "react"
import { LogOut, BarChart3, Link, Zap, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { Login } from "./components/Login"
import { setAuthToken, removeAuthToken } from "./utils/auth"
import CurrentQueueStatus from "./components/CurrentQueueStatus"
import HistoricWebhookData from "./components/HistoricWebhookData"
import HistoricWebhookDetails from "./components/HistoricWebhookDetails"
import HistoricAutomations from "./components/HistoricAutomations"
import { ThemeToggle } from "./components/ThemeToggle"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<"current" | "webhooks" | "historicWebhooks" | "historicAutomations">(
    "current",
  )

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("userKey"))
  }, [])

 
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sistema de Monitoramento</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Monitoramento de filas e automações em tempo real</p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            <motion.button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </motion.button>
          </div>
        </div>

        

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 transition-colors duration-300">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex items-center px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === "current"
                    ? "bg-indigo-600 dark:bg-indigo-700 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Activity className="w-4 h-4 mr-2" />
                Estado Atual
              </button>
              <button
                onClick={() => setActiveTab("webhooks")}
                className={`flex items-center px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === "webhooks"
                    ? "bg-indigo-600 dark:bg-indigo-700 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Histórico de Filas
              </button>
              <button
                onClick={() => setActiveTab("historicWebhooks")}
                className={`flex items-center px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === "historicWebhooks"
                    ? "bg-indigo-600 dark:bg-indigo-700 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Link className="w-4 h-4 mr-2" />
                Detalhes Webhooks
              </button>
              <button
                onClick={() => setActiveTab("historicAutomations")}
                className={`flex items-center px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                  activeTab === "historicAutomations"
                    ? "bg-indigo-600 dark:bg-indigo-700 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Detalhes Automações
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "current" && <CurrentQueueStatus />}
          {activeTab === "webhooks" && <HistoricWebhookData />}
          {activeTab === "historicWebhooks" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <HistoricWebhookDetails />
            </div>
          )}
          {activeTab === "historicAutomations" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
              <HistoricAutomations />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
