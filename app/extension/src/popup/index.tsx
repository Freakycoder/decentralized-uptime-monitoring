import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion } from 'framer-motion'

interface MonitoredWebsite { 
  [url : string] : {
  status: boolean
  count: number
  startedAt: number}
}

const App: React.FC = () => {
  const [monitoredSites, setMonitoredSites] = useState<MonitoredWebsite>({})
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      setMonitoredSites(data);
      setLoading(false)
    });
  }, [])
  
  if (loading) {
    return (
      <div className="w-[350px] h-[400px] bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }
  const siteEntries = Object.entries(monitoredSites); // [[url, data], [url,data] ...]
  
  return (
    <div className="w-[350px] h-[400px] bg-gray-900 text-white p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm">
          D
        </div>
        <h1 className="text-lg font-semibold">Data Contribution Monitor</h1>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-300 mb-3">
          Monitored Sites ({siteEntries.length})
        </h2>
        
        {siteEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              No websites being monitored
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {siteEntries.map(([url,data], index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
              >
                <div className="relative">
                  {data.status ? (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-3 h-3 bg-green-500 rounded-full"
                    />
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {url}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{data.status ? 'Active' : 'Completed'}</span>
                    <span>•</span>
                    <span>{data.count}/8 checks</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="text-center text-xs text-gray-500">
          Monitoring status updates every 5 seconds
        </div>
      </div>
    </div>
  )
}

// Mount it
const container = document.getElementById('popup-root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
} else {
  console.error('Popup root element not found')
}