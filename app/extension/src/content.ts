import axios from "axios";

interface performanceData {
    dnsLookup: number,
    tcpConnection: number,
    tlsHandshake: number,
    ttfb: number,
    contentDownload: number,
    totalDuration: number,
    statusCode: number
}

interface performanceDetail {
    pingData: { [url: string]: performanceData }
}

const INTERVAL = 10 * 60 * 1000; 
const TOTAL_RUNS = 8;
let URL: string;
let currentRun = 0;
let monitoringActive = false;

URL = window.location.href;

// Auto-start monitoring when content script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auto-starting monitoring for:', URL);
    startTimedMonitoring();
});

function startTimedMonitoring() {
    if (monitoringActive) {
        console.log('Monitoring already active for:', URL);
        return;
    }
    
    monitoringActive = true;
    currentRun = 0;
    
    console.log(`Starting timed monitoring for ${URL} - ${TOTAL_RUNS} runs over ${(TOTAL_RUNS * INTERVAL) / 60000} minutes`);
    
    for (let i = 0; i < TOTAL_RUNS; i++) {
        setTimeout(() => {
            if (monitoringActive) {
                currentRun = i + 1;
                console.log(`Running ping ${currentRun} of ${TOTAL_RUNS} for ${URL}`);
                triggerRequestAndSend();
            }
        }, i * INTERVAL);
    }
    
    // Auto-stop after total duration
    setTimeout(() => {
        monitoringActive = false;
        console.log('Monitoring completed for:', URL);
    }, TOTAL_RUNS * INTERVAL + 60000); // Add 1 minute buffer
}

async function triggerRequestAndSend() {
    if (!monitoringActive) return;
    
    const startTime = performance.now();
    let performanceData: performanceData;
    
    try {
        // Clear previous performance entries
        performance.clearResourceTimings();
        
        // Make the request
        const response = await axios.get(URL, {
            timeout: 30000,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        // Wait a bit for performance entries to be recorded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the performance entry for our request
        const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        // Find the entry that matches our request
        let entry: PerformanceResourceTiming | PerformanceNavigationTiming | null = null;
        
        // Try to find the resource entry first
        entry = resourceEntries.find(e => e.name === URL) || null;
        
        // If not found, use navigation timing (for main document)
        if (!entry && navigationEntry) {
            entry = navigationEntry;
        }
        
        if (entry) {
            performanceData = extractPerformanceData(entry, response.status);
        } else {
            const endTime = performance.now();
            performanceData = {
                dnsLookup: 0,
                tcpConnection: 0,
                tlsHandshake: 0,
                ttfb: 0,
                contentDownload: 0,
                totalDuration: endTime - startTime,
                statusCode: response.status
            };
        }
        
        // Create the data structure
        const dataToSend: performanceDetail = {
            pingData: { [URL]: performanceData }
        };
        
        chrome.runtime.sendMessage({
            action: 'PERF_DATA',
            url: URL,
            data: dataToSend,
            timestamp: Date.now(),
            runNumber: currentRun,
            totalRuns: TOTAL_RUNS
        });
        
        console.log(`Performance data sent for run ${currentRun}:`, performanceData);
        
    } catch (error) {
        console.error(`Failed to collect performance data for run ${currentRun}:`, error);
        
        const errorData: performanceDetail = {
            pingData: { [URL]: {
                dnsLookup: 0,
                tcpConnection: 0,
                tlsHandshake: 0,
                ttfb: 0,
                contentDownload: 0,
                totalDuration: 0,
                statusCode: 0
            }}
        };
        
        chrome.runtime.sendMessage({
            action: 'PERF_DATA',
            url: URL,
            data: errorData,
            timestamp: Date.now(),
            runNumber: currentRun,
            totalRuns: TOTAL_RUNS,
            error: error || 'Request failed'
        });
    }
}

function extractPerformanceData(entry: PerformanceResourceTiming | PerformanceNavigationTiming, statusCode: number): performanceData {
    return {
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnection: entry.connectEnd - entry.connectStart,
        tlsHandshake: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
        ttfb: entry.responseStart - entry.requestStart,
        contentDownload: entry.responseEnd - entry.responseStart,
        totalDuration: entry.responseEnd - entry.startTime,
        statusCode: statusCode
    };
}

export { performanceData, performanceDetail };