import React, { useState } from "react";
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
  title: string;
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
};

const getBarColor = (count: number): string => {
  if (count > 50000) return 'rgb(185, 28, 28)';
  if (count > 10000) return 'rgb(249, 115, 22)';
  return 'rgb(29, 78, 216)';
};

const WebhooksChart: React.FC<WebhooksChartProps> = ({ data, title }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const chartData = {
    labels: data.map((item) => [
      `Shard ${item.shard_id}`,
      `${formatNumber(item.webhooks_count)}`,
    ]),
    datasets: [
      {
        label: "Webhooks Count",
        data: data.map((item) => item.webhooks_count),
        backgroundColor: data.map((item) => getBarColor(item.webhooks_count)),
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
            `Webhooks: ${formatNumber(tooltipItem.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          padding: 0,
          autoSkip: false,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
          },
          callback: (value) => formatNumber(value as number),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
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
              collapsed: { opacity: 0, height: 0 },
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

