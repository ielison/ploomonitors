"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter, ChevronDown, ChevronUp, List } from "lucide-react"
import { fetchHistoricWebhooksDetails } from "../utils/api"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export interface HistoricWebhookDetailItem {
  AccountId: number
  WebhookId: number
  Quantity: number
  ShardId: number
  DateTime: string
}

// Cores para o tema (consistente com HistoricWebhookData)
const COLORS = {
  primary: "#4f46e5", // indigo-600
  secondary: "#0ea5e9", // sky-500
  accent1: "#f97316", // orange-500
  accent2: "#10b981", // emerald-500
  accent3: "#8b5cf6", // violet-500
  accent4: "#ef4444", // red-500
  background: "#f9fafb", // gray-50
  card: "#ffffff", // white
  text: "#1f2937", // gray-800
  textLight: "#6b7280", // gray-500
  border: "#e5e7eb", // gray-200
}

// Função para obter data/hora no horário de Brasília (GMT-3)
const getBrasiliaDate = (offsetHours = 0) => {
  const now = new Date()
  const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  brasiliaTime.setHours(brasiliaTime.getHours() + offsetHours)
  return brasiliaTime.toISOString().slice(0, 16)
}

const getDefaultStartDate = () => getBrasiliaDate(-24 * 7) // 7 dias atrás
const getDefaultEndDate = () => getBrasiliaDate(0) // hora atual

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

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
}

export default function HistoricWebhookDetails() {
  const [data, setData] = useState<HistoricWebhookDetailItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [selectedWebhookId, setSelectedWebhookId] = useState<number | null>(null) // Alterado para WebhookId

  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate())
  const [shardIdInput, setShardIdInput] = useState<string>("")
  const [accountIdInput, setAccountIdInput] = useState<string>("")
  const [selectedSearchType, setSelectedSearchType] = useState<"shard" | "account">("shard")

  const getMinDate = () => {
    const now = new Date()
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    brasiliaTime.setMonth(brasiliaTime.getMonth() - 6)
    return brasiliaTime.toISOString().slice(0, 16)
  }

  const getMaxDate = () => getBrasiliaDate(0)

  // Envolver fetchData em useCallback
  const fetchData = useCallback(async () => {
    // Validar se pelo menos um ID foi preenchido antes de fazer a requisição
    if (!shardIdInput && !accountIdInput) {
      setError("Por favor, preencha o Shard ID ou o Account ID para pesquisar.")
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const payload: { from: string; to: string; ShardId?: number; AccountId?: number } = {
        from: new Date(startDate).toISOString(),
        to: new Date(endDate).toISOString(),
      }

      if (selectedSearchType === "shard" && shardIdInput) {
        payload.ShardId = Number.parseInt(shardIdInput)
      } else if (selectedSearchType === "account" && accountIdInput) {
        payload.AccountId = Number.parseInt(accountIdInput)
      }

      const result = await fetchHistoricWebhooksDetails(payload)
      setData(result)
      setSelectedWebhookId(null) // Reset webhook selection when new data is loaded
    } catch (err) {
      console.error("Failed to fetch historic webhook details:", err)
      setError("Falha ao carregar dados. Verifique os filtros e tente novamente.")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, shardIdInput, accountIdInput, selectedSearchType])

  // O useEffect agora depende de 'triggerSearch' e da função 'fetchData' memoizada
  useEffect(() => {
    if (triggerSearch) {
      fetchData()
      setTriggerSearch(false)
    }
  }, [triggerSearch, fetchData])

  const clearFilters = () => {
    setStartDate(getDefaultStartDate())
    setEndDate(getDefaultEndDate())
    setShardIdInput("")
    setAccountIdInput("")
    setSelectedSearchType("shard")
    setData([])
    setError(null)
    setTriggerSearch(false)
    setSelectedWebhookId(null)
  }

  const setQuickFilter = (hours: number) => {
    const endTime = getBrasiliaDate(0)
    const startTime = getBrasiliaDate(-hours)
    setStartDate(startTime)
    setEndDate(endTime)
  }

  // Calcular Webhook IDs únicos ordenados por soma total
  const webhookIdsSorted = useMemo(() => {
    const webhookTotals = new Map<number, number>()

    data.forEach((item) => {
      const current = webhookTotals.get(item.WebhookId) || 0
      webhookTotals.set(item.WebhookId, current + item.Quantity)
    })

    return Array.from(webhookTotals.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar por total decrescente
      .map(([webhookId, total]) => ({ webhookId, total }))
  }, [data])

  // Filtrar dados baseado no Webhook ID selecionado
  const filteredData = useMemo(() => {
    if (selectedWebhookId === null) return data
    return data.filter((item) => item.WebhookId === selectedWebhookId)
  }, [data, selectedWebhookId])

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    const sortedData = [...filteredData].sort(
      (a: HistoricWebhookDetailItem, b: HistoricWebhookDetailItem) =>
        new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime(),
    )

    // Reduzir a quantidade de pontos para melhorar a performance
    const maxDataPoints = 100
    const step = sortedData.length > maxDataPoints ? Math.floor(sortedData.length / maxDataPoints) : 1
    const reducedData = step > 1 ? sortedData.filter((_, index) => index % step === 0) : sortedData

    return {
      labels: reducedData.map((item: HistoricWebhookDetailItem) => formatDateForDisplay(item.DateTime)),
      datasets: [
        {
          label: selectedWebhookId ? `Webhook ${selectedWebhookId} - Quantity` : "Quantity",
          data: reducedData.map((item: HistoricWebhookDetailItem) => item.Quantity),
          borderColor: COLORS.primary,
          backgroundColor: `${COLORS.primary}33`, // 20% opacity
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: true,
        },
      ],
    }
  }, [filteredData, selectedWebhookId])

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "'Inter', sans-serif",
          },
          color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        displayColors: false, // Remove o quadrado colorido
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "rgba(17, 24, 39, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        titleColor: document.documentElement.classList.contains("dark") ? "#f3f4f6" : "#111827",
        bodyColor: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
        borderColor: document.documentElement.classList.contains("dark") ? "#374151" : "#d1d5db",
        borderWidth: 1,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context) => {
            const dataPoint = filteredData[context.dataIndex]
            if (selectedWebhookId === null) {
              // Quando "Todos" está selecionado, mostrar apenas Quantity
              return `Quantity: ${formatNumber(context.parsed.y)}`
            } else {
              // Quando um WebhookId específico está selecionado, mostrar Account ID e Quantity
              return [`Account ID: ${dataPoint?.AccountId || "N/A"}`, `Quantity: ${formatNumber(context.parsed.y)}`]
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(226, 232, 240, 0.6)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
          callback: (value) => formatNumber(value as number),
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 6,
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Webhooks</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
            {(shardIdInput || accountIdInput) &&
              ` • ${selectedSearchType === "shard" ? "Shard" : "Account"} ID: ${selectedSearchType === "shard" ? shardIdInput : accountIdInput}`}
            {selectedWebhookId && ` • Visualizando Webhook ${selectedWebhookId}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Inicial
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setData([])
                    setError(null)
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Final
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setData([])
                    setError(null)
                  }}
                  min={startDate || getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filtros Rápidos</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setQuickFilter(1)
                    setData([])
                    setError(null)
                  }}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Última hora
                </button>
                <button
                  onClick={() => {
                    setQuickFilter(6)
                    setData([])
                    setError(null)
                  }}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Últimas 6h
                </button>
                <button
                  onClick={() => {
                    setQuickFilter(24)
                    setData([])
                    setError(null)
                  }}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => {
                    setQuickFilter(168)
                    setData([])
                    setError(null)
                  }}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Última semana
                </button>
                <button
                  onClick={() => {
                    setQuickFilter(720)
                    setData([])
                    setError(null)
                  }}
                  className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  Últimos 30 dias
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por</label>
                <select
                  value={selectedSearchType}
                  onChange={(e) => {
                    setSelectedSearchType(e.target.value as "shard" | "account")
                    setShardIdInput("")
                    setAccountIdInput("")
                    setData([])
                    setError(null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                >
                  <option value="shard">Shard ID</option>
                  <option value="account">Account ID</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                {selectedSearchType === "shard" ? (
                  <>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shard ID
                      </label>
                      <input
                        type="number"
                        value={shardIdInput}
                        onChange={(e) => {
                          setShardIdInput(e.target.value)
                          setData([])
                          setError(null)
                        }}
                        placeholder="Ex: 1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account ID
                      </label>
                      <input
                        type="number"
                        value={accountIdInput}
                        onChange={(e) => {
                          setAccountIdInput(e.target.value)
                          setData([])
                          setError(null)
                        }}
                        placeholder="Ex: 12345"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                      />
                    </div>
                  </>
                )}
                <button
                  onClick={() => {
                    if (!shardIdInput && !accountIdInput) {
                      setError("Por favor, preencha o Shard ID ou o Account ID para pesquisar.")
                      setData([])
                      return
                    }
                    setError(null)
                    setTriggerSearch(true)
                  }}
                  disabled={loading || (!shardIdInput && !accountIdInput)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Pesquisar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Carregando dados...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <List className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Nenhum dado encontrado</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ajuste os filtros de data e preencha o {selectedSearchType === "shard" ? "Shard ID" : "Account ID"} para
            pesquisar.
          </p>
        </div>
      ) : (
        <>
          {/* Gráfico */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Seleção de Webhook IDs */}
          {webhookIdsSorted.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Selecionar Webhook ID</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Clique em um Webhook ID para visualizar apenas seus dados. Ordenados por quantidade total (maior
                  primeiro).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Botão "Todos" */}
                <motion.button
                  onClick={() => setSelectedWebhookId(null)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedWebhookId === null
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Todos ({data.length} registros)
                </motion.button>

                {/* Botões para cada Webhook ID */}
                {webhookIdsSorted.map(({ webhookId, total }) => (
                  <motion.button
                    key={webhookId}
                    onClick={() => setSelectedWebhookId(webhookId)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedWebhookId === webhookId
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {webhookId}
                    <span className="ml-1 text-xs opacity-75">({formatNumber(total)})</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
