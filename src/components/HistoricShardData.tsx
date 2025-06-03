"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, X } from "lucide-react";

export interface HistoricAccountData {
  AccountId: number;
  IsNotFound: boolean;
  QueueTime: number;
  DateTime: string;
  ShardId: number;
}

interface HistoricShardDataProps {
  data: Record<string, HistoricAccountData[]>;
}

export default function HistoricShardData({ data }: HistoricShardDataProps) {
  const [selectedShard, setSelectedShard] = useState<string | null>(null);
  const [filteredData, setFilteredData] =
    useState<Record<string, HistoricAccountData[]>>(data);

  // Função para obter data/hora no horário de Brasília (GMT-3)
  const getBrasiliaDate = (offsetHours = 0) => {
    const now = new Date();
    // Converter para horário de Brasília (GMT-3)
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    // Adicionar offset se necessário
    brasiliaTime.setHours(brasiliaTime.getHours() + offsetHours);
    return brasiliaTime.toISOString().slice(0, 16);
  };

  // Inicializar com a última hora por padrão (horário de Brasília)
  const getDefaultStartDate = () => {
    return getBrasiliaDate(-1); // 1 hora atrás
  };

  const getDefaultEndDate = () => {
    return getBrasiliaDate(0); // hora atual
  };

  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate());
  const [showFilters, setShowFilters] = useState(false);

  // Calcular data mínima (6 meses atrás no horário de Brasília)
  const getMinDate = () => {
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    brasiliaTime.setMonth(brasiliaTime.getMonth() - 6);
    return brasiliaTime.toISOString().slice(0, 16);
  };

  // Calcular data máxima (agora no horário de Brasília)
  const getMaxDate = () => {
    return getBrasiliaDate(0);
  };

  // Formatar data para exibição (já considerando horário de Brasília)
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}, ${hours}:${minutes}:${seconds}`;
  };

  // Filtrar dados baseado no intervalo de data
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredData(data);
      return;
    }

    // Converter as datas do input para UTC para comparação
    const start = new Date(startDate + ":00.000Z"); // Adiciona segundos e timezone UTC
    const end = new Date(endDate + ":00.000Z");

    const filtered: Record<string, HistoricAccountData[]> = {};

    Object.keys(data).forEach((shardId) => {
      const shardData = data[shardId].filter((account) => {
        const accountDate = new Date(account.DateTime);
        return accountDate >= start && accountDate <= end;
      });

      if (shardData.length > 0) {
        filtered[shardId] = shardData;
      }
    });

    setFilteredData(filtered);
  }, [startDate, endDate, data]);

  // Limpar filtros (volta para a última hora no horário de Brasília)
  const clearFilters = () => {
    const newStartDate = getDefaultStartDate();
    const newEndDate = getDefaultEndDate();
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Função para definir filtros rápidos (considerando horário de Brasília)
  const setQuickFilter = (hours: number) => {
    const endTime = getBrasiliaDate(0); // hora atual de Brasília
    const startTime = getBrasiliaDate(-hours); // X horas atrás de Brasília
    setStartDate(startTime);
    setEndDate(endTime);
  };

  const getButtonColor = (rowCount: number) => {
    if (rowCount > 50) return "bg-red-700";
    if (rowCount > 10) return "bg-orange-500";
    return "bg-blue-700";
  };

  const getFilteredShardCount = () => {
    return Object.keys(filteredData).length;
  };

  const getTotalRecords = () => {
    return Object.values(filteredData).reduce(
      (total, shardData) => total + shardData.length,
      0
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Histórico de Shard Data</h2>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 border"
          >
            {/* Filtros rápidos */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros Rápidos
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setQuickFilter(1)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Última hora
                </button>
                <button
                  onClick={() => setQuickFilter(6)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Últimas 6h
                </button>
                <button
                  onClick={() => setQuickFilter(24)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => setQuickFilter(168)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Última semana
                </button>
                <button
                  onClick={() => setQuickFilter(720)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Últimos 30 dias
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Inicial (Brasília)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {startDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(startDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data/Hora Final (Brasília)
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateForDisplay(endDate)}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <motion.button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Resetar
                </motion.button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                Shards encontrados: <strong>{getFilteredShardCount()}</strong>
              </span>
              <span>
                Total de registros: <strong>{getTotalRecords()}</strong>
              </span>
              <span className="text-blue-600">
                Período: {formatDateForDisplay(startDate)} até{" "}
                {formatDateForDisplay(endDate)} (Brasília)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(filteredData).map((shardId) => (
          <motion.button
            key={shardId}
            className={`px-3 py-1 rounded ${
              selectedShard === shardId
                ? `${getButtonColor(filteredData[shardId].length)} text-white`
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() =>
              setSelectedShard((prevShard) =>
                prevShard === shardId ? null : shardId
              )
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shard {shardId} ({filteredData[shardId].length})
          </motion.button>
        ))}
      </div>

      {Object.keys(filteredData).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Nenhum dado encontrado</p>
          <p className="text-sm">
            Tente ajustar o filtro de data ou usar os filtros rápidos
          </p>
        </div>
      )}

      <AnimatePresence>
        {selectedShard !== null && filteredData[selectedShard] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto"
          >
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">
                Shard {selectedShard} - {filteredData[selectedShard].length}{" "}
                registros
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                Período: {formatDateForDisplay(startDate)} até{" "}
                {formatDateForDisplay(endDate)}
              </p>
            </div>

            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Account ID
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Not Found
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Queue Time (minutes)
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Date Time (Brasília)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredData[selectedShard]
                  .sort((a, b) => {
                    // Primeiro critério: Not Found = Yes no topo
                    if (a.IsNotFound && !b.IsNotFound) return -1;
                    if (!a.IsNotFound && b.IsNotFound) return 1;

                    // Segundo critério: Queue Time do maior para o menor
                    return b.QueueTime - a.QueueTime;
                  })
                  .map((account, index) => (
                    <motion.tr
                      key={`${account.AccountId}-${account.DateTime}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900 text-center">
                        {account.AccountId}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-base text-center">
                        <span
                          className={
                            account.IsNotFound
                              ? "font-semibold text-red-500"
                              : "text-gray-900"
                          }
                        >
                          {account.IsNotFound ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900 text-center">
                        {account.QueueTime.toFixed(2)} minutes
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900 text-center">
                        {new Date(
                          new Date(account.DateTime).getTime() -
                            3 * 60 * 60 * 1000
                        )
                          .toLocaleString("pt-BR", {
                            year: "2-digit",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(",", " -")}
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
