"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Filter, ChevronDown, ChevronUp, BarChart3, LineChart } from "lucide-react"
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
  Filler,
  type ChartOptions,
} from "chart.js"
import type { HistoricWebhookData, HistoricWebhookDataProps } from "../data/mockHistoricWebhookData"

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// Cores para o tema
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

export default function HistoricWebhookDataComponent({ data }: HistoricWebhookDataProps) {
  const [selectedShard, setSelectedShard] = useState<number | null>(null)
  const [filteredData, setFilteredData] = useState<HistoricWebhookData[]>(data)
  const [viewMode, setViewMode] = useState<"line" | "bar" | "table">("line")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string>("webhooks_count")

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

    const filtered = data.filter((webhook: HistoricWebhookData) => {
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
  const uniqueShards = useMemo(() => {
    return Array.from(new Set(filteredData.map((item: HistoricWebhookData) => item.shard_id))).sort(
      (a: number, b: number) => a - b,
    )
  }, [filteredData])

  // Filtrar dados por shard selecionado
  const shardFilteredData = useMemo(() => {
    if (selectedShard === null) return filteredData
    return filteredData.filter((item: HistoricWebhookData) => item.shard_id === selectedShard)
  }, [filteredData, selectedShard])

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (shardFilteredData.length === 0) {
      return {
        webhooks: { avg: 0, max: 0, total: 0 },
        events: { avg: 0, max: 0, total: 0 },
        changes: { avg: 0, max: 0, total: 0 },
        changelogs: { avg: 0, max: 0, total: 0 },
        automations: { avg: 0, max: 0, total: 0 },
      }
    }

    let totalWebhooks = 0
    let maxWebhooks = 0
    let totalEvents = 0
    let maxEvents = 0
    let totalChanges = 0
    let maxChanges = 0
    let totalChangelogs = 0
    let maxChangelogs = 0
    let totalAutomations = 0
    let maxAutomations = 0

    shardFilteredData.forEach((item: HistoricWebhookData) => {
      totalWebhooks += item.webhooks_count
      maxWebhooks = Math.max(maxWebhooks, item.webhooks_count)

      totalEvents += item.events_count
      maxEvents = Math.max(maxEvents, item.events_count)

      totalChanges += item.changes_reports_count
      maxChanges = Math.max(maxChanges, item.changes_reports_count)

      totalChangelogs += item.changelogs_count
      maxChangelogs = Math.max(maxChangelogs, item.changelogs_count)

      totalAutomations += item.automations_count
      maxAutomations = Math.max(maxAutomations, item.automations_count)
    })

    const count = shardFilteredData.length

    return {
      webhooks: {
        avg: Math.round(totalWebhooks / count),
        max: maxWebhooks,
        total: totalWebhooks,
      },
      events: {
        avg: Math.round(totalEvents / count),
        max: maxEvents,
        total: totalEvents,
      },
      changes: {
        avg: Math.round(totalChanges / count),
        max: maxChanges,
        total: totalChanges,
      },
      changelogs: {
        avg: Math.round(totalChangelogs / count),
        max: maxChangelogs,
        total: totalChangelogs,
      },
      automations: {
        avg: Math.round(totalAutomations / count),
        max: maxAutomations,
        total: totalAutomations,
      },
    }
  }, [shardFilteredData])

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    const sortedData = [...shardFilteredData].sort(
      (a: HistoricWebhookData, b: HistoricWebhookData) =>
        new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime(),
    )

    // Reduzir a quantidade de pontos para melhorar a performance
    const maxDataPoints = 100
    const step = sortedData.length > maxDataPoints ? Math.floor(sortedData.length / maxDataPoints) : 1
    const reducedData = step > 1 ? sortedData.filter((_, index) => index % step === 0) : sortedData

    // Configurar datasets baseado no modo de visualização
    if (viewMode === "line") {
      return {
        labels: reducedData.map((item: HistoricWebhookData) => formatDateForDisplay(item.DateTime)),
        datasets: [
          {
            label: "Webhooks",
            data: reducedData.map((item: HistoricWebhookData) => item.webhooks_count),
            borderColor: COLORS.primary,
            backgroundColor: `${COLORS.primary}33`, // 20% opacity
            borderWidth: selectedMetric === "webhooks_count" ? 3 : 1.5,
            pointRadius: selectedMetric === "webhooks_count" ? 2 : 0,
            tension: 0.3,
            fill: selectedMetric === "webhooks_count",
            hidden: selectedMetric !== "webhooks_count" && selectedMetric !== "all",
          },
          {
            label: "Events",
            data: reducedData.map((item: HistoricWebhookData) => item.events_count),
            borderColor: COLORS.secondary,
            backgroundColor: `${COLORS.secondary}33`,
            borderWidth: selectedMetric === "events_count" ? 3 : 1.5,
            pointRadius: selectedMetric === "events_count" ? 2 : 0,
            tension: 0.3,
            fill: selectedMetric === "events_count",
            hidden: selectedMetric !== "events_count" && selectedMetric !== "all",
          },
          {
            label: "Changes Reports",
            data: reducedData.map((item: HistoricWebhookData) => item.changes_reports_count),
            borderColor: COLORS.accent1,
            backgroundColor: `${COLORS.accent1}33`,
            borderWidth: selectedMetric === "changes_reports_count" ? 3 : 1.5,
            pointRadius: selectedMetric === "changes_reports_count" ? 2 : 0,
            tension: 0.3,
            fill: selectedMetric === "changes_reports_count",
            hidden: selectedMetric !== "changes_reports_count" && selectedMetric !== "all",
          },
          {
            label: "Changelogs",
            data: reducedData.map((item: HistoricWebhookData) => item.changelogs_count),
            borderColor: COLORS.accent2,
            backgroundColor: `${COLORS.accent2}33`,
            borderWidth: selectedMetric === "changelogs_count" ? 3 : 1.5,
            pointRadius: selectedMetric === "changelogs_count" ? 2 : 0,
            tension: 0.3,
            fill: selectedMetric === "changelogs_count",
            hidden: selectedMetric !== "changelogs_count" && selectedMetric !== "all",
          },
          {
            label: "Automations",
            data: reducedData.map((item: HistoricWebhookData) => item.automations_count),
            borderColor: COLORS.accent3,
            backgroundColor: `${COLORS.accent3}33`,
            borderWidth: selectedMetric === "automations_count" ? 3 : 1.5,
            pointRadius: selectedMetric === "automations_count" ? 2 : 0,
            tension: 0.3,
            fill: selectedMetric === "automations_count",
            hidden: selectedMetric !== "automations_count" && selectedMetric !== "all",
          },
        ],
      }
    } else {
      // Modo de barras - mostrar apenas a métrica selecionada
      let label = "Webhooks"
      let color = COLORS.primary
      let data = reducedData.map((item: HistoricWebhookData) => item.webhooks_count)

      switch (selectedMetric) {
        case "events_count":
          label = "Events"
          color = COLORS.secondary
          data = reducedData.map((item: HistoricWebhookData) => item.events_count)
          break
        case "changes_reports_count":
          label = "Changes Reports"
          color = COLORS.accent1
          data = reducedData.map((item: HistoricWebhookData) => item.changes_reports_count)
          break
        case "changelogs_count":
          label = "Changelogs"
          color = COLORS.accent2
          data = reducedData.map((item: HistoricWebhookData) => item.changelogs_count)
          break
        case "automations_count":
          label = "Automations"
          color = COLORS.accent3
          data = reducedData.map((item: HistoricWebhookData) => item.automations_count)
          break
      }

      return {
        labels: reducedData.map((item: HistoricWebhookData) => formatDateForDisplay(item.DateTime)),
        datasets: [
          {
            label,
            data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
          },
        ],
      }
    }
  }, [shardFilteredData, viewMode, selectedMetric])

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
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Filas</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
            {selectedShard !== null && ` • Shard ${selectedShard}`}
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

          <div className="flex bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("line")}
              className={`flex items-center px-3 py-2 ${
                viewMode === "line"
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              } transition-colors`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("bar")}
              className={`flex items-center px-3 py-2 ${
                viewMode === "bar"
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              } transition-colors`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center px-3 py-2 ${
                viewMode === "table"
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              } transition-colors`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Inicial
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  onChange={(e) => setEndDate(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selecionar Shard
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedShard(null)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    selectedShard === null
                      ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Todos os Shards
                </button>
                {uniqueShards.map((shardId: number) => (
                  <button
                    key={shardId}
                    onClick={() => setSelectedShard(shardId)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedShard === shardId
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    Shard {shardId}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Webhooks"
          value={formatNumber(stats.webhooks.avg)}
          subValue={`Máx: ${formatNumber(stats.webhooks.max)}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          }
          color="bg-indigo-600 dark:bg-indigo-500 text-white"
        />
        <StatCard
          title="Events"
          value={formatNumber(stats.events.avg)}
          subValue={`Máx: ${formatNumber(stats.events.max)}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          }
          color="bg-sky-500 dark:bg-sky-600 text-white"
        />
        <StatCard
          title="Changes Reports"
          value={formatNumber(stats.changes.avg)}
          subValue={`Máx: ${formatNumber(stats.changes.max)}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          }
          color="bg-orange-500 dark:bg-orange-600 text-white"
        />
        <StatCard
          title="Changelogs"
          value={formatNumber(stats.changelogs.avg)}
          subValue={`Máx: ${formatNumber(stats.changelogs.max)}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          }
          color="bg-emerald-500 dark:bg-emerald-600 text-white"
        />
        <StatCard
          title="Automations"
          value={formatNumber(stats.automations.avg)}
          subValue={`Máx: ${formatNumber(stats.automations.max)}`}
          icon={
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          }
          color="bg-violet-500 dark:bg-violet-600 text-white"
        />
      </div>

      {/* Seletor de métricas */}
      {viewMode !== "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecionar Métrica
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMetric("all")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === "all"
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Todas as Métricas
              </button>
              <button
                onClick={() => setSelectedMetric("webhooks_count")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === "webhooks_count"
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Webhooks
              </button>
              <button
                onClick={() => setSelectedMetric("events_count")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === "events_count"
                    ? "bg-sky-500 dark:bg-sky-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setSelectedMetric("changes_reports_count")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === "changes_reports_count"
                    ? "bg-orange-500 dark:bg-orange-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Changes Reports
              </button>
              <button
                onClick={() => setSelectedMetric("changelogs_count")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === "changelogs_count"
                    ? "bg-emerald-500 dark:bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Changelogs
              </button>
              <button
                onClick={() => setSelectedMetric("automations_count")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedMetric === "automations_count"
                    ? "bg-violet-500 dark:bg-violet-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Automations
              </button>
            </div>
          </div>

          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Tabela de dados */}
      {viewMode === "table" && filteredData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Shard ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Webhooks
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Events
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Changes Reports
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Changelogs
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Automations
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Data/Hora
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {shardFilteredData
                  .sort(
                    (a: HistoricWebhookData, b: HistoricWebhookData) =>
                      new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime(),
                  )
                  .slice(0, 100) // Limitar a 100 registros para performance
                  .map((item: HistoricWebhookData, index: number) => (
                    <tr
                      key={`${item.shard_id}-${item.DateTime}`}
                      className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.shard_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatNumber(item.webhooks_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatNumber(item.events_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatNumber(item.changes_reports_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatNumber(item.changelogs_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatNumber(item.automations_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {shardFilteredData.length > 100 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-sm text-gray-500 dark:text-gray-300">
              Mostrando 100 de {shardFilteredData.length} registros
            </div>
          )}
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors duration-300">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Nenhum dado encontrado</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tente ajustar o filtro de data ou usar os filtros rápidos
          </p>
        </div>
      )}
    </div>
  )
}
