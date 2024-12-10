import React from 'react';
import { Bar } from "react-chartjs-2";
import { ChartOptions, TooltipItem } from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WebhookItem {
  shard_id: number;
  webhooks_count: number;
  events_count: number;
  changes_reports_count: number;
  changelogs_count: number;
  automations_count: number;
  DateTime: string;
}

interface WebhooksChartProps {
  data: WebhookItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const WebhooksChart: React.FC<WebhooksChartProps> = ({ data, isExpanded, onToggleExpand }) => {
  const chartData = {
    labels: data.map((item) => [
      `Shard ${item.shard_id}`,
      `${item.webhooks_count}`,
    ]),
    datasets: [
      {
        label: "Webhooks Count",
        data: data.map((item) => item.webhooks_count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<"bar">[]) => {
            const index = tooltipItems[0].dataIndex;
            return `Shard ${data[index].shard_id}`;
          },
          label: (tooltipItem: TooltipItem<"bar">) =>
            `Webhooks: ${tooltipItem.raw as number}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          padding: 0,
          autoSkip: false,
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Webhooks por Shard</h2>
        <motion.button
          onClick={onToggleExpand}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? (
            <ChevronUp size={24} />
          ) : (
            <ChevronDown size={24} />
          )}
        </motion.button>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={{
              expanded: { opacity: 1, height: "300px" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <Bar data={chartData} options={options} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebhooksChart;

