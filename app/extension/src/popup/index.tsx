import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion } from 'framer-motion'

interface MonitoredWebsite {
  url: string
  domain: string
  isActive: boolean
  checkCount: number
  startTime: number
  lastUpdate: string
}

const App: React.FC = () => {
  const [monitoredSites, setMonitoredSites] = useState<MonitoredWebsite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMonitoredSites()
    const interval = setInterval(loadMonitoredSites, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadMonitoredSites = () => {
    chrome.runtime.sendMessage({ action: 'GET_MONITORED_SITES' }, (response) => {
      if (response && response.sites) {
        const recentSites = response.sites.slice(-4).reverse()
        setMonitoredSites(recentSites)
      }
      setLoading(false)
    })
  }

  const addCurrentSite = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        chrome.runtime.sendMessage({ 
          action: 'MONITOR_URL', 
          url: tabs[0].url 
        }, () => {
          setTimeout(loadMonitoredSites, 1000)
        })
      }
    })
  }

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

  return (
    <div className="w-[350px] h-[400px] bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm">
          D
        </div>
        <h1 className="text-lg font-semibold">Data Contribution</h1>
      </div>

      {/* Add Current Site Button */}
      <button
        onClick={addCurrentSite}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-6 transition-colors duration-200"
      >
        Monitor Current Website
      </button>

      {/* Monitored Sites List */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-300 mb-3">
          Recent Monitored Sites ({monitoredSites.length}/4)
        </h2>
        
        {monitoredSites.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              No websites being monitored yet.
            </div>
            <div className="text-gray-500 text-xs mt-1">
              Click "Monitor Current Website" to start
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {monitoredSites.map((site, index) => (
              <motion.div
                key={site.url}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="relative">
                  {site.isActive ? (
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
                    {site.domain}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{site.isActive ? 'Active' : 'Inactive'}</span>
                    <span>•</span>
                    <span>{site.checkCount} checks</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  {formatTimeAgo(site.lastUpdate)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-center">
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Settings
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          Earn SOL by monitoring websites
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const time = new Date(timestamp).getTime()
  const diffMs = now - time
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
  return `${Math.floor(diffMins / 1440)}d`
}

// Mount it
const container = document.getElementById('popup-root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
} else {
  console.error('Popup root element not found')
}