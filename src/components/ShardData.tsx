"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

  const getButtonColor = (rowCount: number) => {
    if (rowCount > 50) return "bg-red-700"
    if (rowCount > 10) return "bg-orange-500"
    return "bg-blue-700"
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(data).map((shardId) => (
          <motion.button
            key={shardId}
            className={`px-3 py-1 rounded ${
              selectedShard === shardId
                ? `${getButtonColor(data[shardId].length)} text-white`
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setSelectedShard((prevShard) => (prevShard === shardId ? null : shardId))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shard {shardId}
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
            className="overflow-x-auto"
          >
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
                    Date Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {data[selectedShard]
                  .sort((a, b) => {
                    // Primeiro critério: Not Found = Yes no topo
                    if (a.IsNotFound && !b.IsNotFound) return -1
                    if (!a.IsNotFound && b.IsNotFound) return 1

                    // Segundo critério: Queue Time do maior para o menor
                    return b.QueueTime - a.QueueTime
                  })
                  .map((account, index) => (
                    <motion.tr
                      key={account.AccountId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900 text-center">
                        {account.AccountId}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-base text-center">
                        <span className={account.IsNotFound ? "font-semibold text-red-500" : "  text-gray-900"}>
                          {account.IsNotFound ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900 text-center">
                        {account.QueueTime.toFixed(2)} minutes
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-base text-gray-900 text-center">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
