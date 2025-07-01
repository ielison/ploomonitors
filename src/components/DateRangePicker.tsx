"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

// Função para formatar data para exibição em português
const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

// Função para converter data de exibição para formato datetime-local
const convertDisplayToDatetime = (displayString: string): string => {
  if (!displayString) return "";

  // Formato esperado: "dd/mm/yyyy, hh:mm"
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})$/;
  const match = displayString.match(regex);

  if (!match) return "";

  const [, day, month, year, hours, minutes] = match;
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Função para aplicar máscara de data
const applyDateMask = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");

  // Aplica a máscara progressivamente
  let masked = "";

  if (numbers.length > 0) {
    // DD
    masked = numbers.substring(0, 2);
  }
  if (numbers.length > 2) {
    // DD/MM
    masked += "/" + numbers.substring(2, 4);
  }
  if (numbers.length > 4) {
    // DD/MM/YYYY
    masked += "/" + numbers.substring(4, 8);
  }
  if (numbers.length > 8) {
    // DD/MM/YYYY, HH
    masked += ", " + numbers.substring(8, 10);
  }
  if (numbers.length > 10) {
    // DD/MM/YYYY, HH:MM
    masked += ":" + numbers.substring(10, 12);
  }
  if (numbers.length > 12) {
    // DD/MM/YYYY, HH:MM - DD
    masked += " - " + numbers.substring(12, 14);
  }
  if (numbers.length > 14) {
    // DD/MM/YYYY, HH:MM - DD/MM
    masked += "/" + numbers.substring(14, 16);
  }
  if (numbers.length > 16) {
    // DD/MM/YYYY, HH:MM - DD/MM/YYYY
    masked += "/" + numbers.substring(16, 20);
  }
  if (numbers.length > 20) {
    // DD/MM/YYYY, HH:MM - DD/MM/YYYY, HH
    masked += ", " + numbers.substring(20, 22);
  }
  if (numbers.length > 22) {
    // DD/MM/YYYY, HH:MM - DD/MM/YYYY, HH:MM
    masked += ":" + numbers.substring(22, 24);
  }

  return masked;
};

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
  className = "",
}: DateRangePickerProps) {
  const [inputValue, setInputValue] = useState("");

  // Atualizar valor de exibição quando as datas mudarem
  useEffect(() => {
    if (startDate && endDate) {
      const startFormatted = formatDateForDisplay(startDate);
      const endFormatted = formatDateForDisplay(endDate);
      setInputValue(`${startFormatted} - ${endFormatted}`);
    } else {
      setInputValue("");
    }
  }, [startDate, endDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Aplicar máscara
    const maskedValue = applyDateMask(rawValue);
    setInputValue(maskedValue);

    // Tentar parsear o valor se estiver completo
    // Formato esperado: "dd/mm/yyyy, hh:mm - dd/mm/yyyy, hh:mm"
    const rangeRegex =
      /^(\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2})$/;
    const rangeMatch = maskedValue.match(rangeRegex);

    if (rangeMatch) {
      const [, startStr, endStr] = rangeMatch;
      const startDatetime = convertDisplayToDatetime(startStr.trim());
      const endDatetime = convertDisplayToDatetime(endStr.trim());

      if (startDatetime && endDatetime) {
        // Validar se as datas estão dentro dos limites
        const startDateObj = new Date(startDatetime);
        const endDateObj = new Date(endDatetime);
        const minDateObj = minDate ? new Date(minDate) : null;
        const maxDateObj = maxDate ? new Date(maxDate) : null;

        let isValid = true;

        if (minDateObj && startDateObj < minDateObj) isValid = false;
        if (maxDateObj && endDateObj > maxDateObj) isValid = false;
        if (startDateObj >= endDateObj) isValid = false;

        if (isValid) {
          onStartDateChange(startDatetime);
          onEndDateChange(endDatetime);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Permitir apenas números, backspace, delete, tab, escape, enter e teclas de navegação
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    const isNumber = /^[0-9]$/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    const isCtrlA = e.ctrlKey && e.key === "a";
    const isCtrlC = e.ctrlKey && e.key === "c";
    const isCtrlV = e.ctrlKey && e.key === "v";
    const isCtrlX = e.ctrlKey && e.key === "x";
    const isCtrlZ = e.ctrlKey && e.key === "z";

    if (
      !isNumber &&
      !isAllowedKey &&
      !isCtrlA &&
      !isCtrlC &&
      !isCtrlV &&
      !isCtrlX &&
      !isCtrlZ
    ) {
      e.preventDefault();
    }

    if (e.key === "Enter") {
      e.preventDefault();
      // Forçar uma nova tentativa de parsing
      handleInputChange({
        target: { value: inputValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    // Aplicar máscara ao texto colado
    const maskedText = applyDateMask(pastedText);

    // Simular mudança de input
    handleInputChange({
      target: { value: maskedText },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="dd/mm/aaaa, hh:mm - dd/mm/aaaa, hh:mm"
          maxLength={29} // Tamanho máximo do formato completo
          className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
