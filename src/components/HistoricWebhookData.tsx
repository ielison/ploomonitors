"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter, X, TrendingUp, BarChart3 } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import type { HistoricWebhookData } from "../data/mockHistoricWebhookData"

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface HistoricWebhookDataProps {
  data: HistoricWebhookData[]
}

export default function WebhookData({ data }: HistoricWebhookDataProps) {
  const [selectedShard, setSelectedShard] = useState<number | null>(null)
  const [filteredData, setFilteredData] = useState<HistoricWebhookData[]>(data)
  const [viewMode, setViewMode] = useState<"table" | "chart">("chart")

  // Função para obter data/hora no horário de Brasília (GMT-3)
  const getBrasiliaDate = (offsetHours = 0) => {
    const now = new Date()
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    brasiliaTime.setHours(brasiliaTime.getHours() + offsetHours)
    return brasiliaTime.toISOString().slice(0, 16)
  }

  const getDefaultStartDate = () => getBrasiliaDate(-24) // 24 horas atrás
  const getDefaultEndDate = () => getBrasiliaDate(0) // hora atual

  const [startDate, setStartDate] = useState<string>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate())
  const [showFilters, setShowFilters] = useState(false)

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
    return `${day}/${month}, ${hours}:${minutes}`
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
  }

  // Filtrar dados baseado no intervalo de data
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredData(data)
      return
    }

    const start = new Date(startDate + ":00.000Z")
    const end = new Date(endDate + ":00.000Z")

    const filtered = data.filter((webhook) => {
      const webhookDate = new Date(webhook.DateTime)
      return webhookDate >= start && webhookDate <= end
    })

    setFilteredData(filtered)
  }, [startDate, endDate, data])

  const clearFilters = () => {
    setStartDate(getDefaultStartDate())
    setEndDate(getDefaultEndDate())
    setSelectedShard(null)
  }

  const setQuickFilter = (hours: number) => {
    const endTime = getBrasiliaDate(0)
    const startTime = getBrasiliaDate(-hours)
    setStartDate(startTime)
    setEndDate(endTime)
  }

  // Obter shards únicos dos dados filtrados
  const getUniqueShards = () => {
    const shards = Array.from(new Set(filteredData.map((item) => item.shard_id))).sort((a, b) => a - b)
    return shards
  }

  // Filtrar dados por shard selecionado
  const getShardFilteredData = () => {
    if (selectedShard === null) return filteredData
    return filteredData.filter((item) => item.shard_id === selectedShard)
  }

  // Preparar dados para o gráfico
  const prepareChartData = () => {
    const shardData = getShardFilteredData()
    const sortedData = shardData.sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime())

    return {
      labels: sortedData.map((item) => formatDateForDisplay(item.DateTime)),
      datasets: [
        {
          label: "Webhooks",
          data: sortedData.map((item) => item.webhooks_count),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
        },
        {
          label: "Events",
          data: sortedData.map((item) => item.events_count),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.1,
        },
        {
          label: "Changes Reports",
          data: sortedData.map((item) => item.changes_reports_count),
          borderColor: "rgb(245, 158, 11)",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.1,
        },
        {
          label: "Changelogs",
          data: sortedData.map((item) => item.changelogs_count),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.1,
        },
        {
          label: "Automations",
          data: sortedData.map((item) => item.automations_count),
          borderColor: "rgb(139, 92, 246)",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.1,
        },
      ],
    }
  }

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: selectedShard ? `Histórico de Filas - Shard ${selectedShard}` : "Histórico de Filas - Todos os Shards",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Data/Hora",
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Quantidade",
        },
        ticks: {
          callback: (value) => formatNumber(value as number),
        },
      },
    },
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Histórico de Filas</h2>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("chart")}
              className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                viewMode === "chart" ? "bg-white shadow-sm" : "hover:bg-gray-300"
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Gráfico
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center px-3 py-1 rounded-md transition-colors ${
                viewMode === "table" ? "bg-white shadow-sm" : "hover:bg-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Tabela
            </button>
          </div>
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 border"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtros Rápidos</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickFilter(1)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Última hora
                </button>
                <button
                  onClick={() => setQuickFilter(6)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Últimas 6h
                </button>
                <button
                  onClick={() => setQuickFilter(24)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => setQuickFilter(168)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Última semana
                </button>
                <button
                  onClick={() => setQuickFilter(720)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Últimos 30 dias
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Inicial
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Final
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2">
                <motion.button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Resetar
                </motion.button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                Total de registros: <strong>{filteredData.length}</strong>
              </span>
              <span>
                Shards encontrados: <strong>{getUniqueShards().length}</strong>
              </span>
              <span className="text-blue-600">
                Período: {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seleção de Shard */}
      <div className="flex flex-wrap gap-2 mb-6">
        <motion.button
          onClick={() => setSelectedShard(null)}
          className={`px-3 py-1 rounded ${
            selectedShard === null ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Todos os Shards
        </motion.button>
        {getUniqueShards().map((shardId) => (
          <motion.button
            key={shardId}
            className={`px-3 py-1 rounded ${
              selectedShard === shardId ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setSelectedShard(shardId)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shard {shardId}
          </motion.button>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Nenhum dado encontrado</p>
          <p className="text-sm">Tente ajustar o filtro de data ou usar os filtros rápidos</p>
        </div>
      )}

      {filteredData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {viewMode === "chart" ? (
            <div className="bg-white rounded-lg shadow p-6" style={{ height: "500px" }}>
              <Line data={prepareChartData()} options={chartOptions} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Shard ID
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Webhooks
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Changes Reports
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Changelogs
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Automations
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Date Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {getShardFilteredData()
                    .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime())
                    .map((item, index) => (
                      <motion.tr
                        key={`${item.shard_id}-${item.DateTime}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {item.shard_id}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatNumber(item.webhooks_count)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatNumber(item.events_count)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatNumber(item.changes_reports_count)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatNumber(item.changelogs_count)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatNumber(item.automations_count)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                          {new Date(new Date(item.DateTime).getTime() - 3 * 60 * 60 * 1000)
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
          )}
        </motion.div>
      )}
    </div>
  )
}
