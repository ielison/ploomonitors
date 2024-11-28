import { useState, useEffect } from 'react'
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js"
import ShardData, { AccountData } from './components/ShardData'
import WebhookData from './components/WebHookData'
import { fetchShardData, fetchWebhookData } from './utils/api'
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

interface WebhookItem {
  shard_id: number;
  webhooks_count: number;
  events_count: number;
  changes_reports_count: number;
  changelogs_count: number;
  automations_count: number;
  DateTime: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function App() {
  const [shardData, setShardData] = useState<Record<string, AccountData[]> | null>(null)
  const [webhookData, setWebhookData] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isWebhooksCountExpanded, setIsWebhooksCountExpanded] = useState(true)

  const updateData = async () => {
    try {
      setLoading(true)
      const [shardResult, webhookResult] = await Promise.all([
        fetchShardData(),
        fetchWebhookData()
      ])
      setShardData(shardResult.response as Record<string, AccountData[]>)
      setWebhookData(webhookResult.response)
      setError(null)
    } catch (err: unknown) {
      setError('Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updateData()
    const interval = setInterval(updateData, 600000) // 10 minutes
    return () => clearInterval(interval)
  }, [])

  const chartData = {
    labels: webhookData.map((item) => [
      `Shard ${item.shard_id}`,
      `${item.webhooks_count}`,
    ]),
    datasets: [
      {
        label: "Webhooks Count",
        data: webhookData.map((item) => item.webhooks_count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            const index = tooltipItems[0].dataIndex
            return `Shard ${webhookData[index].shard_id}`
          },
          label: (tooltipItem: TooltipItem<"bar">) =>
            `Webhooks: ${tooltipItem.raw as number}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          padding: 0,
          autoSkip: false,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Monitor por Shard</h1>
          <button 
            onClick={updateData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        {loading && <p className="text-center py-4">Loading...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Webhooks por Shard</h2>
                <button 
                  onClick={() => setIsWebhooksCountExpanded(!isWebhooksCountExpanded)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isWebhooksCountExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>
              {isWebhooksCountExpanded && (
                <div className="h-[300px]">
                  <Bar data={chartData} options={options} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <WebhookData data={webhookData} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Shard Data</h2>
              {shardData && <ShardData data={shardData} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
