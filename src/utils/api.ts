import { getAuthToken } from "./auth"

interface HistoricDataPayload {
  ShardId?: number
  AccountId?: number
  from: string
  to: string
}

// Tipos para as respostas da API
interface WebhookItem {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
}

interface HistoricWebhookDetailItem {
  AccountId: number
  WebhookId: number
  Quantity: number
  ShardId: number
  DateTime: string
}

interface HistoricAutomationItem {
  AccountId: number
  AutomationId: number
  Quantity: number
  ShardId: number
  DateTime: string
}

interface HistoricWebhookData {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
}

// Tipo para dados de shard (pode ter estrutura similar aos webhooks)
interface ShardData {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
  [key: string]: unknown // Para propriedades adicionais que possam existir
}

export async function fetchShardData(): Promise<ShardData[]> {
  const userKey = getAuthToken()
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/relatorios/cache", {
    headers: {
      "Internal-key": "5907D0acnh7ni7pA",
      Authorization: `Bearer ${userKey}`,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to fetch shard data")
  }
  return response.json()
}

export async function fetchWebhookData(): Promise<WebhookItem[]> {
  const userKey = getAuthToken()
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/centralapi/cache", {
    headers: {
      "Internal-key": "5907D0acnh7ni7pA",
      Authorization: `Bearer ${userKey}`,
    },
  })
  if (!response.ok) {
    throw new Error("Failed to fetch webhook data")
  }
  return response.json()
}

export async function fetchHistoricWebhooksDetails(payload: HistoricDataPayload): Promise<HistoricWebhookDetailItem[]> {
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/HistWebhooks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Failed to fetch historic webhooks details")
  }
  return response.json()
}

export async function fetchHistoricAutomations(payload: HistoricDataPayload): Promise<HistoricAutomationItem[]> {
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/HistAutomations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Failed to fetch historic automations")
  }
  return response.json()
}

export async function fetchHistoricCentral(payload: { ShardId: number; from: string; to: string }): Promise<
  HistoricWebhookData[]
> {
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/HistCentral", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Failed to fetch historic central data")
  }
  return response.json()
}
