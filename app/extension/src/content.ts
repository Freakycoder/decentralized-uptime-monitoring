import axios from "axios";

interface performanceData {
    website_id: string,
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

const activeMonitoringSessions = new Map<string, {
    totalRuns: string,
    currentRun: number,
}>();

const INTERVAL = 10 * 60 * 1000;
let currentRun = 0;

window.addEventListener('message', async (event) => {
console.log('🎧 Content script received message:', event.data);
    if (event.origin !== window.location.origin) {
        return
    }
    if (event.data.type === 'START_MONITORING') {
        const { url, websiteId, sessionId, totalRuns = 8 } = event.data;
        console.log(`started monitoring for ${url} - Session: ${sessionId}`);

        activeMonitoringSessions.set(sessionId, {
            totalRuns: totalRuns,
            currentRun: 0
        })

        window.postMessage({
            type: 'MONITORING_STARTED',
            sessionId,
            url,
            websiteId,
            success: true
        }, '*')
        startTimedMonitoring(url, websiteId, sessionId, 0, totalRuns)
    }
})

// Listen for resume monitoring messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RESUME_MONITORING') {
        const { url, websiteId, sessionId, startFromRun, totalRuns } = message;
        console.log(`Resuming monitoring for ${url} from run ${startFromRun}/${totalRuns}`);

        activeMonitoringSessions.set(sessionId, {
            totalRuns: totalRuns,
            currentRun: startFromRun - 1
        });

        // Resume monitoring from the specified run
        startTimedMonitoring(url, websiteId, sessionId, startFromRun - 1, totalRuns);
        
        sendResponse({ success: true });
    }
    return true;
});

function startTimedMonitoring(url: string, websiteId: string, sessionId: string, runNumber: number, totalRuns: number) {
    currentRun = runNumber;
    chrome.storage.local.set({ [url]: { status: "Active", startedAt: Date.now(), sessionId } })
    console.log(`Starting timed monitoring for ${url} - ${totalRuns - runNumber} runs remaining over ${((totalRuns - runNumber) * INTERVAL) / 60000} minutes`);

    for (let i = runNumber; i < totalRuns; i++) {
        const delay = runNumber === 0 ? i * INTERVAL : (i - runNumber) * INTERVAL; // Adjust delay for resumed sessions
        setTimeout(async () => {
            currentRun = i + 1;
            console.log(`Running ping ${currentRun} of ${totalRuns} for ${url}`);
            await triggerRequestAndSend(url, websiteId, sessionId, currentRun, totalRuns);
        }, delay);
    }
    const finalDelay = runNumber === 0 ? totalRuns * INTERVAL + 5000 : (totalRuns - runNumber) * INTERVAL + 5000;
    setTimeout(() => {
        chrome.storage.local.set({ [url]: { status: "Completed", startedAt: Date.now() } })
        console.log('Monitoring completed for:', url);
    }, finalDelay); // 5 secs buffer
}

async function triggerRequestAndSend(url: string, websiteId: string, sessionId: string, runNumber: number, totalRuns: number) {

    const startTime = performance.now();
    let performanceData: performanceData;

    try {
        // Clear previous performance entries
        performance.clearResourceTimings();

        // Make the request
        const response = await axios.get(url, {
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
        entry = resourceEntries.find(e => e.name === url) || null;

        // If not found, use navigation timing (for main document)
        if (!entry && navigationEntry) {
            entry = navigationEntry;
        }


        if (entry) {
            performanceData = extractPerformanceData(entry, response.status, websiteId);
        } else {
            const endTime = performance.now();
            performanceData = {
                website_id: websiteId,
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
            pingData: { [url]: performanceData }
        };

        chrome.runtime.sendMessage({
            action: 'PERF_DATA',
            url: url,
            data: dataToSend,
            timestamp: Date.now(),
            runNumber: currentRun,
            totalRuns: totalRuns
        });

        console.log(`Performance data sent for run ${currentRun}:`, performanceData);
        window.postMessage({
            type: 'MONITORING_UPDATE',
            sessionId,
            url,
            runNumber,
            totalRuns,
            success: true,
            statusCode: performanceData.statusCode,
            responseTime: performanceData.totalDuration,
            timestamp: Date.now()
        }, '*');

        if (runNumber === totalRuns) {
            chrome.storage.local.set({
                [url]: {
                    status: "Completed",
                    startedAt: Date.now(),
                    sessionId
                }
            })
        };

    } catch (error) {
        console.error(`Failed to collect performance data for run ${currentRun}:`, error);

        const errorData: performanceDetail = {
            pingData: {
                [url]: {
                    website_id: websiteId,
                    dnsLookup: 0,
                    tcpConnection: 0,
                    tlsHandshake: 0,
                    ttfb: 0,
                    contentDownload: 0,
                    totalDuration: 0,
                    statusCode: 0
                }
            }
        };

        chrome.runtime.sendMessage({
            action: 'PERF_DATA',
            url: url,
            data: errorData,
            timestamp: Date.now(),
            runNumber: currentRun,
            totalRuns: totalRuns,
            error: error || 'Request failed'
        });
        window.postMessage({
            type: 'MONITORING_UPDATE',
            sessionId,
            url,
            runNumber,
            totalRuns,
            success: false,
            statusCode: 0,
            responseTime: 0,
            timestamp: Date.now()
        }, '*');
        if (runNumber === totalRuns) {
            chrome.storage.local.set({
                [url]: {
                    status: "Completed",
                    startedAt: Date.now(),
                    sessionId
                }
            })
        };
    }
}

function extractPerformanceData(entry: PerformanceResourceTiming | PerformanceNavigationTiming, statusCode: number, websiteId: string): performanceData {
    return {
        website_id: websiteId,
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnection: entry.connectEnd - entry.connectStart,
        tlsHandshake: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
        ttfb: entry.responseStart - entry.requestStart,
        contentDownload: entry.responseEnd - entry.responseStart,
        totalDuration: entry.responseEnd - entry.startTime,
        statusCode: statusCode
    };
}
