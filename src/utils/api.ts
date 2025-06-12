import { getAuthToken } from "./auth"

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

export async function fetchHistoricCentral(payload: { ShardId: number; from: string; to: string }) {
  const userKey = getAuthToken()
  const response = await fetch("https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/HistCentral", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Internal-key": "5907D0acnh7ni7pA",
      Authorization: `Bearer ${userKey}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Failed to fetch historic central data")
  }
  return response.json()
}
