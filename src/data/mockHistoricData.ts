import type { HistoricAccountData } from "../components/HistoricShardData"

// Dados mock específicos para demonstração - Janeiro a Junho 2025, 12 shards
export const mockHistoricShardData: Record<string, HistoricAccountData[]> = {
  "1": [
    {
      AccountId: 1001,
      IsNotFound: false,
      QueueTime: 15.5,
      DateTime: "2025-01-15T10:00:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 1002,
      IsNotFound: true,
      QueueTime: 45.2,
      DateTime: "2025-01-25T14:10:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 1003,
      IsNotFound: false,
      QueueTime: 8.7,
      DateTime: "2025-02-10T09:20:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 1004,
      IsNotFound: false,
      QueueTime: 32.1,
      DateTime: "2025-03-05T16:30:00.000Z",
      ShardId: 1,
    },
    {
      AccountId: 1005,
      IsNotFound: false,
      QueueTime: 12.8,
      DateTime: "2025-04-12T11:40:00.000Z",
      ShardId: 1,
    },
  ],
  "2": [
    {
      AccountId: 2001,
      IsNotFound: false,
      QueueTime: 22.1,
      DateTime: "2025-01-08T12:00:00.000Z",
      ShardId: 2,
    },
    {
      AccountId: 2002,
      IsNotFound: false,
      QueueTime: 18.6,
      DateTime: "2025-02-14T15:20:00.000Z",
      ShardId: 2,
    },
    {
      AccountId: 2003,
      IsNotFound: true,
      QueueTime: 89.3,
      DateTime: "2025-03-20T08:50:00.000Z",
      ShardId: 2,
    },
    {
      AccountId: 2004,
      IsNotFound: false,
      QueueTime: 41.7,
      DateTime: "2025-04-18T13:10:00.000Z",
      ShardId: 2,
    },
  ],
  "3": [
    {
      AccountId: 3001,
      IsNotFound: false,
      QueueTime: 38.5,
      DateTime: "2025-01-12T09:30:00.000Z",
      ShardId: 3,
    },
    {
      AccountId: 3002,
      IsNotFound: false,
      QueueTime: 26.1,
      DateTime: "2025-02-22T14:40:00.000Z",
      ShardId: 3,
    },
    {
      AccountId: 3003,
      IsNotFound: true,
      QueueTime: 72.6,
      DateTime: "2025-03-15T17:20:00.000Z",
      ShardId: 3,
    },
    {
      AccountId: 3004,
      IsNotFound: false,
      QueueTime: 19.8,
      DateTime: "2025-05-08T10:00:00.000Z",
      ShardId: 3,
    },
  ],
  "4": [
    {
      AccountId: 4001,
      IsNotFound: false,
      QueueTime: 16.4,
      DateTime: "2025-01-20T11:20:00.000Z",
      ShardId: 4,
    },
    {
      AccountId: 4002,
      IsNotFound: true,
      QueueTime: 63.9,
      DateTime: "2025-02-28T16:50:00.000Z",
      ShardId: 4,
    },
    {
      AccountId: 4003,
      IsNotFound: false,
      QueueTime: 35.7,
      DateTime: "2025-04-05T12:10:00.000Z",
      ShardId: 4,
    },
    {
      AccountId: 4004,
      IsNotFound: false,
      QueueTime: 52.1,
      DateTime: "2025-05-15T09:30:00.000Z",
      ShardId: 4,
    },
  ],
  "5": [
    {
      AccountId: 5001,
      IsNotFound: false,
      QueueTime: 31.3,
      DateTime: "2025-01-30T10:00:00.000Z",
      ShardId: 5,
    },
    {
      AccountId: 5002,
      IsNotFound: false,
      QueueTime: 48.7,
      DateTime: "2025-03-10T12:20:00.000Z",
      ShardId: 5,
    },
    {
      AccountId: 5003,
      IsNotFound: true,
      QueueTime: 85.2,
      DateTime: "2025-04-25T15:40:00.000Z",
      ShardId: 5,
    },
    {
      AccountId: 5004,
      IsNotFound: false,
      QueueTime: 24.9,
      DateTime: "2025-06-02T11:10:00.000Z",
      ShardId: 5,
    },
  ],
  "6": [
    {
      AccountId: 6001,
      IsNotFound: false,
      QueueTime: 29.7,
      DateTime: "2025-01-18T13:40:00.000Z",
      ShardId: 6,
    },
    {
      AccountId: 6002,
      IsNotFound: true,
      QueueTime: 67.4,
      DateTime: "2025-02-08T17:20:00.000Z",
      ShardId: 6,
    },
    {
      AccountId: 6003,
      IsNotFound: false,
      QueueTime: 14.2,
      DateTime: "2025-03-25T08:00:00.000Z",
      ShardId: 6,
    },
    {
      AccountId: 6004,
      IsNotFound: false,
      QueueTime: 43.8,
      DateTime: "2025-05-20T14:50:00.000Z",
      ShardId: 6,
    },
  ],
  "7": [
    {
      AccountId: 7001,
      IsNotFound: false,
      QueueTime: 37.1,
      DateTime: "2025-01-05T15:10:00.000Z",
      ShardId: 7,
    },
    {
      AccountId: 7002,
      IsNotFound: false,
      QueueTime: 21.6,
      DateTime: "2025-02-18T10:30:00.000Z",
      ShardId: 7,
    },
    {
      AccountId: 7003,
      IsNotFound: true,
      QueueTime: 78.9,
      DateTime: "2025-04-08T16:40:00.000Z",
      ShardId: 7,
    },
    {
      AccountId: 7004,
      IsNotFound: false,
      QueueTime: 33.5,
      DateTime: "2025-06-10T12:20:00.000Z",
      ShardId: 7,
    },
  ],
  "8": [
    {
      AccountId: 8001,
      IsNotFound: false,
      QueueTime: 25.3,
      DateTime: "2025-01-22T09:50:00.000Z",
      ShardId: 8,
    },
    {
      AccountId: 8002,
      IsNotFound: true,
      QueueTime: 91.7,
      DateTime: "2025-03-02T14:10:00.000Z",
      ShardId: 8,
    },
    {
      AccountId: 8003,
      IsNotFound: false,
      QueueTime: 17.4,
      DateTime: "2025-04-15T11:30:00.000Z",
      ShardId: 8,
    },
    {
      AccountId: 8004,
      IsNotFound: false,
      QueueTime: 56.2,
      DateTime: "2025-05-28T17:00:00.000Z",
      ShardId: 8,
    },
  ],
  "9": [
    {
      AccountId: 9001,
      IsNotFound: false,
      QueueTime: 42.8,
      DateTime: "2025-01-28T11:20:00.000Z",
      ShardId: 9,
    },
    {
      AccountId: 9002,
      IsNotFound: false,
      QueueTime: 13.9,
      DateTime: "2025-02-25T16:40:00.000Z",
      ShardId: 9,
    },
    {
      AccountId: 9003,
      IsNotFound: true,
      QueueTime: 69.1,
      DateTime: "2025-03-30T13:50:00.000Z",
      ShardId: 9,
    },
    {
      AccountId: 9004,
      IsNotFound: false,
      QueueTime: 28.7,
      DateTime: "2025-06-05T10:10:00.000Z",
      ShardId: 9,
    },
  ],
  "10": [
    {
      AccountId: 10001,
      IsNotFound: false,
      QueueTime: 34.6,
      DateTime: "2025-01-10T14:30:00.000Z",
      ShardId: 10,
    },
    {
      AccountId: 10002,
      IsNotFound: true,
      QueueTime: 82.3,
      DateTime: "2025-02-12T09:20:00.000Z",
      ShardId: 10,
    },
    {
      AccountId: 10003,
      IsNotFound: false,
      QueueTime: 19.5,
      DateTime: "2025-04-20T15:40:00.000Z",
      ShardId: 10,
    },
    {
      AccountId: 10004,
      IsNotFound: false,
      QueueTime: 47.2,
      DateTime: "2025-06-15T12:00:00.000Z",
      ShardId: 10,
    },
  ],
  "11": [
    {
      AccountId: 11001,
      IsNotFound: false,
      QueueTime: 26.4,
      DateTime: "2025-01-16T16:10:00.000Z",
      ShardId: 11,
    },
    {
      AccountId: 11002,
      IsNotFound: false,
      QueueTime: 39.8,
      DateTime: "2025-03-08T11:50:00.000Z",
      ShardId: 11,
    },
    {
      AccountId: 11003,
      IsNotFound: true,
      QueueTime: 74.5,
      DateTime: "2025-04-30T14:20:00.000Z",
      ShardId: 11,
    },
    {
      AccountId: 11004,
      IsNotFound: false,
      QueueTime: 15.7,
      DateTime: "2025-06-08T09:40:00.000Z",
      ShardId: 11,
    },
  ],
  "12": [
    {
      AccountId: 12001,
      IsNotFound: false,
      QueueTime: 51.2,
      DateTime: "2025-01-25T12:30:00.000Z",
      ShardId: 12,
    },
    {
      AccountId: 12002,
      IsNotFound: true,
      QueueTime: 88.6,
      DateTime: "2025-02-20T17:10:00.000Z",
      ShardId: 12,
    },
    {
      AccountId: 12003,
      IsNotFound: false,
      QueueTime: 22.9,
      DateTime: "2025-03-18T10:50:00.000Z",
      ShardId: 12,
    },
    {
      AccountId: 12004,
      IsNotFound: false,
      QueueTime: 36.1,
      DateTime: "2025-05-25T13:30:00.000Z",
      ShardId: 12,
    },
    {
      AccountId: 12005,
      IsNotFound: false,
      QueueTime: 18.3,
      DateTime: "2025-06-20T15:20:00.000Z",
      ShardId: 12,
    },
  ],
}

// Função para gerar dados dinâmicos (opcional)
export const generateDynamicMockData = (): Record<string, HistoricAccountData[]> => {
  const data: Record<string, HistoricAccountData[]> = {}
  const shardIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] // 12 shards

  // Data de início: Janeiro 2025
  const startDate = new Date("2025-01-01T00:00:00.000Z")

  // Data de fim: Junho 2025
  const endDate = new Date("2025-06-30T23:59:59.999Z")

  // Gerar 50 registros distribuídos entre janeiro e junho de 2025
  for (let i = 0; i < 50; i++) {
    // Calcular data aleatória entre janeiro e junho de 2025
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    const randomDate = new Date(randomTime)

    // Arredondar para intervalos de 10 minutos
    const minutes = Math.floor(randomDate.getMinutes() / 10) * 10
    randomDate.setMinutes(minutes, 0, 0)

    // Selecionar shard aleatório
    const shardId = shardIds[Math.floor(Math.random() * shardIds.length)]

    // Gerar dados do account
    const accountData: HistoricAccountData = {
      AccountId: Number.parseInt(shardId) * 1000 + i + Math.floor(Math.random() * 100), // IDs únicos por shard
      IsNotFound: Math.random() < 0.15, // 15% de chance de ser NotFound
      QueueTime: Math.random() * 120, // Tempo de fila entre 0-120 minutos
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
