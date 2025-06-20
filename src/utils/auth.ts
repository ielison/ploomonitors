// Chave para armazenar o token de autenticação no localStorage
const TOKEN_KEY = "userKey"
// Chave para armazenar a data de expiração do token no localStorage
const EXPIRATION_KEY = "tokenExpiration"

/**
 * Define o token de autenticação e sua data de expiração no localStorage.
 * O token é válido por 7 dias a partir da data de definição.
 * @param token O token de autenticação a ser armazenado.
 */
export const setAuthToken = (token: string) => {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 7) // Token válido por 7 dias
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRATION_KEY, expirationDate.toISOString())
}

/**
 * Retorna o token de autenticação armazenado no localStorage.
 * @returns O token de autenticação ou null se não estiver presente.
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove o token de autenticação e sua data de expiração do localStorage.
 */
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRATION_KEY)
}

/**
 * Verifica se o usuário está autenticado e se o token não expirou.
 * @returns true se o token for válido e não expirado, false caso contrário.
 */
export const isAuthenticated = () => {
  const token = getAuthToken()
  const expiration = localStorage.getItem(EXPIRATION_KEY)
  if (!token || !expiration) return false

  const expirationDate = new Date(expiration)
  return expirationDate > new Date()
}
