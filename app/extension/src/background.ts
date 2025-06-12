import axios from "axios"

interface MonitoredWebsites {
  url: string,
  startTime: number,
  timeouts: any[],
  checkCount: number
}

interface PerformanceData {
  dnsLookup: number,
  tcpConnection: number,
  tlsHandshake: number,
  ttfb: number,
  contentDownload: number,
  totalDuration: number,
  statusCode: number
}

export class BackgroundService {

  private monitoredWebsites: Record<string, MonitoredWebsites> = {};
  private readonly INTERVAL = 10 * 60 * 1000;
  private readonly SERVER_ENDPOINT = 'http://127.0.0.1:3001'

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'MONITOR_URL' && message.url) {
        this.startMonitoring(message.url)
        sendResponse({ success: true })
      }
      else if (message.action === 'PERF_DATA' && message.url && message.data) {
        // Get performance data from content script
        const perfData = message.data.pingData[message.url] as PerformanceData;

        const payload = {
          url: message.url,
          timestamp: new Date().toISOString(),
          runNumber: message.runNumber,
          totalRuns: message.totalRuns,
          dnsLookup: perfData.dnsLookup,
          tcpConnection: perfData.tcpConnection,
          tlsHandshake: perfData.tlsHandshake,
          ttfb: perfData.ttfb,
          contentDownload: perfData.contentDownload,
          totalDuration: perfData.totalDuration,
          statusCode: perfData.statusCode,

          // Background script metadata
          extensionSessionId: this.generateSessionId(),
          checkCount: this.monitoredWebsites[new URL(message.url).origin]?.checkCount || 0
        }

        try {
          axios.post(`${this.SERVER_ENDPOINT}/extension/monitoring-results`, payload)
          console.log("Performance data sent to server:", payload)
        }
        catch (err) {
          console.error("Failed to send performance data:", err)
        }
        sendResponse({ success: true })
      }
      return true;
    })
  }

  private startMonitoring(url: string) {
    const domain = new URL(url);

    if (this.monitoredWebsites[domain.origin]) {
      console.log(`already monitoring : ${domain.origin}`)
      return;
    }

    const site: MonitoredWebsites = {
      url: domain.origin,
      startTime: 0,
      checkCount: 0,
      timeouts: []
    }

    for (let i = 0; i < 8; i++) {
      const timeoutID = setTimeout(() => {
        chrome.tabs.create({ url: site.url, active: false })
        site.checkCount++;
        site.startTime = Date.now();
      }, i * this.INTERVAL)
      site.timeouts.push(timeoutID)
    }

    this.monitoredWebsites[domain.origin] = site;
    console.log(`started monitoring : ${url}`)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

new BackgroundService()