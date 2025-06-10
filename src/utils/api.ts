import { getAuthToken } from "./auth"

export async function fetchShardData() {
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

export async function fetchWebhookData() {
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

export async function fetchHistoricalData(startDate: string, endDate: string) {
  const userKey = getAuthToken()
  const response = await fetch(
    `https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/historical?startDate=${startDate}&endDate=${endDate}`,
    {
      headers: {
        "Internal-key": "5907D0acnh7ni7pA",
        Authorization: `Bearer ${userKey}`,
      },
    },
  )
  if (!response.ok) {
    throw new Error("Failed to fetch historical data")
  }
  return response.json()
}

interface HistoricDataPayload {
  ShardId?: number
  AccountId?: number
  from: string
  to: string
}

export async function fetchHistoricWebhooksDetails(payload: HistoricDataPayload) {
  const userKey = getAuthToken()
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/HistWebhooks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Internal-key": "5907D0acnh7ni7pA",
      Authorization: `Bearer ${userKey}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Failed to fetch historic webhooks details")
  }
  return response.json()
}

export async function fetchHistoricAutomations(payload: HistoricDataPayload) {
  const userKey = getAuthToken()
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/HistAutomations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Internal-key": "5907D0acnh7ni7pA",
      Authorization: `Bearer ${userKey}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Failed to fetch historic automations")
  }
  return response.json()
}
