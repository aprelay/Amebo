// VTPass API Integration Module
// Nigerian Data Bundle Purchase Service

export interface VTPassConfig {
  apiKey: string
  publicKey: string
  secretKey: string
  baseUrl: string // 'https://vtpass.com/api' or 'https://sandbox.vtpass.com/api'
}

export interface VTPassVariation {
  variation_code: string
  name: string
  variation_amount: string
  fixedPrice: string
}

export interface VTPassPurchaseRequest {
  request_id: string
  serviceID: string
  billersCode: string
  variation_code: string
  amount?: number
  phone: string
}

export interface VTPassPurchaseResponse {
  code: string
  content: {
    transactions: {
      status: string
      product_name: string
      unique_element: string
      unit_price: string | number
      quantity: number
      service_verification: any
      channel: string
      commission: number
      total_amount: number
      discount: any
      type: string
      email: string
      phone: string
      name: any
      convinience_fee: number
      amount: string | number
      platform: string
      method: string
      transactionId: string
      commission_details: {
        amount: number
        rate: string
        rate_type: string
        computation_type: string
      }
    }
  }
  response_description: string
  requestId: string
  amount: number
  transaction_date: string
  purchased_code: string
}

export interface VTPassQueryResponse {
  response_description: string
  code: string
  content: {
    transactions: {
      status: string
      product_name: string
      unique_element: string
      unit_price: number
      quantity: number
      service_verification: any
      channel: string
      commission: number
      total_amount: number
      discount: any
      type: string
      email: string
      phone: string
      name: any
      extras: any
      convinience_fee: number
      amount: number
      platform: string
      method: string
      transactionId: string
      product_id: number
      commission_details: {
        amount: number
        rate: string
        rate_type: string
        computation_type: string
      }
    }
  }
  requestId: string
  amount: number
  transaction_date: string
  purchased_code: string
}

export class VTPassClient {
  private config: VTPassConfig

  constructor(config: VTPassConfig) {
    this.config = config
  }

  /**
   * Get variation codes for a service (e.g., data plans)
   * @param serviceID Service ID (e.g., 'mtn-data', 'airtel-data', 'glo-data', '9mobile-data')
   */
  async getVariations(serviceID: string): Promise<VTPassVariation[]> {
    try {
      const url = `${this.config.baseUrl}/service-variations?serviceID=${serviceID}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'api-key': this.config.apiKey,
          'public-key': this.config.publicKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`VTPass API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.response_description !== '000') {
        throw new Error(`VTPass error: ${data.response_description}`)
      }

      return data.content.variations || []
    } catch (error: any) {
      console.error('[VTPASS] Get variations error:', error)
      throw error
    }
  }

  /**
   * Purchase data bundle
   * @param request Purchase request details
   */
  async purchaseData(request: VTPassPurchaseRequest): Promise<VTPassPurchaseResponse> {
    try {
      const url = `${this.config.baseUrl}/pay`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': this.config.apiKey,
          'secret-key': this.config.secretKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`VTPass API error: ${response.status} ${response.statusText}`)
      }

      const data: VTPassPurchaseResponse = await response.json()
      
      console.log('[VTPASS] Purchase response:', {
        code: data.code,
        status: data.content?.transactions?.status,
        requestId: data.requestId
      })

      return data
    } catch (error: any) {
      console.error('[VTPASS] Purchase error:', error)
      throw error
    }
  }

  /**
   * Query transaction status
   * @param requestId Original request ID from purchase
   */
  async queryTransaction(requestId: string): Promise<VTPassQueryResponse> {
    try {
      const url = `${this.config.baseUrl}/requery`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api-key': this.config.apiKey,
          'secret-key': this.config.secretKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ request_id: requestId })
      })

      if (!response.ok) {
        throw new Error(`VTPass API error: ${response.status} ${response.statusText}`)
      }

      const data: VTPassQueryResponse = await response.json()
      
      console.log('[VTPASS] Query response:', {
        code: data.code,
        status: data.content?.transactions?.status,
        requestId: data.requestId
      })

      return data
    } catch (error: any) {
      console.error('[VTPASS] Query error:', error)
      throw error
    }
  }

  /**
   * Helper: Map network name to VTPass service ID
   */
  static getServiceID(network: string): string {
    const mapping: Record<string, string> = {
      'MTN': 'mtn-data',
      'Airtel': 'airtel-data',
      'Glo': 'glo-data',
      '9mobile': 'etisalat-data' // VTPass uses 'etisalat-data' for 9mobile
    }
    return mapping[network] || network.toLowerCase() + '-data'
  }

  /**
   * Helper: Generate unique request ID
   */
  static generateRequestID(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `SCPAY-${timestamp}-${random}`
  }

  /**
   * Helper: Parse VTPass response status
   */
  static parseStatus(vtpassStatus: string): 'pending' | 'completed' | 'failed' {
    switch (vtpassStatus?.toLowerCase()) {
      case 'delivered':
      case 'successful':
        return 'completed'
      case 'pending':
      case 'initiated':
        return 'pending'
      case 'failed':
      case 'reversed':
        return 'failed'
      default:
        return 'pending'
    }
  }

  /**
   * Helper: Check if response code indicates success
   */
  static isSuccessCode(code: string): boolean {
    return code === '000' || code === '099'
  }
}

// Export singleton instance creator
export function createVTPassClient(config: VTPassConfig): VTPassClient {
  return new VTPassClient(config)
}

// Service ID constants
export const VTPASS_SERVICE_IDS = {
  MTN: 'mtn-data',
  AIRTEL: 'airtel-data',
  GLO: 'glo-data',
  ETISALAT: 'etisalat-data', // 9mobile
  NINE_MOBILE: 'etisalat-data'
} as const

// Sandbox test phone numbers
export const VTPASS_TEST_NUMBERS = {
  SUCCESS: '08011111111',
  PENDING: '201000000000',
  UNEXPECTED: '500000000000',
  NO_RESPONSE: '400000000000',
  TIMEOUT: '300000000000'
} as const
