// API client for Krishi Sanrakshan FastAPI backend
// For now, using mock data - will connect to actual backend later

import { 
  CropImage, 
  DamageAlert, 
  DashboardStats, 
  MapMarker,
  AnalyticsData,
  ImageFilters 
} from './types'
import {
  generateMockCropImages,
  generateMockAlerts,
  generateMapMarkers,
  generateDashboardStats,
  generateAnalyticsData,
} from './mockData'

// Backend API base URL (configure based on environment)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Mock data cache (in production, this would be fetched from backend)
let mockCropImages: CropImage[] = []
let mockAlerts: DamageAlert[] = []

// Initialize mock data
function initMockData() {
  if (mockCropImages.length === 0) {
    mockCropImages = generateMockCropImages(60)
    mockAlerts = generateMockAlerts(mockCropImages)
  }
}

// API client class
class KrishiSanrakshanAPI {
  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    initMockData()
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/api/dashboard/stats`).then(r => r.json())
    return generateDashboardStats(mockCropImages)
  }

  // Crop Images APIs
  async getCropImages(filters?: ImageFilters): Promise<CropImage[]> {
    initMockData()
    // TODO: Replace with actual API call
    // const params = new URLSearchParams(filters as any)
    // return await fetch(`${API_BASE_URL}/api/images?${params}`).then(r => r.json())
    
    let filtered = [...mockCropImages]
    
    if (filters) {
      if (filters.cropType) {
        filtered = filtered.filter(img => img.cropType === filters.cropType)
      }
      if (filters.growthStage) {
        filtered = filtered.filter(img => img.growthStage === filters.growthStage)
      }
      if (filters.healthStatus) {
        filtered = filtered.filter(img => img.aiAnalysis.cropHealth === filters.healthStatus)
      }
      if (filters.state) {
        filtered = filtered.filter(img => img.location.state === filters.state)
      }
      if (filters.district) {
        filtered = filtered.filter(img => img.location.district === filters.district)
      }
    }
    
    return filtered
  }

  async getCropImageById(id: string): Promise<CropImage | null> {
    initMockData()
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/api/images/${id}`).then(r => r.json())
    return mockCropImages.find(img => img.id === id) || null
  }

  // Damage Alerts APIs
  async getDamageAlerts(status?: string): Promise<DamageAlert[]> {
    initMockData()
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/api/alerts?status=${status || 'all'}`).then(r => r.json())
    
    if (status && status !== 'all') {
      return mockAlerts.filter(alert => alert.status === status)
    }
    return mockAlerts
  }

  async getAlertById(id: string): Promise<DamageAlert | null> {
    initMockData()
    // TODO: Replace with actual API call
    return mockAlerts.find(alert => alert.id === id) || null
  }

  async updateAlertStatus(id: string, status: string): Promise<DamageAlert> {
    initMockData()
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/api/alerts/${id}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify({ status })
    // }).then(r => r.json())
    
    const alert = mockAlerts.find(a => a.id === id)
    if (alert) {
      alert.status = status as any
      alert.updatedAt = new Date().toISOString()
    }
    return alert!
  }

  // Map APIs
  async getMapMarkers(filters?: ImageFilters): Promise<MapMarker[]> {
    initMockData()
    const images = await this.getCropImages(filters)
    return generateMapMarkers(images)
  }

  // Analytics APIs
  async getAnalyticsData(): Promise<AnalyticsData> {
    initMockData()
    // TODO: Replace with actual API call
    // return await fetch(`${API_BASE_URL}/api/analytics`).then(r => r.json())
    return generateAnalyticsData(mockCropImages)
  }

  // Filter options APIs
  async getFilterOptions() {
    initMockData()
    const states = [...new Set(mockCropImages.map(img => img.location.state))].sort()
    const districts = [...new Set(mockCropImages.map(img => img.location.district))].sort()
    const cropTypes = [...new Set(mockCropImages.map(img => img.cropType))].sort()
    
    return {
      states,
      districts,
      cropTypes,
      growthStages: ['sowing', 'vegetative', 'flowering', 'maturity', 'harvest'],
      healthStatuses: ['healthy', 'stressed', 'damaged', 'critical'],
    }
  }
}

// Export singleton instance
export const cropicAPI = new KrishiSanrakshanAPI()
// Legacy export for backward compatibility
export const krishiSanrakshanAPI = cropicAPI

