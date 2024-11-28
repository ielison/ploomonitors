import { useState } from 'react'

export interface AccountData {
  _id: string;
  AccountId: number;
  IsNotFound: boolean;
  QueueTime: number;
  DateTime: string;
  ShardId: number;
}

interface ShardDataProps {
  data: Record<string, AccountData[]>
}

export default function ShardData({ data }: ShardDataProps) {
  const [selectedShard, setSelectedShard] = useState<string | null>(null)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(data).map((shardId) => (
          <button
            key={shardId}
            className={`px-3 py-1 rounded ${
              selectedShard === shardId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setSelectedShard(prevShard => prevShard === shardId ? null : shardId)}
          >
            Shard {shardId}
          </button>
        ))}
      </div>
      {selectedShard !== null && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left ">Account ID</th>
                <th className="px-4 py-2 text-left">Not Found</th>
                <th className="px-4 py-2 text-left">Queue Time (minutes)</th>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Date Time</th>
              </tr>
            </thead>
            <tbody>
              {data[selectedShard].map((account) => (
                <tr key={account._id}>
                  <td className="border px-4 py-2 text-gray-500">{account.AccountId}</td>
                  <td className="border px-4 py-2 text-gray-500">
                    {account.IsNotFound ? 'Yes' : 'No'}
                  </td>
                  <td className="border px-4 py-2 text-gray-500">
                    {account.QueueTime.toFixed(2)} minutes
                  </td>
                  <td className="border px-4 py-2 text-gray-500">{account._id}</td>
                  <td className="border px-4 py-2 text-gray-500">
                    {new Date(new Date(account.DateTime).getTime() + 3 * 60 * 60 * 1000).toLocaleString('en-GB', { 
                      year: '2-digit', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    }).replace(',', ' -')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

