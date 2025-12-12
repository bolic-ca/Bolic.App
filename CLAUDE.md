# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bolic.App is an Expo-based React Native application using Expo Router for navigation. The app supports iOS, Android, and web platforms with a tabbed navigation structure and custom theming.

## Development Commands

### Essential Commands
- `npm start` - Start Expo development server (choose platform interactively)
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint on the codebase

### Additional Commands
- `npm run reset-project` - Move starter code to app-example/ and create blank app/ directory

## Architecture

### Navigation Structure
The app uses Expo Router with file-based routing:
- `app/_layout.tsx` - Root layout with Stack navigator, custom Header component, and theme provider
- `app/(tabs)/_layout.tsx` - Tab navigation layout with 5 tabs (index, programs, exercises, stats, profile)
- `app/modal.tsx` - Modal screen example
- `unstable_settings.anchor` is set to '(tabs)' in app/_layout.tsx:9-11

### Tab Navigation
Five main tabs configured in app/(tabs)/_layout.tsx:
1. **index** - Home/play screen (home icon)
2. **programs** - Programs screen (calendar icon)
3. **exercises** - Exercise library screen (barbell icon)
4. **stats** - Statistics screen (stats-chart icon)
5. **profile** - User profile screen (person icon)

Tab bar features:
- Uses HapticTab component for tactile feedback
- No text labels (tabBarShowLabel: false)
- BlurView background on iOS, solid color on Android
- Icon containers with rounded backgrounds when active
- Tint colors from theme system

### Active Program System
The app implements an active program system for workout management:
- **Active Program Selection**: Users can set one program as "active" using the play icon button on program cards
- **Active Program Storage**: Stored via `program-storage.ts` with functions `setActiveProgramId()`, `getActiveProgramId()`, `clearActiveProgramId()`
- **Active Program Hook**: `useActiveProgram.ts` provides `setActive()`, `clearActive()`, and `program` state
- **Workout Integration**: The "Start Workout" button on the home tab uses the active program's next training day
- **UI Behavior**: Active programs display at the top of the Programs tab and are removed from the "All Programs" list

### Programs Page Layout (`app/(tabs)/programs.tsx`)
The Programs tab displays content in the following order:
1. **Active Program** - Shows the currently active program (or empty state if none selected)
2. **Current Training Day** - Displays the next training day from the active program with exercises
3. **All Programs** - User's programs excluding the active one, each with a "Set Active" button
4. **Create Program** - Button to launch the program creation wizard
5. **Program Templates** - Pre-built program templates that can be added to user's library

Key features:
- Programs can be simple (rotating training days) or periodized (mesocycles/microcycles)
- Each non-active program card shows a "Set Active" button (play icon)
- Active program shows "Active" badge and no "Set Active" button
- Delete button works on all programs including active
- Expanding program cards shows full structure including training days and exercises

### Program Creation Wizard (`app/program-wizard/`)
Multi-step wizard for creating periodized training programs with the hierarchy:
**Mesocycle → Microcycle (weeks) → Training Days → Exercises**

**Wizard Screens**:
- `index.tsx` - Step 1: Mesocycle info (name, description, goal, duration)
- `microcycles.tsx` - Step 2: Manage weeks with volume/intensity targets
- `training-days.tsx` - Step 3: Edit training day name and exercises
- `exercise-selector.tsx` - Step 4: Select exercises from library or create new
- `preview.tsx` - Step 5: Review structure and save program

**State Management** (`contexts/ProgramWizardContext.tsx`):
- `WizardState` - Holds mesocycle info, microcycles array, navigation indices
- `WizardMicrocycle` - Week with tempId, weekNumber, name, volume/intensity targets, trainingDays
- `WizardTrainingDay` - Day with tempId, name, description, exercises array
- Actions: `setMesocycleInfo()`, `addMicrocycle()`, `addTrainingDay()`, `addExercise()`, etc.
- `saveProgram()` - Transforms wizard state to Program type and saves via `usePrograms()`

**Draft Persistence**:
- Auto-saves wizard state to AsyncStorage on changes (debounced 500ms)
- Auto-loads draft on wizard open with "Draft restored" banner
- Close dialog offers "Save Draft" or "Discard" options
- "Start Fresh" button to discard draft and begin new program
- Draft cleared automatically after successful program creation
- Storage key: `program_wizard_draft`

**Entry Point**: "New Periodized Program" button in Programs tab → `router.push('/program-wizard')`

### Exercises Page Layout (`app/(tabs)/exercises.tsx`)
Dedicated page for managing the exercise library:
- Header with exercise count
- "Add Exercise" button to create new exercises
- Grid of exercise cards showing:
  - Muscle category icon with color coding
  - Exercise name
  - Muscle category and subcategory
  - Equipment type
- Auto-refreshes when navigating back from exercise creation form
- Empty state prompts user to add first exercise

### Home Page Integration (`app/(tabs)/index.tsx`)
The home tab integrates with the active program system:
- **Start Workout Button**: Primary action that starts a workout session using the active program
  - Validates active program exists before starting
  - Uses the next training day from the active program
  - Creates a new workout session via `startSession(programId, trainingDayId)`
  - Shows appropriate error messages if no active program or training days
- **Next on the Menu**: Displays preview of the next training day from active program
- **Look Back**: Shows last completed session and previous instance of the current training day
- **Recent Activity**: Displays workout count and streak statistics

### Theming System
Theme configuration in constants/theme.ts:
- **Colors** - Light/dark mode color definitions for text, background, tint, icons
  - `primaryButton` / `primaryButtonText` - Customizable primary action button colors (independent of tint)
- **Fonts** - Platform-specific font families (iOS system fonts, web fonts, default)
- Colors accessed via `Colors[colorScheme].propertyName`

Color scheme detection:
- `hooks/use-color-scheme.ts` - Native platforms (re-exports from react-native)
- `hooks/use-color-scheme.web.ts` - Web platform override
- `hooks/use-theme-color.ts` - Hook for getting theme-aware colors with light/dark overrides

### Component Architecture
**Themed Components** (support light/dark modes):
- `ThemedText` - Text with predefined types (default, title, subtitle, link, defaultSemiBold)
- `ThemedView` - View component with theme-aware background colors

**UI Components**:
- `ui/header.tsx` - Custom header with SafeAreaView and theme support
- `ui/icon-symbol.tsx` - Cross-platform icon wrapper (iOS-specific variant exists)
- `ui/collapsible.tsx` - Collapsible/expandable UI component
- `haptic-tab.tsx` - Tab button with haptic feedback
- `parallax-scroll-view.tsx` - Scroll view with parallax effect

### Path Aliases
TypeScript path alias configured in tsconfig.json:6-8:
- `@/*` maps to project root
- Usage: `import { Header } from '@/components/ui/header'`

### Platform-Specific Code
Platform variants supported:
- `.web.ts/.tsx` - Web-specific implementations
- `.ios.tsx` - iOS-specific implementations (e.g., icon-symbol.ios.tsx)
- Use `Platform.select()` for inline platform-specific logic (see constants/theme.ts:30-53)

### BlurView Usage
The app uses `expo-blur` BlurView for glassmorphism effects:
- Tab bar background (iOS only, app/(tabs)/_layout.tsx:22-26)
- Ensure BlurView has overflow: 'hidden' with borderRadius
- Fallback to solid colors on Android

## TypeScript Configuration
- Strict mode enabled
- Extends expo/tsconfig.base
- Includes all .ts/.tsx files, .expo/types, and expo-env.d.ts

## Styling Conventions
- StyleSheet.create() for component styles
- Theme colors via useThemeColor or Colors[colorScheme]
- No inline styles for static values
- Platform-specific styles via Platform.select() or platform files

## Data Storage & Management

### OpenAPI Spec as Source of Truth
**IMPORTANT**: The `openapi.yaml` file is the single source of truth for all data models. When creating or modifying TypeScript interfaces:
- All type definitions must align with the schemas defined in `openapi.yaml`
- Field names must match exactly (e.g., use `name` not `trainingDayName`)
- If a new field is needed, flag it for addition to the OpenAPI spec first
- This ensures consistency between the app and future API integration (Phase B)

### Type System
TypeScript types defined in `types/training.ts` based on OpenAPI spec (openapi.yaml):
- **TrainingSet** - Individual set tracking (weight, reps, RIR, RPE, quality)
- **TrainingExercise** - Exercise details with muscle targeting, equipment, target rep ranges
- **TrainingDay** - Training day with exercises array
- **Program** - Training program (simple or periodized)
- **MuscleCategory** enum - Quads, Glutes, Hamstrings, Calves, Abs, Chest, Delts, Back
- **MuscleSubcategory** types - Chest (Upper/Middle/Lower), Delts (Front/Lateral/Rear), Back (various trap/lat positions)

Additional storage types in `types/storage.ts`:
- **StorageItem** - Wrapper for stored data with metadata
- **StorageConfig** - App configuration and user ID
- **WorkoutSession** - Active and completed workout sessions (fields must match OpenAPI spec)

### Local Storage System (Phase A - Implemented)
The app uses `@react-native-async-storage/async-storage` for offline-first data persistence.

**Storage Services** (`services/storage/`):
- `storage-client.ts` - AsyncStorage wrapper with error handling
- `base-storage.ts` - Generic CRUD operations for entities
- `program-storage.ts` - Program storage and active program tracking
- `training-day-storage.ts` - Training day storage
- `exercise-storage.ts` - Exercise management
- `stats-storage.ts` - User statistics tracking
- `personal-records-storage.ts` - Personal record tracking
- `session-storage.ts` - Workout session storage with month partitioning
- `config.ts` - Storage keys and configuration

**Storage Context** (`contexts/StorageContext.tsx`):
- Initializes storage on app launch
- Generates anonymous user ID for storage namespacing
- Manages onboarding state
- Provides `userId` and `isInitialized` to the app

**Template Loader** (`services/storage/template-loader.ts`):
- Load sample program templates into user storage
- Allows users to explore pre-built programs
- Functions: `loadTemplate()`, `loadAllTemplates()`, `getTemplateInfo()`

**React Hooks** (`hooks/`):
All hooks use the new storage system:
- `usePrograms.ts` - Manage training programs (CRUD operations)
- `useActiveProgram.ts` - Get/set active program, provides `setActive()`, `clearActive()`, `refetch()`
- `useExercises.ts` - Manage exercise library (CRUD operations)
- `useTrainingDay.ts` - Fetch specific training day
- `useWorkoutSession.ts` - Manage active workout sessions, provides `startSession()`, `addSet()`, `completeSession()`
- `useStats.ts` - User statistics and personal records

**Key Features**:
- **Offline-first**: All data stored locally on device
- **No network required**: App works completely offline
- **Namespaced storage**: Each user has isolated data
- **Type-safe**: Full TypeScript support
- **Persistent**: Data survives app restarts

**Onboarding Flow**:
1. App launch → Storage initialization
2. Generate anonymous user ID if first time
3. Show onboarding if `onboardingCompleted` is false
4. Route to main app after onboarding

**Weekly Activity Tracking**:
The stats page (`app/(tabs)/stats.tsx`) calculates weekly activity from actual workout session history. The weekly activity grid shows which days in the last 7 days had completed workouts, with real-time completion rate calculation.

### Future: Phase B (Planned)
Phase B will add authentication and cloud sync for premium users:
- Authentication system (signup/login)
- Cloud sync for subscribed users
- Data migration from anonymous to authenticated users
- Offline queue for syncing changes

See `.claude/plans/mutable-whistling-spring.md` for full implementation plan.

**Note on Legacy Files**:
- `services/api/data-source.ts` is kept for Phase B API integration (marked as deprecated for Phase A)
- Current Phase A implementation uses storage hooks exclusively
- API endpoints documentation in `services/api/README.md` will be integrated in Phase B
