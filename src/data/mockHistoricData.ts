import type { HistoricAccountData } from "../components/HistoricShardData"

// Função para gerar dados dinâmicos com 1000 registros
export const generateMockData = (): Record<string, HistoricAccountData[]> => {
  const data: Record<string, HistoricAccountData[]> = {}
  const shardIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] // 12 shards

  // Data de início: Janeiro 2025
  const startDate = new Date("2025-01-01T00:00:00.000Z")
  // Data de fim: Junho 2025
  const endDate = new Date("2025-06-31T23:59:59.999Z")

  // Gerar 1000 registros distribuídos entre janeiro e junho de 2025
  for (let i = 0; i < 10000; i++) {
    // Calcular data aleatória entre janeiro e junho de 2025
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    const randomDate = new Date(randomTime)

    // Arredondar para intervalos de 10 minutos
    const minutes = Math.floor(randomDate.getMinutes() / 10) * 10
    randomDate.setMinutes(minutes, 0, 0)

    // Selecionar shard aleatório (com distribuição mais realista)
    // Alguns shards podem ter mais dados que outros
    const shardWeights = [1, 1.2, 0.8, 1.5, 0.9, 1.1, 1.3, 0.7, 1.4, 1.0, 0.6, 1.2]
    const totalWeight = shardWeights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    let selectedShardIndex = 0

    for (let j = 0; j < shardWeights.length; j++) {
      random -= shardWeights[j]
      if (random <= 0) {
        selectedShardIndex = j
        break
      }
    }

    const shardId = shardIds[selectedShardIndex]

    // Gerar dados do account com variações mais realistas
    const accountData: HistoricAccountData = {
      AccountId: Number.parseInt(shardId) * 10000 + Math.floor(Math.random() * 9999) + 1, // IDs únicos por shard
      IsNotFound: Math.random() < 0.12, // 12% de chance de ser NotFound
      QueueTime:
        Math.random() < 0.1
          ? Math.random() * 300 + 100 // 10% dos casos: tempo alto (100-400 min)
          : Math.random() * 60, // 90% dos casos: tempo normal (0-60 min)
      DateTime: randomDate.toISOString(),
      ShardId: Number.parseInt(shardId),
    }

    // Adicionar ao shard correspondente
    if (!data[shardId]) {
      data[shardId] = []
    }
    data[shardId].push(accountData)
  }

  // Ordenar os dados por data dentro de cada shard
  Object.keys(data).forEach((shardId) => {
    data[shardId].sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime())
  })

  return data
}

// Gerar os dados mock uma vez
export const mockHistoricShardData = generateMockData()

// Dados mock específicos para demonstração rápida (mantendo alguns exemplos fixos)
export const mockHistoricShardDataSmall: Record<string, HistoricAccountData[]> = {
  "1": [
    {
      AccountId: 10001,
      IsNotFound: false,
      QueueTime: 15.5,
      DateTime: "2025-01-15T10:00:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 10002,
      IsNotFound: true,
      QueueTime: 45.2,
      DateTime: "2025-01-25T14:10:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 10003,
      IsNotFound: false,
      QueueTime: 8.7,
      DateTime: "2025-02-10T09:20:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 10004,
      IsNotFound: false,
      QueueTime: 32.1,
      DateTime: "2025-03-05T16:30:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 10005,
      IsNotFound: false,
      QueueTime: 12.8,
      DateTime: "2025-04-12T11:40:00.000Z",
      ShardId: 1,
    },
  ],
  "2": [
    {
      AccountId: 20001,
      IsNotFound: false,
      QueueTime: 22.1,
      DateTime: "2025-01-08T12:00:00.000Z",
      ShardId: 2,
    },
    {
      AccountId: 20002,
      IsNotFound: false,
      QueueTime: 18.6,
      DateTime: "2025-02-14T15:20:00.000Z",
      ShardId: 2,
    },
    {
      AccountId: 20003,
      IsNotFound: true,
      QueueTime: 89.3,
      DateTime: "2025-03-20T08:50:00.000Z",
      ShardId: 2,
    },
    {
      AccountId: 20004,
      IsNotFound: false,
      QueueTime: 41.7,
      DateTime: "2025-04-18T13:10:00.000Z",
      ShardId: 2,
    },
  ],
  "3": [
    {
      AccountId: 30001,
      IsNotFound: false,
      QueueTime: 38.5,
      DateTime: "2025-01-12T09:30:00.000Z",
      ShardId: 3,
    },
    {
      AccountId: 30002,
      IsNotFound: false,
      QueueTime: 26.1,
      DateTime: "2025-02-22T14:40:00.000Z",
      ShardId: 3,
    },
    {
      AccountId: 30003,
      IsNotFound: true,
      QueueTime: 72.6,
      DateTime: "2025-03-15T17:20:00.000Z",
      ShardId: 3,
    },
    {
      AccountId: 30004,
      IsNotFound: false,
      QueueTime: 19.8,
      DateTime: "2025-05-08T10:00:00.000Z",
      ShardId: 3,
    },
  ],
}

// Função para debug - mostra estatísticas dos dados gerados
export const getDataStats = (data: Record<string, HistoricAccountData[]>) => {
  const stats = {
    totalRecords: 0,
    shardCounts: {} as Record<string, number>,
    notFoundCount: 0,
    avgQueueTime: 0,
    dateRange: { start: "", end: "" },
  }

  let totalQueueTime = 0
  const allDates: Date[] = []

  Object.keys(data).forEach((shardId) => {
    const shardData = data[shardId]
    stats.shardCounts[shardId] = shardData.length
    stats.totalRecords += shardData.length

    shardData.forEach((record) => {
      if (record.IsNotFound) stats.notFoundCount++
      totalQueueTime += record.QueueTime
      allDates.push(new Date(record.DateTime))
    })
  })

  stats.avgQueueTime = totalQueueTime / stats.totalRecords
  allDates.sort((a, b) => a.getTime() - b.getTime())
  stats.dateRange.start = allDates[0]?.toISOString() || ""
  stats.dateRange.end = allDates[allDates.length - 1]?.toISOString() || ""

  return stats
}

// Log das estatísticas para debug (apenas no navegador)
if (typeof window !== "undefined") {
  console.log("Mock Data Statistics:", getDataStats(mockHistoricShardData))
}
