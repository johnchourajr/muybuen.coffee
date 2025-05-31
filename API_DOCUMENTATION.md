# 🍫 Buen Coffee API Documentation

## Overview

The Buen Coffee API provides endpoints for user management and coffee shop discovery with intelligent categorization.

## Base URL

```
https://your-domain.com/api
```

## Authentication

- **Database routes**: No authentication required (handles Netlify Identity data)
- **Search routes**: No authentication required (rate limited)

## Rate Limits

- **Database**: 50 requests per minute per IP
- **Search (Yelp)**: 30 requests per minute per IP
- **Search (Google)**: 50-100 requests per minute per IP (varies by endpoint)
- **Business Details**: 60 requests per minute per IP

---

## 📊 Database Endpoints

### Create/Update User

**POST** `/database/add`

Creates a new user or updates an existing user in the database.

#### Request Body

```json
{
  "id": "string (required)",
  "email": "string (required)",
  "audience": "string (optional)",
  "confirmation_sent_at": "string|null (optional)",
  "confirmed_at": "string|null (optional)",
  "role": "string (optional)",
  "url": "string (optional)",
  "user_metadata": "object (optional)"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "message": "User created successfully",
    "id": "user_id",
    "action": "created|updated"
  }
}
```

#### Error Responses

- `400` - Invalid input data
- `429` - Rate limit exceeded
- `500` - Database error

---

## 🔍 Search Endpoints

### 1. Yelp Coffee Search

**GET** `/search/yelp?location={location}&radius={radius}&limit={limit}&excludeChains={excludeChains}`

Searches for coffee shops using Yelp API with custom categorization.

#### Parameters

- `location` (required): Location to search (e.g., "New York, NY")
- `radius` (optional): Search radius in meters (100-40000, default: 2500)
- `limit` (optional): Number of results (1-50, default: 50)
- `excludeChains` (optional): Whether to exclude chain coffee shops (true/false, default: true)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "business_id",
      "alias": "business-alias",
      "name": "Coffee Shop Name",
      "image_url": "https://...",
      "url": "https://yelp.com/...",
      "rating": 4.5,
      "review_count": 123,
      "categories": [...],
      "location": {...},
      "coordinates": {...},
      "distance": 150.5,
      "buentag": "buen|shitlist" // Only present for categorized shops
    }
  ]
}
```

#### Features

- **Chain Exclusion**: By default excludes known coffee chains (Starbucks, Dunkin', etc.)
- **Smart Categorization**: Results are categorized as "buen" (excellent), normal, or "shitlist"
- **Blacklist Filtering**: Certain shops are filtered out completely
- **Distance Sorting**: Results sorted by distance within each category
- **Caching**: Results cached for 5 minutes

### 2. Business Details

**GET** `/business/{id}`

Gets detailed information about a specific business by Yelp business ID or alias.

#### Parameters

- `id` (required): Yelp business ID or business alias (e.g., "blue-bottle-coffee-san-francisco")

#### Response

```json
{
  "success": true,
  "data": {
    "id": "business_id",
    "alias": "business-alias",
    "name": "Coffee Shop Name",
    "image_url": "https://...",
    "url": "https://yelp.com/...",
    "rating": 4.5,
    "review_count": 123,
    "categories": [...],
    "location": {...},
    "coordinates": {...},
    "photos": [...],
    "hours": [...],
    "phone": "+1234567890",
    "display_phone": "(123) 456-7890",
    "price": "$$",
    "is_closed": false,
    "transactions": ["pickup", "delivery"]
  }
}
```

#### Features

- **Comprehensive Details**: Full business information from Yelp
- **Flexible ID**: Accepts both business ID and alias for convenient access
- **SEO-Friendly URLs**: Use alias for clean, readable URLs
- **Caching**: Results cached for 10 minutes
- **Rate Limited**: 60 requests per minute per IP

#### Error Responses

- `400` - Invalid business ID/alias
- `404` - Business not found
- `429` - Rate limit exceeded
- `500` - Yelp API error

### 3. Google Places Autocomplete

**GET** `/search/googleautocomplete?input={input}`

Provides location autocomplete suggestions.

#### Parameters

- `input` (required): Search input (2-100 characters)

#### Response

```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "description": "New York, NY, USA",
        "place_id": "place_id_string",
        "structured_formatting": {
          "main_text": "New York",
          "secondary_text": "NY, USA"
        }
      }
    ],
    "status": "OK"
  }
}
```

### 4. Google Places Search

**GET** `/search/google?lat={lat}&lng={lng}&radius={radius}`

Searches for coffee shops near specific coordinates.

#### Parameters

- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in meters (100-50000, default: 5000)

#### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "place_id": "place_id_string",
        "name": "Coffee Shop Name",
        "geometry": {
          "location": {
            "lat": 40.7128,
            "lng": -74.006
          }
        },
        "rating": 4.5,
        "price_level": 2
      }
    ],
    "status": "OK",
    "next_page_token": "token_string"
  }
}
```

### 5. Google Place Details

**GET** `/search/googleplacedetail?place_id={place_id}`

Gets detailed information about a specific place.

#### Parameters

- `place_id` (required): Google Places place ID

#### Response

```json
{
  "success": true,
  "data": {
    "result": {
      "place_id": "place_id_string",
      "name": "Coffee Shop Name",
      "formatted_address": "123 Main St, City, State",
      "geometry": {...},
      "rating": 4.5,
      "price_level": 2,
      "opening_hours": {...},
      "website": "https://...",
      "formatted_phone_number": "(555) 123-4567",
      "photos": [...],
      "reviews": [...],
      "types": ["cafe", "food", "establishment"]
    },
    "status": "OK"
  }
}
```

---

## 📝 Standard Response Format

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message description"
}
```

## HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (API key issues)
- `404` - Not Found
- `405` - Method Not Allowed
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## 🔧 Environment Variables

### Required

- `RETOOL_DB_TABLE` - Database table name
- `RETOOL_POSTGRESS_URL` - PostgreSQL connection string
- `YELP_API_KEY` - Yelp API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

### Optional

- Set appropriate rate limits based on your API quotas

---

## 🚀 Features & Improvements

### Security

- ✅ Input validation on all endpoints
- ✅ Rate limiting per IP address
- ✅ SQL injection protection (parameterized queries)
- ✅ Environment variable validation
- ✅ API key security (server-side only)

### Performance

- ✅ Response caching (5-10 minutes)
- ✅ Optimized database queries
- ✅ Efficient error handling
- ✅ Memory-based rate limiting

### Data Quality

- ✅ Smart coffee shop categorization
- ✅ Blacklist filtering
- ✅ Distance-based sorting
- ✅ Comprehensive business data

---

## 📱 Usage Examples

### Search for coffee shops

```bash
curl "https://your-domain.com/api/search/yelp?location=San Francisco, CA"
```

### Get business details

```bash
curl "https://your-domain.com/api/business/blue-bottle-coffee-san-francisco"
```

### Location autocomplete

```bash
curl "https://your-domain.com/api/search/googleautocomplete?input=San Fran"
```

---

_Last updated: December 2024_
