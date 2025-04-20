import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    }

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    }

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }

    return date.toLocaleDateString()
}

export function formatNumber(num: number, digits = 2) {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
}

export function getInitials(name: string) {
    if (!name) return "?"

    const parts = name.split(" ")
    if (parts.length === 1) {
        return name.charAt(0).toUpperCase()
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function truncate(str: string, length: number) {
    if (!str) return ""
    if (str.length <= length) return str

    return str.slice(0, length) + "..."
}

export function getStatusColor(status: 'up' | 'down' | 'degraded' | 'active' | 'inactive') {
    switch (status) {
        case 'up':
        case 'active':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
        case 'down':
        case 'inactive':
            return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
        case 'degraded':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
    }
}

export function getContributionIcon(type: string) {
    switch (type) {
        case 'globe':
        case 'website-monitor':
            return '🌐'
        case 'wifi':
        case 'network-metrics':
            return '📡'
        case 'cpu':
        case 'compute-resources':
            return '🖥️'
        case 'map-pin':
        case 'geographic-data':
            return '📍'
        case 'bar-chart-2':
        case 'app-usage':
            return '📊'
        default:
            return '📈'
    }
}