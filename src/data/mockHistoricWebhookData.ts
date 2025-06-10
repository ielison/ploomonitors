export interface HistoricWebhookData {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
}

export interface HistoricWebhookDataProps {
  data: HistoricWebhookData[]
}

// Função para gerar dados históricos de webhook com padrões realistas
export const generateMockWebhookData = (): HistoricWebhookData[] => {
  const data: HistoricWebhookData[] = []
  const shardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  // Data de início: Janeiro 2025
  const startDate = new Date("2025-01-01T00:00:00.000Z")
  // Data de fim: Junho 2025
  const endDate = new Date("2025-06-30T23:59:59.999Z")

  // Gerar dados para cada shard em intervalos de 10 minutos
  const totalMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60))
  const intervalMinutes = 10 // Dados a cada 10 minutos
  const totalIntervals = Math.floor(totalMinutes / intervalMinutes)

  // Gerar aproximadamente 2000 registros distribuídos ao longo do período
  const targetRecords = 2000

  for (let i = 0; i < totalIntervals; i += Math.floor(totalIntervals / targetRecords)) {
    const currentTime = new Date(startDate.getTime() + i * intervalMinutes * 60 * 1000)

    // Arredondar para intervalos de 10 minutos
    const minutes = Math.floor(currentTime.getMinutes() / 10) * 10
    currentTime.setMinutes(minutes, 0, 0)

    // Selecionar alguns shards aleatórios para este timestamp (não todos)
    const selectedShards = shardIds.filter(() => Math.random() < 0.7) // 70% chance de cada shard ter dados

    selectedShards.forEach((shardId) => {
      // Simular padrões realistas baseados no horário e dia da semana
      const hour = currentTime.getHours()
      const dayOfWeek = currentTime.getDay() // 0 = domingo, 6 = sábado

      // Fator de atividade baseado no horário (mais ativo durante horário comercial)
      let activityFactor = 1
      if (hour >= 8 && hour <= 18) {
        activityFactor = 1.5 // 50% mais ativo durante horário comercial
      } else if (hour >= 22 || hour <= 6) {
        activityFactor = 0.3 // 70% menos ativo durante madrugada
      }

      // Fator baseado no dia da semana (menos ativo nos fins de semana)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        activityFactor *= 0.4 // 60% menos ativo nos fins de semana
      }

      // Valores base para cada métrica
      const baseWebhooks = Math.floor(Math.random() * 50000 + 10000) * activityFactor
      const baseEvents = Math.floor(Math.random() * 30000 + 5000) * activityFactor
      const baseChangesReports = Math.floor(Math.random() * 15000 + 2000) * activityFactor
      const baseChangelogs = Math.floor(Math.random() * 8000 + 1000) * activityFactor
      const baseAutomations = Math.floor(Math.random() * 12000 + 1500) * activityFactor

      // Adicionar variação aleatória (±20%)
      const variation = () => 0.8 + Math.random() * 0.4

      const webhookData: HistoricWebhookData = {
        shard_id: shardId,
        webhooks_count: Math.floor(baseWebhooks * variation()),
        events_count: Math.floor(baseEvents * variation()),
        changes_reports_count: Math.floor(baseChangesReports * variation()),
        changelogs_count: Math.floor(baseChangelogs * variation()),
        automations_count: Math.floor(baseAutomations * variation()),
        DateTime: currentTime.toISOString(),
      }

      data.push(webhookData)
    })
  }

  // Ordenar por data
  data.sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime())

  return data
}

// Gerar os dados mock uma vez
export const mockHistoricWebhookData = generateMockWebhookData()

// Função para obter estatísticas dos dados gerados
export const getWebhookDataStats = (data: HistoricWebhookData[]) => {
  const stats = {
    totalRecords: data.length,
    shardCounts: {} as Record<number, number>,
    avgWebhooks: 0,
    avgEvents: 0,
    avgChangesReports: 0,
    avgChangelogs: 0,
    avgAutomations: 0,
    dateRange: { start: "", end: "" },
    uniqueShards: new Set<number>(),
  }

  let totalWebhooks = 0
  let totalEvents = 0
  let totalChangesReports = 0
  let totalChangelogs = 0
  let totalAutomations = 0

  data.forEach((record) => {
    // Contagem por shard
    stats.shardCounts[record.shard_id] = (stats.shardCounts[record.shard_id] || 0) + 1
    stats.uniqueShards.add(record.shard_id)

    // Somas para médias
    totalWebhooks += record.webhooks_count
    totalEvents += record.events_count
    totalChangesReports += record.changes_reports_count
    totalChangelogs += record.changelogs_count
    totalAutomations += record.automations_count
  })

  // Calcular médias
  if (data.length > 0) {
    stats.avgWebhooks = totalWebhooks / data.length
    stats.avgEvents = totalEvents / data.length
    stats.avgChangesReports = totalChangesReports / data.length
    stats.avgChangelogs = totalChangelogs / data.length
    stats.avgAutomations = totalAutomations / data.length

    // Range de datas
    const sortedData = [...data].sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime())
    stats.dateRange.start = sortedData[0].DateTime
    stats.dateRange.end = sortedData[sortedData.length - 1].DateTime
  }

  return stats
}

// Dados mock menores para testes rápidos
export const mockHistoricWebhookDataSmall: HistoricWebhookData[] = [
  {
    shard_id: 1,
    webhooks_count: 45000,
    events_count: 28000,
    changes_reports_count: 12000,
    changelogs_count: 6500,
    automations_count: 9800,
    DateTime: "2025-01-15T10:00:00.000Z",
  },
  {
    shard_id: 1,
    webhooks_count: 52000,
    events_count: 31000,
    changes_reports_count: 14000,
    changelogs_count: 7200,
    automations_count: 11200,
    DateTime: "2025-01-15T14:10:00.000Z",
  },
  {
    shard_id: 2,
    webhooks_count: 38000,
    events_count: 22000,
    changes_reports_count: 9500,
    changelogs_count: 5100,
    automations_count: 7800,
    DateTime: "2025-01-15T10:00:00.000Z",
  },
  {
    shard_id: 2,
    webhooks_count: 41000,
    events_count: 25000,
    changes_reports_count: 11000,
    changelogs_count: 5800,
    automations_count: 8900,
    DateTime: "2025-01-15T14:10:00.000Z",
  },
  {
    shard_id: 3,
    webhooks_count: 67000,
    events_count: 42000,
    changes_reports_count: 18000,
    changelogs_count: 9500,
    automations_count: 14500,
    DateTime: "2025-01-15T10:00:00.000Z",
  },
]

// Log das estatísticas para debug (apenas no navegador)
if (typeof window !== "undefined") {
  console.log("Mock Webhook Data Statistics:", getWebhookDataStats(mockHistoricWebhookData))
}
