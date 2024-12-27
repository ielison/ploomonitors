import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "../utils/formDate";
import { motion, AnimatePresence } from "framer-motion";

interface WebhookItem {
  shard_id: number;
  webhooks_count: number;
  events_count: number;
  changes_reports_count: number;
  changelogs_count: number;
  automations_count: number;
  DateTime: string;
}

interface WebhookDataProps {
  data: WebhookItem[];
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(
    value
  );
};

export default function WebhookData({ data }: WebhookDataProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filas</h2>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </motion.button>
      </div>
      <AnimatePresence>
        {isExpanded && (
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
                  {[
                    "shard",
                    "webhooks",
                    "events",
                    "changes reports",
                    "changelogs",
                    "automations",
                    "DateTime",
                  ].map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.shard_id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.webhooks_count)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.events_count)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.changes_reports_count)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.changelogs_count)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.automations_count)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.DateTime)}
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
