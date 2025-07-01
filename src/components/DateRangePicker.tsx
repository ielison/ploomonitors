"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Calendar } from "lucide-react"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  minDate?: string
  maxDate?: string
  className?: string
}

type EditingField =
  | "startDay"
  | "startMonth"
  | "startYear"
  | "startHour"
  | "startMinute"
  | "endDay"
  | "endMonth"
  | "endYear"
  | "endHour"
  | "endMinute"
  | null

interface DateParts {
  day: string
  month: string
  year: string
  hour: string
  minute: string
}

// Função para extrair partes da data
const extractDateParts = (dateString: string): DateParts => {
  if (!dateString) return { day: "01", month: "01", year: "2024", hour: "00", minute: "00" }

  const date = new Date(dateString)
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: (date.getMonth() + 1).toString().padStart(2, "0"),
    year: date.getFullYear().toString(),
    hour: date.getHours().toString().padStart(2, "0"),
    minute: date.getMinutes().toString().padStart(2, "0"),
  }
}

// Função para construir data a partir das partes
const buildDateFromParts = (parts: DateParts): string => {
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

// Função para validar valores
const validateValue = (value: string, type: string): boolean => {
  const num = Number.parseInt(value)
  if (isNaN(num)) return false

  switch (type) {
    case "day":
      return num >= 1 && num <= 31
    case "month":
      return num >= 1 && num <= 12
    case "year":
      return num >= 2020 && num <= 2030
    case "hour":
      return num >= 0 && num <= 23
    case "minute":
      return num >= 0 && num <= 59
    default:
      return false
  }
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  className = "",
}: DateRangePickerProps) {
  const [startParts, setStartParts] = useState<DateParts>(extractDateParts(startDate))
  const [endParts, setEndParts] = useState<DateParts>(extractDateParts(endDate))
  const [editing, setEditing] = useState<EditingField>(null)
  const [tempValue, setTempValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Atualizar partes quando as datas mudarem externamente
  useEffect(() => {
    setStartParts(extractDateParts(startDate))
  }, [startDate])

  useEffect(() => {
    setEndParts(extractDateParts(endDate))
  }, [endDate])

  // Focar no input quando começar a editar
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handlePartClick = (field: EditingField, currentValue: string) => {
    setEditing(field)
    setTempValue(currentValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Só números
    setTempValue(value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      commitValue()
    } else if (e.key === "Escape") {
      setEditing(null)
      setTempValue("")
    }
  }

  const handleInputBlur = () => {
    commitValue()
  }

  const commitValue = () => {
    if (!editing || !tempValue) {
      setEditing(null)
      return
    }

    const fieldType = editing.replace(/^(start|end)/, "").toLowerCase()
    const isStart = editing.startsWith("start")

    // Validar valor
    if (!validateValue(tempValue, fieldType)) {
      setEditing(null)
      setTempValue("")
      return
    }

    const paddedValue = tempValue.padStart(2, "0")
    const currentParts = isStart ? { ...startParts } : { ...endParts }

    // Atualizar a parte específica
    switch (fieldType) {
      case "day":
        currentParts.day = paddedValue
        break
      case "month":
        currentParts.month = paddedValue
        break
      case "year":
        currentParts.year = tempValue.padStart(4, "0")
        break
      case "hour":
        currentParts.hour = paddedValue
        break
      case "minute":
        currentParts.minute = paddedValue
        break
    }

    // Construir nova data
    const newDate = buildDateFromParts(currentParts)

    // Validar se a data é válida
    const dateObj = new Date(newDate)
    if (isNaN(dateObj.getTime())) {
      setEditing(null)
      setTempValue("")
      return
    }

    // Validar limites min/max
    if (minDate && dateObj < new Date(minDate)) {
      setEditing(null)
      setTempValue("")
      return
    }
    if (maxDate && dateObj > new Date(maxDate)) {
      setEditing(null)
      setTempValue("")
      return
    }

    // Atualizar estado
    if (isStart) {
      setStartParts(currentParts)
      onStartDateChange(newDate)
    } else {
      setEndParts(currentParts)
      onEndDateChange(newDate)
    }

    setEditing(null)
    setTempValue("")
  }

  const renderEditablePart = (value: string, field: EditingField, maxLength = 2) => {
    const isEditing = editing === field

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={tempValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          maxLength={maxLength}
          className="inline-block w-auto min-w-[20px] bg-transparent border-none outline-none text-center p-0 m-0"
          style={{ width: `${Math.max(tempValue.length, 1)}ch` }}
        />
      )
    }

    return (
      <span
        onClick={() => handlePartClick(field, value)}
        className="cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 px-1 rounded transition-colors"
      >
        {value}
      </span>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 focus-within:border-transparent transition-colors cursor-text">
          {/* Data de início */}
          {renderEditablePart(startParts.day, "startDay")}/{renderEditablePart(startParts.month, "startMonth")}/
          {renderEditablePart(startParts.year, "startYear", 4)}, {renderEditablePart(startParts.hour, "startHour")}:
          {renderEditablePart(startParts.minute, "startMinute")}
          <span className="mx-2">-</span>
          {/* Data de fim */}
          {renderEditablePart(endParts.day, "endDay")}/{renderEditablePart(endParts.month, "endMonth")}/
          {renderEditablePart(endParts.year, "endYear", 4)}, {renderEditablePart(endParts.hour, "endHour")}:
          {renderEditablePart(endParts.minute, "endMinute")}
        </div>

        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
