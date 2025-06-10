"use client"

import { useState, useEffect } from "react"

type Theme = "light" | "dark"

export function useTheme() {
  // Estado para armazenar o tema atual
  const [theme, setTheme] = useState<Theme>("light")

  // Efeito para carregar o tema salvo ou detectar a preferência do sistema
  useEffect(() => {
    // Verificar se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null

    // Se houver um tema salvo, usá-lo
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
    // Caso contrário, verificar a preferência do sistema
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  // Função para alternar o tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Salvar a preferência no localStorage
    localStorage.setItem("theme", newTheme)

    // Aplicar a classe dark ao elemento html
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return { theme, toggleTheme }
}
