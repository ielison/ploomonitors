"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Database, Activity, FileText, Edit, Zap } from "lucide-react"
import { formatDate } from "../utils/formDate"
import { motion, AnimatePresence } from "framer-motion"

interface WebhookItem {
  shard_id: number
  webhooks_count: number
  events_count: number
  changes_reports_count: number
  changelogs_count: number
  automations_count: number
  DateTime: string
}

interface WebhookDataProps {
  data: WebhookItem[]
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
}

export default function WebhookData({ data }: WebhookDataProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getStats = () => {
    const totalWebhooks = data.reduce((sum, item) => sum + item.webhooks_count, 0)
    const totalEvents = data.reduce((sum, item) => sum + item.events_count, 0)
    const totalChanges = data.reduce((sum, item) => sum + item.changes_reports_count, 0)
    const totalChangelogs = data.reduce((sum, item) => sum + item.changelogs_count, 0)
    const totalAutomations = data.reduce((sum, item) => sum + item.automations_count, 0)

    return {
      totalWebhooks,
      totalEvents,
      totalChanges,
      totalChangelogs,
      totalAutomations,
      totalShards: data.length,
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
          <h2 className="text-2xl font-bold text-gray-900">Filas</h2>
          <p className="text-gray-500 text-sm mt-1">Dados em tempo real das filas de processamento</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Shards"
          value={stats.totalShards.toString()}
          icon={<Database className="w-5 h-5 text-white" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="Webhooks"
          value={formatNumber(stats.totalWebhooks)}
          icon={
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          }
          color="bg-sky-500"
        />
        <StatCard
          title="Events"
          value={formatNumber(stats.totalEvents)}
          icon={<Activity className="w-5 h-5 text-white" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Changes Reports"
          value={formatNumber(stats.totalChanges)}
          icon={<FileText className="w-5 h-5 text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Changelogs"
          value={formatNumber(stats.totalChangelogs)}
          icon={<Edit className="w-5 h-5 text-white" />}
          color="bg-violet-500"
        />
        <StatCard
          title="Automations"
          value={formatNumber(stats.totalAutomations)}
          icon={<Zap className="w-5 h-5 text-white" />}
          color="bg-red-500"
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["shard", "webhooks", "events", "changes reports", "changelogs", "automations", "DateTime"].map(
                      (key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.shard_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(item.webhooks_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(item.events_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(item.changes_reports_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(item.changelogs_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(item.automations_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.DateTime)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
