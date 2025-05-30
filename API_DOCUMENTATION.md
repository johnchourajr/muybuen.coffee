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

**GET** `/search/yelp?location={location}&radius={radius}&limit={limit}`

Searches for coffee shops using Yelp API with custom categorization.

#### Parameters

- `location` (required): Location to search (e.g., "New York, NY")
- `radius` (optional): Search radius in meters (100-40000, default: 2500)
- `limit` (optional): Number of results (1-50, default: 50)

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

- **Smart Categorization**: Results are categorized as "buen" (excellent), normal, or "shitlist"
- **Blacklist Filtering**: Certain shops are filtered out completely
- **Distance Sorting**: Results sorted by distance within each category
- **Caching**: Results cached for 5 minutes

### 2. Google Places Autocomplete

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

### 3. Google Places Search

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

### 4. Google Place Details

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
- ✅ Environment variable validation
- ✅ SQL injection protection (parameterized queries)

### Performance

- ✅ Response caching (5-10 minutes)
- ✅ Efficient database queries
- ✅ Connection pooling
- ✅ Memory-based cache cleanup

### Error Handling

- ✅ Comprehensive error responses
- ✅ External API error mapping
- ✅ Graceful degradation
- ✅ Detailed logging

### Developer Experience

- ✅ TypeScript types for all endpoints
- ✅ Consistent response format
- ✅ Clear error messages
- ✅ Comprehensive documentation

---

## 🧪 Testing

### Example Requests

#### Search for coffee in NYC

```bash
curl "https://your-domain.com/api/search/yelp?location=New%20York,%20NY&limit=10"
```

#### Get autocomplete suggestions

```bash
curl "https://your-domain.com/api/search/googleautocomplete?input=san%20francisco"
```

#### Create/update user

```bash
curl -X POST "https://your-domain.com/api/database/add" \
  -H "Content-Type: application/json" \
  -d '{"id":"user123","email":"user@example.com"}'
```

---

## ⚠️ Important Notes

1. **API Keys**: Keep all API keys in environment variables, never in client-side code
2. **Rate Limits**: Monitor your usage to avoid hitting external API limits
3. **Caching**: Results are cached to improve performance and reduce API costs
4. **Error Handling**: Always check the `success` field in responses
5. **Security**: The database route removes the `NEXT_PUBLIC_` prefix from environment variables for security
