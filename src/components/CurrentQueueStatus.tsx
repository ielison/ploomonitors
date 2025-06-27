"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { RefreshCw, BarChart3, Table, AlertTriangle } from "lucide-react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js"
import { fetchWebhookData } from "../utils/api"

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface WebhookItem {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
}

// Tipos para a resposta da API
interface ApiResponse {
  response?: WebhookItem[] // A chave específica que a API usa
  data?: WebhookItem[]
  items?: WebhookItem[]
  results?: WebhookItem[]
  webhooks?: WebhookItem[]
  shards?: WebhookItem[]
  shard_id?: number
  webhooks_count?: number
  events_count?: number
  changes_reports_count?: number
  changelogs_count?: number
  automations_count?: number
  DateTime?: string
  [key: string]: unknown
}

type ApiResponseType = WebhookItem[] | ApiResponse | WebhookItem

// Função para formatar números com separador de milhares
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
}

// Função para formatar data/hora - corrigida para o fuso horário brasileiro (GMT-3)
const formatDateTime = (dateString: string): string => {
  if (!dateString) return ""

  const date = new Date(dateString)

  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  return `${day}/${month}/${year} - ${hours}:${minutes}`
}

// Função para determinar a cor da barra baseada na contagem
const getBarColor = (count: number): string => {
  if (count > 130000) return "rgb(185, 28, 28)" // Vermelho para valores muito altos
  if (count > 90000) return "rgb(238, 255, 0)" // Amarelo para valores altos
  return "rgb(29, 78, 216)" // Azul para valores normais
}

// Função para obter a classe CSS da cor baseada na contagem
const getTextColorClass = (count: number): string => {
  if (count > 130000) return "text-red-600 dark:text-red-400 font-semibold" // Vermelho para valores muito altos
  if (count > 90000) return "text-yellow-600 dark:text-yellow-400 font-semibold" // Amarelo para valores altos
  return "text-gray-500 dark:text-gray-300" // Cor padrão para valores normais
}

// Função para verificar se um objeto tem as propriedades de WebhookItem
const isWebhookItem = (obj: unknown): obj is WebhookItem => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).shard_id === "number" &&
    typeof (obj as Record<string, unknown>).webhooks_count === "number" &&
    typeof (obj as Record<string, unknown>).events_count === "number" &&
    typeof (obj as Record<string, unknown>).changes_reports_count === "number" &&
    typeof (obj as Record<string, unknown>).changelogs_count === "number" &&
    typeof (obj as Record<string, unknown>).automations_count === "number" &&
    typeof (obj as Record<string, unknown>).DateTime === "string"
  )
}

export default function CurrentQueueStatus() {
  const [data, setData] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")
  const chartRef = useRef<ChartJS<"bar"> | null>(null)
  const automationsChartRef = useRef<ChartJS<"bar"> | null>(null) // New ref for automations chart

  // Destruir gráfico anterior quando dados mudarem
  useEffect(() => {
    const chart = chartRef.current
    const automationsChart = automationsChartRef.current
    return () => {
      if (chart) {
        chart.destroy()
      }
      if (automationsChart) {
        // Destroy automations chart as well
        automationsChart.destroy()
      }
    }
  }, [data])

  // Função para normalizar os dados da API
  const normalizeApiData = (apiResponse: ApiResponseType): WebhookItem[] => {
    // Se a resposta é um array, verificar se todos os itens são válidos
    if (Array.isArray(apiResponse)) {
      const validItems = apiResponse.filter(isWebhookItem)
      if (validItems.length > 0) {
        return validItems
      }
    }

    // Se a resposta é um objeto
    if (apiResponse && typeof apiResponse === "object" && !Array.isArray(apiResponse)) {
      const response = apiResponse as ApiResponse

      // Primeiro, verificar a chave 'response' que é específica da sua API
      if (Array.isArray(response.response)) {
        const validItems = response.response.filter(isWebhookItem)
        if (validItems.length > 0) {
          return validItems
        }
      }

      // Tentar encontrar o array nas outras chaves possíveis
      const possibleArrayKeys: (keyof ApiResponse)[] = ["data", "items", "results", "webhooks", "shards"]

      for (const key of possibleArrayKeys) {
        const value = response[key]
        if (Array.isArray(value)) {
          const validItems = value.filter(isWebhookItem)
          if (validItems.length > 0) {
            return validItems
          }
        }
      }

      // Se não encontrou array, mas tem propriedades que parecem ser dados de shard
      if (isWebhookItem(response)) {
        return [response] // Transformar objeto único em array
      }
    }

    // Se chegou até aqui, retornar array vazio
    return []
  }

  // Função para buscar os dados atuais
  const fetchCurrentData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchWebhookData()

      const normalizedData = normalizeApiData(result)

      setData(normalizedData)
      setLastUpdated(new Date().toISOString())

      if (normalizedData.length === 0) {
        setError("Nenhum dado foi retornado pela API. Estrutura de resposta inesperada.")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Added err back for error handling
      setError("Falha ao carregar dados. Verifique a conexão e tente novamente.")
      setData([]) // Garantir que data seja um array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar dados na montagem do componente
  useEffect(() => {
    fetchCurrentData()
  }, [fetchCurrentData])

  // Preparar dados para o gráfico de barras - com verificação de segurança
  const chartData = {
    labels: data.map((item) => [`Shard ${item.shard_id}`, `${formatNumber(item.webhooks_count)}`]),
    datasets: [
      {
        label: "Webhooks Count",
        data: data.map((item) => item.webhooks_count),
        backgroundColor: data.map((item) => getBarColor(item.webhooks_count)),
      },
    ],
  }

  // Opções do gráfico
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Desabilitar animações para evitar conflitos
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            const index = tooltipItems[0].dataIndex
            return data[index] ? `Shard ${data[index].shard_id}` : "N/A"
          },
          label: (tooltipItem: TooltipItem<"bar">) => `Webhooks: ${formatNumber(tooltipItem.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          padding: 0,
          autoSkip: false,
          font: {
            size: 12,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
        },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        grace: "5%",
        ticks: {
          stepSize: 1,
          precision: 0,
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
          callback: (value) => formatNumber(Number(value)),
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(226, 232, 240, 0.6)",
        },
      },
    },
  }

  // NEW: Prepare data for the Automations chart
  const automationsChartData = {
    labels: data.map((item) => [`Shard ${item.shard_id}`, `${formatNumber(item.automations_count)}`]),
    datasets: [
      {
        label: "Automations Count",
        data: data.map((item) => item.automations_count),
        backgroundColor: data.map((item) => getBarColor(item.automations_count)), // Reuse getBarColor for now
      },
    ],
  }

  // NEW: Options for the Automations chart
  const automationsChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            const index = tooltipItems[0].dataIndex
            return data[index] ? `Shard ${data[index].shard_id}` : "N/A"
          },
          label: (tooltipItem: TooltipItem<"bar">) => `Automations: ${formatNumber(tooltipItem.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          padding: 0,
          autoSkip: false,
          font: {
            size: 12,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
        },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        grace: "5%",
        ticks: {
          stepSize: 1,
          precision: 0,
          maxTicksLimit: 8,
          font: {
            size: 10,
          },
          color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
          callback: (value) => formatNumber(Number(value)),
        },
        grid: {
          color: document.documentElement.classList.contains("dark")
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(226, 232, 240, 0.6)",
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estado Atual das Filas</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {lastUpdated ? (
              <>
                Última atualização: {formatDateTime(lastUpdated)}
              </>
            ) : (
              "Carregando dados..."
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
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
          <motion.button
            onClick={fetchCurrentData}
            className="flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Atualizando..." : "Atualizar"}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md text-red-700 dark:text-red-300">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-solid rounded-full animate-spin mb-4 border-gray-300 dark:border-gray-600 border-t-indigo-500 dark:border-t-indigo-400"></div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Carregando dados...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Aguarde enquanto buscamos as informações.</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Nenhum dado disponível</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Clique em "Atualizar" para buscar os dados mais recentes.
          </p>
        </div>
      ) : (
        <div>
          {/* Visualização do Gráfico */}
          {viewMode === "chart" && (
            <>
              {/* Webhooks Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Webhooks por Shard</h3>
                </div>
                <div className="h-[300px]">
                  <Bar ref={chartRef} data={chartData} options={chartOptions} redraw={true} />
                </div>
              </div>

              {/* NEW: Automations Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Automações por Shard</h3>
                </div>
                <div className="h-[300px]">
                  <Bar
                    ref={automationsChartRef}
                    data={automationsChartData}
                    options={automationsChartOptions}
                    redraw={true}
                  />
                </div>
              </div>
            </>
          )}

          {/* Visualização da Tabela */}
          {viewMode === "table" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filas Detalhadas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.length} shards ativos</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Shard
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Webhooks
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Changes Reports
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Changelogs
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Automations
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        DateTime
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((item, index) => (
                      <motion.tr
                        key={`${item.shard_id}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center">
                          {item.shard_id}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-center ${getTextColorClass(item.webhooks_count)}`}
                        >
                          {formatNumber(item.webhooks_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          {formatNumber(item.events_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          {formatNumber(item.changes_reports_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          {formatNumber(item.changelogs_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          {formatNumber(item.automations_count)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                          {formatDateTime(item.DateTime)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
