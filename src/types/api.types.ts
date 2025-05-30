// API request and response types

// Database types
export interface UserData {
  id: string
  audience?: string
  confirmation_sent_at?: string | null
  confirmed_at?: string | null
  email: string
  role?: string
  url?: string
  user_metadata?: Record<string, any>
}

export interface DatabaseResponse {
  success: boolean
  data?: any
  error?: string
}

// Search types
export interface YelpSearchParams {
  location: string
  radius?: number
  limit?: number
}

export interface GoogleAutocompleteParams {
  input: string
}

export interface GoogleSearchParams {
  lat: string
  lng: string
  radius?: string
}

export interface GooglePlaceDetailParams {
  place_id: string
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// External API types
export interface YelpBusiness {
  id: string
  alias: string
  name: string
  image_url: string
  is_closed: boolean
  url: string
  review_count: number
  categories: Array<{
    alias: string
    title: string
  }>
  rating: number
  coordinates: {
    latitude: number
    longitude: number
  }
  transactions: string[]
  price?: string
  location: {
    address1: string
    address2?: string
    address3?: string
    city: string
    zip_code: string
    country: string
    state: string
    display_address: string[]
  }
  phone: string
  display_phone: string
  distance?: number
  buentag?: "buen" | "shitlist"
}

export interface GooglePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  price_level?: number
}

export interface GoogleAutocompleteResult {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}
