"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Calendar, List, BarChart3, Table } from "lucide-react"
import { fetchHistoricCentral } from "../utils/api"
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

export interface HistoricWebhookData {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
}

// Cores para o tema (consistente com outras abas)
const COLORS = {
  primary: "#4f46e5", // indigo-600
  secondary: "#0ea5e9", // sky-500
  accent1: "#f97316", // orange-500
  accent2: "#10b981", // emerald-500
  accent3: "#8b5cf6", // violet-500
  accent4: "#ef4444", // red-500
}

// Métricas disponíveis para seleção (movido para fora do componente)
const METRICS = [
  { key: "webhooks_count", label: "Webhooks", color: COLORS.primary },
  { key: "events_count", label: "Events", color: COLORS.secondary },
  { key: "changes_reports_count", label: "Changes Reports", color: COLORS.accent1 },
  { key: "changelogs_count", label: "Changelogs", color: COLORS.accent2 },
  { key: "automations_count", label: "Automations", color: COLORS.accent3 },
] as const

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

  // Se a string já termina com 'Z', assumir que é UTC e converter para horário brasileiro
  // Se não termina com 'Z', assumir que já está no horário brasileiro
  let date: Date

  if (dateString.endsWith("Z")) {
    // Data em UTC, precisa converter para horário brasileiro (GMT-3)
    date = new Date(dateString)
    // Adicionar 3 horas para converter de UTC para horário brasileiro
    date = new Date(date.getTime() + 3 * 60 * 60 * 1000)
  } else {
    // Assumir que já está no horário brasileiro, criar data sem conversão de fuso
    // Remover qualquer informação de fuso horário e tratar como horário local
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

export default function HistoricWebhookData() {
  const [data, setData] = useState<HistoricWebhookData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [triggerSearch, setTriggerSearch] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  const [startDate, setStartDate] = useState<string>(getDefaultStartDate())
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate())
  const [shardIdInput, setShardIdInput] = useState<string>("")

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
  }, [selectedMetric, data])

  // Envolver fetchData em useCallback
  const fetchData = useCallback(async () => {
    // Validar se Shard ID foi preenchido
    if (!shardIdInput) {
      setError("Por favor, preencha o Shard ID para pesquisar.")
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        ShardId: Number.parseInt(shardIdInput),
        // Enviar as datas exatamente como digitadas, sem conversão de fuso horário
        from: convertToISOWithoutTimezone(startDate),
        to: convertToISOWithoutTimezone(endDate),
      }

      const result = await fetchHistoricCentral(payload)

      setData(result)
      setSelectedMetric(null) // Reset metric selection when new data is loaded
    } catch (err) {
      setError("Falha ao carregar dados. Verifique os filtros e tente novamente.")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, shardIdInput])

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
    setData([])
    setError(null)
    setTriggerSearch(false)
    setSelectedMetric(null)
  }

  const setQuickFilter = (hours: number) => {
    const endTime = getBrasiliaDate(0)
    const startTime = getBrasiliaDate(-hours)
    setStartDate(startTime)
    setEndDate(endTime)
  }

  // Filtrar dados baseado na métrica selecionada
  const filteredData = useMemo(() => {
    return data
  }, [data])

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    const sortedData = [...filteredData].sort(
      (a: HistoricWebhookData, b: HistoricWebhookData) =>
        new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime(),
    )

    // Reduzir a quantidade de pontos para melhorar a performance
    const maxDataPoints = 100
    const step = sortedData.length > maxDataPoints ? Math.floor(sortedData.length / maxDataPoints) : 1
    const reducedData = step > 1 ? sortedData.filter((_, index) => index % step === 0) : sortedData

    const datasets = []

    if (selectedMetric === null) {
      // Mostrar todas as métricas
      METRICS.forEach((metric) => {
        datasets.push({
          label: metric.label,
          data: reducedData.map((item: HistoricWebhookData) => item[metric.key as keyof HistoricWebhookData] as number),
          borderColor: metric.color,
          backgroundColor: `${metric.color}33`, // 20% opacity
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: false,
        })
      })
    } else {
      // Mostrar apenas a métrica selecionada
      const metric = METRICS.find((m) => m.key === selectedMetric)
      if (metric) {
        datasets.push({
          label: metric.label,
          data: reducedData.map((item: HistoricWebhookData) => item[metric.key as keyof HistoricWebhookData] as number),
          borderColor: metric.color,
          backgroundColor: `${metric.color}33`, // 20% opacity
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: true,
        })
      }
    }

    return {
      labels: reducedData.map((item: HistoricWebhookData) => formatDateForDisplay(item.DateTime)),
      datasets,
    }
  }, [filteredData, selectedMetric])

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
            if (selectedMetric === null) {
              // Quando "Todos" está selecionado, mostrar apenas a quantidade da série atual
              return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
            } else {
              // Quando uma métrica específica está selecionada, mostrar Shard ID e quantidade
              return [
                `Shard ID: ${dataPoint?.shard_id || "N/A"}`,
                `${context.dataset.label}: ${formatNumber(context.parsed.y)}`,
              ]
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Filas</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {formatDateForDisplay(startDate)} até {formatDateForDisplay(endDate)}
            {shardIdInput && ` • Shard ID: ${shardIdInput}`}
            {selectedMetric && ` • Visualizando ${METRICS.find((m) => m.key === selectedMetric)?.label}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Toggle de visualização */}
          {data.length > 0 && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={() => setViewMode("chart")}
                className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "chart"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Gráfico
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Table className="w-4 h-4 mr-1" />
                Tabela
              </button>
            </div>
          )}
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

        <div className="flex items-end gap-2">
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
              min="1"
              max="12"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
            />
          </div>
          <button
            onClick={() => {
              if (!shardIdInput) {
                setError("Por favor, preencha o Shard ID para pesquisar.")
                setData([])
                return
              }
              setError(null)
              setTriggerSearch(true)
            }}
            disabled={loading || !shardIdInput}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Pesquisar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-solid rounded-full animate-spin mb-4 border-gray-300 dark:border-gray-600 border-t-indigo-500 dark:border-t-indigo-400"></div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Carregando dados...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Aguarde enquanto buscamos as informações.</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <List className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Nenhum dado encontrado</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ajuste os filtros de data e preencha o Shard ID para pesquisar.
          </p>
        </div>
      ) : (
        <>
          {/* Visualização do Gráfico */}
          {viewMode === "chart" && (
            <>
              {/* Gráfico */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
                <div className="h-[400px]">
                  <Line ref={chartRef} data={chartData} options={chartOptions} redraw={true} />
                </div>
              </div>

              {/* Seleção de Métricas */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Selecionar Métrica</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Clique em uma métrica para visualizar apenas seus dados, ou em "Todas" para ver todas as métricas.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Botão "Todas" */}
                  <motion.button
                    onClick={() => setSelectedMetric(null)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedMetric === null
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Todas as Métricas
                  </motion.button>

                  {/* Botões para cada métrica */}
                  {METRICS.map((metric) => (
                    <motion.button
                      key={metric.key}
                      onClick={() => setSelectedMetric(metric.key)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedMetric === metric.key
                          ? "text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      style={{
                        backgroundColor: selectedMetric === metric.key ? metric.color : undefined,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {metric.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Visualização da Tabela */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dados Detalhados</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {data.length} registros encontrados • Shard ID: {shardIdInput}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Shard ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Webhooks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Changes Reports
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Changelogs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Automations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data
                      .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime()) // Ordenar por data mais recente primeiro
                      .map((item, index) => (
                        <motion.tr
                          key={`${item.DateTime}-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDateForDisplay(item.DateTime)}
                          </td>
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
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
