"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Calendar, List } from "lucide-react"
import { fetchHistoricAutomations } from "../utils/api"
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

export interface HistoricAutomationItem {
  AccountId: number
  AutomationId: number
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
  // Obter o timestamp atual e ajustar para GMT-3
  const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000 + offsetHours * 60 * 60 * 1000)
  return brasiliaTime.toISOString().slice(0, 16)
}

// Função para converter datetime-local string diretamente para ISO sem conversão de fuso
const convertToISOWithoutTimezone = (datetimeLocalString: string) => {
  // Input: "2025-06-17T13:32"
  // Output: "2025-06-17T13:32:00.000Z"
  return `${datetimeLocalString}:00.000Z`
}

const getDefaultStartDate = () => getBrasiliaDate(-24 * 7) // 7 dias atrás
const getDefaultEndDate = () => getBrasiliaDate(0) // hora atual

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return ""
  let date: Date

  if (dateString.endsWith("Z")) {
    // Data em UTC, precisa converter para horário brasileiro (GMT-3)
    date = new Date(dateString)
    // Adicionar 3 horas para converter de UTC para horário brasileiro
    date = new Date(date.getTime() + 3 * 60 * 60 * 1000)
  } else {
    // Assumir que já está no horário brasileiro, criar data sem conversão de fuso
    const cleanDateString = dateString.replace(/[+-]\d{2}:\d{2}$/, "").replace("Z", "")
    date = new Date(cleanDateString + (cleanDateString.includes("T") ? "" : "T00:00:00"))
  }

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

export default function HistoricAutomations() {
  const [data, setData] = useState<HistoricAutomationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [selectedAutomationId, setSelectedAutomationId] = useState<number | null>(null)
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  const [startDate, setStartDate] = useState<string>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate())
  const [shardIdInput, setShardIdInput] = useState<string>("")
  const [accountIdInput, setAccountIdInput] = useState<string>("")
  const [selectedSearchType, setSelectedSearchType] = useState<"shard" | "account">("shard")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const getMinDate = () => {
    const now = new Date()
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    brasiliaTime.setMonth(brasiliaTime.getMonth() - 6)
    return brasiliaTime.toISOString().slice(0, 16)
  }

  const getMaxDate = () => getBrasiliaDate(0)

  // Destruir gráfico anterior quando dados mudarem
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [selectedAutomationId, data])

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
        // Enviar as datas exatamente como digitadas, sem conversão de fuso horário
        from: convertToISOWithoutTimezone(startDate),
        to: convertToISOWithoutTimezone(endDate),
      }

      if (selectedSearchType === "shard" && shardIdInput) {
        payload.ShardId = Number.parseInt(shardIdInput)
      } else if (selectedSearchType === "account" && accountIdInput) {
        payload.AccountId = Number.parseInt(accountIdInput)
      }

      const result = await fetchHistoricAutomations(payload)
      setData(result)
      setSelectedAutomationId(null) // Reset automation selection when new data is loaded
    } catch (err) {
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
    setSelectedAutomationId(null)
  }

  const setQuickFilter = (hours: number) => {
    const endTime = getBrasiliaDate(0)
    const startTime = getBrasiliaDate(-hours)
    setStartDate(startTime)
    setEndDate(endTime)
  }

  // Calcular Automation IDs únicos ordenados por soma total
  const automationIdsSorted = useMemo(() => {
    const automationTotals = new Map<number, number>()

    data.forEach((item) => {
      const current = automationTotals.get(item.AutomationId) || 0
      automationTotals.set(item.AutomationId, current + item.Quantity)
    })

    return Array.from(automationTotals.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar por total decrescente
      .map(([automationId, total]) => ({ automationId, total }))
  }, [data])

  // Preparar dados da tabela agrupados por Automation ID e Account ID
  const automationTableData = useMemo(() => {
    const grouped = new Map<string, { automationId: number; accountId: number; total: number }>()

    data.forEach((item) => {
      const key = `${item.AutomationId}-${item.AccountId}`
      const existing = grouped.get(key)
      if (existing) {
        existing.total += item.Quantity
      } else {
        grouped.set(key, {
          automationId: item.AutomationId,
          accountId: item.AccountId,
          total: item.Quantity,
        })
      }
    })

    return Array.from(grouped.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 50) // Limitar aos top 50 resultados
  }, [data])

  // Filtrar dados da tabela baseado na busca
  const filteredAutomationData = useMemo(() => {
    if (!searchTerm) return automationTableData

    const search = searchTerm.toLowerCase()
    return automationTableData.filter(
      (item) => item.automationId.toString().includes(search) || item.accountId.toString().includes(search),
    )
  }, [automationTableData, searchTerm])

  // Filtrar dados baseado no Automation ID selecionado
  const filteredData = useMemo(() => {
    if (selectedAutomationId === null) return data
    return data.filter((item) => item.AutomationId === selectedAutomationId)
  }, [data, selectedAutomationId])

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    const sortedData = [...filteredData].sort(
      (a: HistoricAutomationItem, b: HistoricAutomationItem) =>
        new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime(),
    )

    // Reduzir a quantidade de pontos para melhorar a performance
    const maxDataPoints = 100
    const step = sortedData.length > maxDataPoints ? Math.floor(sortedData.length / maxDataPoints) : 1
    const reducedData = step > 1 ? sortedData.filter((_, index) => index % step === 0) : sortedData

    return {
      labels: reducedData.map((item: HistoricAutomationItem) => formatDateForDisplay(item.DateTime)),
      datasets: [
        {
          label: selectedAutomationId ? `Automation ${selectedAutomationId} - Quantity` : "Quantity",
          data: reducedData.map((item: HistoricAutomationItem) => item.Quantity),
          borderColor: COLORS.primary,
          backgroundColor: `${COLORS.primary}33`, // 20% opacity
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: true,
        },
      ],
    }
  }, [filteredData, selectedAutomationId])

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Desabilitar animações para evitar conflitos
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
        displayColors: false,
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
            if (selectedAutomationId === null) {
              return `Quantity: ${formatNumber(context.parsed.y)}`
            } else {
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
        type: "linear",
        beginAtZero: true,
        grace: "5%",
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(226, 232, 240, 0.6)",
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          maxTicksLimit: 8,
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
          callback: (value) => formatNumber(Number(value)),
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Automações</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
            {(shardIdInput || accountIdInput) &&
              ` • ${selectedSearchType === "shard" ? "Shard" : "Account"} ID: ${selectedSearchType === "shard" ? shardIdInput : accountIdInput}`}
            {selectedAutomationId && ` • Visualizando Automation ${selectedAutomationId}`}
          </p>
        </div>
      </div>

      {/* Filtros sempre visíveis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shard ID</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account ID</label>
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
      </div>

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
              <Line ref={chartRef} data={chartData} options={chartOptions} redraw={true} />
            </div>
          </div>

          {/* Tabela de Automation IDs com busca */}
          {automationIdsSorted.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Automações por Conta</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Clique em uma linha para filtrar o gráfico. Use a busca para encontrar IDs específicos. (Max. resultados: 50)
                </p>

                {/* Campo de busca */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por Automation ID ou Account ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Automation ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Account ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAutomationData.map((item, index) => (
                      <motion.tr
                        key={`${item.automationId}-${item.accountId}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        onClick={() => setSelectedAutomationId(item.automationId)}
                        className={`cursor-pointer transition-colors ${
                          selectedAutomationId === item.automationId
                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.automationId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.accountId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatNumber(item.total)}
                        </td>
                      </motion.tr>
                    ))}
                    {filteredAutomationData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          Nenhum resultado encontrado para "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
                Mostrando {filteredAutomationData.length} de {Math.min(automationTableData.length, 50)} registros.
                {selectedAutomationId && (
                  <span className="ml-4">
                    • Filtro ativo: Automation {selectedAutomationId}
                    <button
                      onClick={() => setSelectedAutomationId(null)}
                      className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      (limpar)
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
