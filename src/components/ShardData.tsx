"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Database, AlertTriangle, Clock, ChevronDown, ChevronUp } from "lucide-react"

export interface AccountData {
  AccountId: number
  IsNotFound: boolean
  QueueTime: number
  DateTime: string
  ShardId: number
}

interface ShardDataProps {
  data: Record<string, AccountData[]>
}

export default function ShardData({ data }: ShardDataProps) {
  const [selectedShard, setSelectedShard] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const getButtonColor = (rowCount: number) => {
    if (rowCount > 50) return "bg-red-600 hover:bg-red-700"
    if (rowCount > 10) return "bg-orange-500 hover:bg-orange-600"
    return "bg-indigo-600 hover:bg-indigo-700"
  }

  const getStats = () => {
    const allRecords = Object.values(data).flat()
    const notFoundCount = allRecords.filter((record) => record.IsNotFound).length
    const avgQueueTime =
      allRecords.length > 0 ? allRecords.reduce((sum, record) => sum + record.QueueTime, 0) / allRecords.length : 0

    return {
      totalRecords: allRecords.length,
      totalShards: Object.keys(data).length,
      notFoundCount,
      avgQueueTime,
    }
  }

  const stats = getStats()

  // Componente de card de estatística
  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string
    value: string
    icon: React.ReactNode
    color: string
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitor por Shard</h2>
          <p className="text-gray-500 text-sm mt-1">Dados em tempo real dos shards</p>
        </div>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="ml-2">{isExpanded ? "Recolher" : "Expandir"}</span>
        </motion.button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Shards"
          value={stats.totalShards.toString()}
          icon={<Database className="w-5 h-5 text-white" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="Total de Registros"
          value={stats.totalRecords.toString()}
          icon={<Database className="w-5 h-5 text-white" />}
          color="bg-sky-500"
        />
        <StatCard
          title="Not Found"
          value={stats.notFoundCount.toString()}
          icon={<AlertTriangle className="w-5 h-5 text-white" />}
          color="bg-red-500"
        />
        <StatCard
          title="Tempo Médio (min)"
          value={stats.avgQueueTime.toFixed(2)}
          icon={<Clock className="w-5 h-5 text-white" />}
          color="bg-emerald-500"
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              {Object.keys(data).map((shardId) => (
                <motion.button
                  key={shardId}
                  className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                    selectedShard === shardId
                      ? getButtonColor(data[shardId].length)
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedShard((prevShard) => (prevShard === shardId ? null : shardId))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shard {shardId} ({data[shardId].length})
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {selectedShard !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-indigo-800">
                      Shard {selectedShard} - {data[selectedShard].length} registros
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Not Found
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Queue Time (minutes)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data[selectedShard]
                          .sort((a, b) => {
                            if (a.IsNotFound && !b.IsNotFound) return -1
                            if (!a.IsNotFound && b.IsNotFound) return 1
                            return b.QueueTime - a.QueueTime
                          })
                          .map((account, index) => (
                            <motion.tr
                              key={account.AccountId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {account.AccountId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={
                                    account.IsNotFound
                                      ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                      : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  }
                                >
                                  {account.IsNotFound ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {account.QueueTime.toFixed(2)} minutes
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(new Date(account.DateTime).getTime() + 3 * 60 * 60 * 1000)
                                  .toLocaleString("en-GB", {
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
