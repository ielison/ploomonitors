import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ShardData, { AccountData } from "./components/ShardData";
import WebhookData from "./components/WebHookData";
import WebhooksChart from './components/WebHookChart';
import { fetchShardData, fetchWebhookData } from "./utils/api";
import { RefreshCw } from 'lucide-react';
import { motion } from "framer-motion";

interface WebhookItem {
  shard_id: number;
  webhooks_count: number;
  events_count: number;
  changes_reports_count: number;
  changelogs_count: number;
  automations_count: number;
  DateTime: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [shardData, setShardData] = useState<Record<string, AccountData[]> | null>(null);
  const [webhookData, setWebhookData] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWebhooksCountExpanded, setIsWebhooksCountExpanded] = useState(true);

  const updateData = async () => {
    try {
      setLoading(true);
      const [shardResult, webhookResult] = await Promise.all([
        fetchShardData(),
        fetchWebhookData(),
      ]);
      setShardData(shardResult.response as Record<string, AccountData[]>);
      setWebhookData(webhookResult.response);
      setError(null);
    } catch (err: unknown) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Monitor por Shard
          </h1>
          <motion.button
            onClick={updateData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5 " />
          </motion.button>
        </div>

        {loading && <p className="text-center py-4">Loading...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <WebhooksChart 
              data={webhookData}
              isExpanded={isWebhooksCountExpanded}
              onToggleExpand={() => setIsWebhooksCountExpanded(!isWebhooksCountExpanded)}
            />

            <div className="bg-white rounded-lg shadow p-6">
              <WebhookData data={webhookData} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Shard Data</h2>
              {shardData && <ShardData data={shardData} />}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

