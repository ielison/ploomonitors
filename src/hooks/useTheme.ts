"use client"

import { useState, useEffect } from "react"

type Theme = "light" | "dark"

export function useTheme() {
  // Estado para armazenar o tema atual (claro ou escuro)
  const [theme, setTheme] = useState<Theme>("light")

  // Efeito para carregar o tema salvo no localStorage ou detectar a preferência do sistema
  useEffect(() => {
    // Verificar se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null

    // Se houver um tema salvo, usá-lo
    if (savedTheme) {
      setTheme(savedTheme)
      // Aplica ou remove a classe 'dark' no elemento <html>
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
    // Caso contrário, verificar a preferência de esquema de cores do sistema operacional
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, []) // O array vazio garante que este efeito seja executado apenas uma vez, na montagem do componente

  // Função para alternar o tema entre claro e escuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Salvar a nova preferência de tema no localStorage
    localStorage.setItem("theme", newTheme)

    // Aplicar ou remover a classe 'dark' no elemento html para refletir o tema
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Retorna o tema atual e a função para alterná-lo
  return { theme, toggleTheme }
}
