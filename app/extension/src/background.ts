import axios from "axios"

interface MonitoredWebsites {
  url: string,
  startTime: number,
  timeouts: any[],
  checkCount: number // how much times the website is pinged
}

export class BackgroundService {

  private monitoredWebsites: Record<string, MonitoredWebsites> = {};
  private readonly INTERVAL = 10 * 60 * 1000;
  private readonly TOTAL_DURATION = 80 * 60 * 1000;
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
    })
  }

  private async pingWebsite(url: string) {
    const start = Date.now();
    let status = 'down';

    try {
      await axios.get(url);
      status = 'up'
    }
    catch (e) {
      console.error(`Ping failed for ${url}`)
    }
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
        const startTime = Date.now();
        site.startTime = startTime;
      }, i * this.INTERVAL)
      site.timeouts.push(timeoutID)
    }
    
    this.monitoredWebsites[domain.origin] = site;
    console.log(`started monitoring : ${url}`)
  }

  private setupWebRequest(){
    chrome.webRequest.onCompleted.addListener((requestDetails) => {
      const domain = new URL(requestDetails.url);

      if(!this.monitoredWebsites[domain.origin]){ // confirming that the domain which we recieved through evemt listener in present in monitoredwebsites Record.
        return
      }

      const domainDetails = this.monitoredWebsites[domain.origin];
      const timing = requestDetails.timeStamp - domainDetails.startTime;
      const payload : MonitoredWebsites = {
        url : domain.origin,
        
      }
      try{
        const response = axios.post(`${this.SERVER_ENDPOINT}`, {

        })
      }

    })
  }

}
