import { getAuthToken } from './auth';

export async function fetchShardData() {
  const userKey = getAuthToken();
  const response = await fetch('https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/relatorios/cache', {
    headers: {
      'Internal-key': '5907D0acnh7ni7pA',
      'Authorization': `Bearer ${userKey}`
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch shard data')
  }
  return response.json()
}

export async function fetchWebhookData() {
  const userKey = getAuthToken();
  const response = await fetch('https://ploomes-n8n-2b33fce99793.herokuapp.com/webhook/centralapi/cache', {
    headers: {
      'Internal-key': '5907D0acnh7ni7pA',
      'Authorization': `Bearer ${userKey}`
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch webhook data')
  }
  return response.json()
}

