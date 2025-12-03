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

### Using Local Storage (Phase A - Current)

**Phase A uses local storage** for offline-first functionality. Use React hooks to interact with stored data:

```typescript
import { usePrograms } from '@/hooks/usePrograms';
import { useActiveProgram } from '@/hooks/useActiveProgram';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useStats } from '@/hooks/useStats';

// Get all programs
const { programs, loading, createProgram } = usePrograms();

// Get active program
const { program: activeProgram } = useActiveProgram();

// Manage workout sessions
const { session, startSession, completeSession } = useWorkoutSession();

// Get user statistics and PRs
const { stats, prs } = useStats();
```

**Note:** Direct API calls (below) will be integrated in Phase B for cloud sync functionality.

### Local Storage Architecture

Phase A implements a complete offline-first storage system:

- **Storage Services**: `services/storage/*` - AsyncStorage wrappers for data persistence
  - `program-storage.ts` - Training program management
  - `training-day-storage.ts` - Training day persistence
  - `session-storage.ts` - Workout session tracking with month partitioning
  - `stats-storage.ts` - User statistics and progress tracking
  - `personal-records-storage.ts` - PR tracking
- **Storage Context**: `contexts/StorageContext.tsx` - App initialization and user ID management
- **React Hooks**: `hooks/*` - Easy-to-use hooks for components
- **Template Loader**: `services/storage/template-loader.ts` - Load sample programs

All data is stored locally using `@react-native-async-storage/async-storage` and namespaced by user ID.

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

## Implementation Status

### ✅ Phase A Complete (Offline-First Storage)
- [x] Local storage system with AsyncStorage
- [x] User data isolation and namespacing
- [x] Offline functionality without authentication
- [x] React hooks for data access
- [x] Onboarding flow for new users
- [x] Template loading for sample programs

### 🔄 Phase B (Planned - Cloud Sync & Auth)
- [ ] Implement authentication and user management
- [ ] Add cloud sync for subscribed users
- [ ] Integrate API endpoints (training days, programs, sessions)
- [ ] Offline queue for syncing changes
- [ ] Data migration from anonymous to authenticated users
