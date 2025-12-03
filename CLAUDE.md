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
- `app/(tabs)/_layout.tsx` - Tab navigation layout with 4 tabs (index, programs, stats, profile)
- `app/modal.tsx` - Modal screen example
- `unstable_settings.anchor` is set to '(tabs)' in app/_layout.tsx:9-11

### Tab Navigation
Four main tabs configured in app/(tabs)/_layout.tsx:32-56:
1. **index** - Home/play screen (play-circle icon)
2. **programs** - Programs screen (code icon)
3. **stats** - Statistics screen (stats-chart icon)
4. **profile** - User profile screen (person-circle icon)

Tab bar features:
- Uses HapticTab component for tactile feedback
- No text labels (tabBarShowLabel: false)
- BlurView background on iOS, solid color on Android
- Rounded top corners (25px radius)
- Tint colors from theme system

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
- **WorkoutSession** - Active and completed workout sessions

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
- `usePrograms.ts` - Manage training programs
- `useActiveProgram.ts` - Get/set active program
- `useTrainingDay.ts` - Fetch specific training day
- `useWorkoutSession.ts` - Manage active workout sessions
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
