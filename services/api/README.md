# API Integration Guide

Local API integration for Bolic Training App.

## Setup

1. **Environment Variables**

   Create a `.env` file in the project root (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

   Configure your local API:

   ```env
   API_BASE_URL=http://localhost:7071/api
   USE_MOCK_DATA=false
   MOCK_USER_ID=123e4567-e89b-12d3-a456-426614174001
   ```

2. **Start your local backend**

   Make sure your backend server is running on `http://localhost:7071`

## Usage

### Direct API Calls

```typescript
import { getTrainingDay, createTrainingDay } from '@/services/api';

// Fetch a training day
const trainingDay = await getTrainingDay({ id: 'some-uuid' });

// Create a new training day
const newDay = await createTrainingDay({
  userId: 'user-uuid',
  name: 'Push Day',
  description: 'Chest and shoulders',
  exercises: [],
});
```

### Using React Hooks

```typescript
import { useTrainingDay } from '@/hooks/useTrainingDay';

function MyComponent() {
  const { data, loading, error, refetch } = useTrainingDay({
    trainingDayId: 'some-uuid',
    enabled: true, // Optional, defaults to true
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data) return <Text>No data</Text>;

  return <Text>{data.name}</Text>;
}
```

### Using Data Source (Mock/API Toggle)

The data source manager automatically switches between mock data and real API based on the `USE_MOCK_DATA` flag:

```typescript
import { getTrainingDay, getNextTrainingDay } from '@/services/api/data-source';

// This will use mock data if USE_MOCK_DATA=true, otherwise hits the API
const nextDay = await getNextTrainingDay();
```

## Development Workflow

### With Backend Running

Set `USE_MOCK_DATA=false` in `.env`:

```env
USE_MOCK_DATA=false
```

This will make all API calls to your local backend at `http://localhost:7071/api`.

### Without Backend (Mock Data)

Set `USE_MOCK_DATA=true` in `.env`:

```env
USE_MOCK_DATA=true
```

This will use the mock data from `data/mock-data.ts` instead of making real API calls.

## API Endpoints

Based on `openapi.yaml`:

### Training Days

- **GET** `/training-days` - Get a training day by ID
- **POST** `/training-days` - Create a new training day
- **PUT** `/training-days` - Update a training day
- **PATCH** `/training-days` - Partially update a training day

### Exercises

- **GET** `/exercises` - Get an exercise by ID
- **POST** `/exercises` - Create a new exercise
- **PUT** `/exercises` - Update an exercise
- **PATCH** `/exercises` - Partially update an exercise

### Training Sessions

- **GET** `/training-session` - Get a training session by ID
- **POST** `/training-session` - Create a new training session

## Error Handling

All API functions throw `APIError` on failure:

```typescript
import { APIError } from '@/services/api';

try {
  const day = await getTrainingDay({ id: 'some-id' });
} catch (error) {
  if (error instanceof APIError) {
    console.error('API Error:', error.message, error.status, error.data);
  }
}
```

## Next Steps

- [ ] Implement authentication and real user management
- [ ] Add more endpoints for querying multiple training days
- [ ] Implement offline support with local caching
- [ ] Add optimistic updates for better UX
