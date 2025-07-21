import axios from "axios"

interface MonitoredWebsites {
  url: string,
  startTime: number,
  timeouts: any[],
  checkCount: number
}

interface PerformanceData {
  website_id : string,
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
  private readonly SERVER_ENDPOINT = 'http://localhost:3001'

  constructor() {
    this.setupMessageListener();
    this.resumeStoredSessions();
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      if (message.action === 'MONITOR_URL' && message.url) {
        this.startMonitoring(message.url)
        sendResponse({ success: true })
      }
      else if (message.action === 'PERF_DATA' && message.url && message.data) {
        // Get performance data from content script

        const result = await chrome.storage.local.get(['validatorId']);
        const validator_id = result.validatorId;
        const perfData = message.data.pingData[message.url] as PerformanceData;

        const payload = {
          website_id: perfData.website_id,
          validator_id,
          timestamp : Date.now(),
          data : {
            dnsLookup: perfData.dnsLookup,
            tcpConnection: perfData.tcpConnection,
            tlsHandshake: perfData.tlsHandshake,
            ttfb: perfData.ttfb,
            contentDownload: perfData.contentDownload,
            totalDuration: perfData.totalDuration,
            statusCode: perfData.statusCode
          }
        }

        try {
          const response = await axios.post(`${this.SERVER_ENDPOINT}/queue/publish`, payload)
          console.log("Performance data sent to server:", payload)
          
          if (response.data.success){
            await this.storeSessionInfo(message.url, message.runNumber, message.totalRuns, perfData.website_id);
          }
          console.log('failed to publish to queue from server');
          return
        }
        catch (err) {
          console.error("Failed to send performance data:", err)
        }
        sendResponse({ success: true })
      }
      else if (message.action === 'GET_MONITORED_SITES') {
        // Return monitored sites for popup UI
        const sites = Object.values(this.monitoredWebsites).map(site => ({
          url: site.url,
          domain: new URL(site.url).hostname,
          isActive: site.checkCount < 8 && site.timeouts.length > 0,
          checkCount: site.checkCount,
          startTime: site.startTime,
          lastUpdate: new Date().toISOString()
        }))

        sendResponse({ sites })
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

  private async storeSessionInfo(url: string, runNumber: number, totalRuns: number, websiteId: string) {
    const sessionKey = `monitoring_session_${new URL(url).origin}`;
    const sessionData = {
      url,
      websiteId,
      currentRun: runNumber,
      totalRuns,
      lastUpdate: Date.now(),
      status: runNumber >= totalRuns ? 'completed' : 'active'
    };

    await chrome.storage.local.set({ [sessionKey]: sessionData });
    console.log(`Session stored for ${url}, run ${runNumber}/${totalRuns}`);

    // Clean up completed sessions
    if (runNumber >= totalRuns) {
      setTimeout(async () => {
        await chrome.storage.local.remove(sessionKey);
        console.log(`Cleaned up completed session for ${url}`);
      }, 5000); // Clean up after 5 seconds
    }
  }

  private async resumeStoredSessions() {
    try {
      const storage = await chrome.storage.local.get();
      const sessionKeys = Object.keys(storage).filter(key => key.startsWith('monitoring_session_'));

      for (const sessionKey of sessionKeys) {
        const sessionData = storage[sessionKey];
        if (sessionData.status === 'active' && sessionData.currentRun < sessionData.totalRuns) {
          const remainingRuns = sessionData.totalRuns - sessionData.currentRun;
          console.log(`Resuming session for ${sessionData.url}: ${remainingRuns} runs remaining`);

          // Resume monitoring from where we left off
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id!, {
                type: 'RESUME_MONITORING',
                url: sessionData.url,
                websiteId: sessionData.websiteId,
                sessionId: sessionKey,
                startFromRun: sessionData.currentRun + 1,
                totalRuns: sessionData.totalRuns
              });
            }
          });
        } else if (sessionData.status === 'completed') {
          // Clean up old completed sessions
          await chrome.storage.local.remove(sessionKey);
        }
      }
    } catch (error) {
      console.error('Error resuming stored sessions:', error);
    }
  }
}

new BackgroundService()