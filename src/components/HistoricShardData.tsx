"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter, ChevronDown, ChevronUp, Database, AlertTriangle, Clock } from "lucide-react"

export interface HistoricAccountData {
  AccountId: number
  IsNotFound: boolean
  QueueTime: number
  DateTime: string
  ShardId: number
}

interface HistoricShardDataProps {
  data: Record<string, HistoricAccountData[]>
}

export default function HistoricShardData({ data }: HistoricShardDataProps) {
  const [selectedShard, setSelectedShard] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<Record<string, HistoricAccountData[]>>(data)
  const [showFilters, setShowFilters] = useState(false)

  // Função para obter data/hora no horário de Brasília (GMT-3)
  const getBrasiliaDate = (offsetHours = 0) => {
    const now = new Date()
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    brasiliaTime.setHours(brasiliaTime.getHours() + offsetHours)
    return brasiliaTime.toISOString().slice(0, 16)
  }

  const getDefaultStartDate = () => getBrasiliaDate(-1) // 1 hora atrás
  const getDefaultEndDate = () => getBrasiliaDate(0) // hora atual

  const [startDate, setStartDate] = useState<string>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate())

  const getMinDate = () => {
    const now = new Date()
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    brasiliaTime.setMonth(brasiliaTime.getMonth() - 6)
    return brasiliaTime.toISOString().slice(0, 16)
  }

  const getMaxDate = () => getBrasiliaDate(0)

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${day}/${month}, ${hours}:${minutes}:${seconds}`
  }

  // Filtrar dados baseado no intervalo de data
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredData(data)
      return
    }

    const start = new Date(startDate + ":00.000Z")
    const end = new Date(endDate + ":00.000Z")

    const filtered: Record<string, HistoricAccountData[]> = {}

    Object.keys(data).forEach((shardId) => {
      const shardData = data[shardId].filter((account) => {
        const accountDate = new Date(account.DateTime)
        return accountDate >= start && accountDate <= end
      })

      if (shardData.length > 0) {
        filtered[shardId] = shardData
      }
    })

    setFilteredData(filtered)
  }, [startDate, endDate, data])

  const clearFilters = () => {
    const newStartDate = getDefaultStartDate()
    const newEndDate = getDefaultEndDate()
    setStartDate(newStartDate)
    setEndDate(newEndDate)
    setSelectedShard(null)
  }

  const setQuickFilter = (hours: number) => {
    const endTime = getBrasiliaDate(0)
    const startTime = getBrasiliaDate(-hours)
    setStartDate(startTime)
    setEndDate(endTime)
  }

  const getButtonColor = (rowCount: number) => {
    if (rowCount > 50) return "bg-red-600 dark:bg-red-500 text-white"
    if (rowCount > 10) return "bg-orange-500 dark:bg-orange-400 text-white"
    return "bg-indigo-600 dark:bg-indigo-500 text-white"
  }

  const getFilteredShardCount = () => {
    return Object.keys(filteredData).length
  }

  const getTotalRecords = () => {
    return Object.values(filteredData).reduce((total, shardData) => total + shardData.length, 0)
  }

  // Calcular estatísticas
  const getStats = () => {
    const allRecords = Object.values(filteredData).flat()
    const notFoundCount = allRecords.filter((record) => record.IsNotFound).length
    const avgQueueTime =
      allRecords.length > 0 ? allRecords.reduce((sum, record) => sum + record.QueueTime, 0) / allRecords.length : 0
    const maxQueueTime = allRecords.length > 0 ? Math.max(...allRecords.map((record) => record.QueueTime)) : 0

    return {
      totalRecords: allRecords.length,
      notFoundCount,
      notFoundPercentage: allRecords.length > 0 ? (notFoundCount / allRecords.length) * 100 : 0,
      avgQueueTime,
      maxQueueTime,
    }
  }

  const stats = getStats()

  // Componente de card de estatística
  const StatCard = ({
    title,
    value,
    subValue,
    icon,
    color,
  }: {
    title: string
    value: string
    subValue?: string
    icon: React.ReactNode
    color: string
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 transition-colors duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {subValue && <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</span>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Shard Data</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
            {selectedShard !== null && ` • Shard ${selectedShard}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 overflow-hidden transition-colors duration-300"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filtros Rápidos</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickFilter(1)}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Última hora
                </button>
                <button
                  onClick={() => setQuickFilter(6)}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Últimas 6h
                </button>
                <button
                  onClick={() => setQuickFilter(24)}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => setQuickFilter(168)}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Última semana
                </button>
                <button
                  onClick={() => setQuickFilter(720)}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Últimos 30 dias
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Inicial (Brasília)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
                {startDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDateForDisplay(startDate)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Final (Brasília)
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
                {endDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDateForDisplay(endDate)}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>
                Shards encontrados: <strong>{getFilteredShardCount()}</strong>
              </span>
              <span>
                Total de registros: <strong>{getTotalRecords()}</strong>
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                Período: {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)} (Brasília)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Registros"
          value={stats.totalRecords.toString()}
          icon={<Database className="w-5 h-5 text-white" />}
          color="bg-indigo-600 dark:bg-indigo-500"
        />
        <StatCard
          title="Not Found"
          value={stats.notFoundCount.toString()}
          subValue={`${stats.notFoundPercentage.toFixed(1)}% do total`}
          icon={<AlertTriangle className="w-5 h-5 text-white" />}
          color="bg-red-500 dark:bg-red-600"
        />
        <StatCard
          title="Tempo Médio (min)"
          value={stats.avgQueueTime.toFixed(2)}
          icon={<Clock className="w-5 h-5 text-white" />}
          color="bg-emerald-500 dark:bg-emerald-600"
        />
        <StatCard
          title="Tempo Máximo (min)"
          value={stats.maxQueueTime.toFixed(2)}
          icon={<Clock className="w-5 h-5 text-white" />}
          color="bg-orange-500 dark:bg-orange-600"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(filteredData).map((shardId) => (
          <motion.button
            key={shardId}
            className={`px-3 py-1 rounded-md transition-colors ${
              selectedShard === shardId
                ? getButtonColor(filteredData[shardId].length)
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            onClick={() => setSelectedShard((prevShard) => (prevShard === shardId ? null : shardId))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shard {shardId} ({filteredData[shardId].length})
          </motion.button>
        ))}
      </div>

      {Object.keys(filteredData).length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-300">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Nenhum dado encontrado</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tente ajustar o filtro de data ou usar os filtros rápidos
          </p>
        </div>
      )}

      <AnimatePresence>
        {selectedShard !== null && filteredData[selectedShard] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">
                Shard {selectedShard} - {filteredData[selectedShard].length} registros
              </h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                Período: {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Account ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Not Found
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Queue Time (minutes)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date Time (Brasília)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData[selectedShard]
                    .sort((a, b) => {
                      if (a.IsNotFound && !b.IsNotFound) return -1
                      if (!a.IsNotFound && b.IsNotFound) return 1
                      return b.QueueTime - a.QueueTime
                    })
                    .map((account, index) => (
                      <motion.tr
                        key={`${account.AccountId}-${account.DateTime}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {account.AccountId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={
                              account.IsNotFound
                                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                                : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                            }
                          >
                            {account.IsNotFound ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {account.QueueTime.toFixed(2)} minutes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(new Date(account.DateTime).getTime() - 3 * 60 * 60 * 1000)
                            .toLocaleString("pt-BR", {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                            .replace(",", " -")}
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
