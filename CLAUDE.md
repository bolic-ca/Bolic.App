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

## Data Structure & API Integration

### Type System
TypeScript types defined in `types/training.ts` based on OpenAPI spec (openapi.yaml):
- **TrainingSet** - Individual set tracking (weight, reps, RIR, RPE, quality)
- **TrainingExercise** - Exercise details with muscle targeting, equipment, target rep ranges
- **TrainingDay** - Training day with exercises array
- **MuscleCategory** enum - Quads, Glutes, Hamstrings, Calves, Abs, Chest, Delts, Back
- **MuscleSubcategory** types - Chest (Upper/Middle/Lower), Delts (Front/Lateral/Rear), Back (various trap/lat positions)

### Mock Data
Development mock data in `data/mock-data.ts`:
- `mockPrograms` - Training program summaries
- `mockTrainingDay` - Sample training day with exercises and sets
- `mockWorkoutStats` - User workout statistics
- `mockPersonalRecords` - PR tracking data
- `mockWeeklyActivity` - Weekly completion tracking

All mock data structured according to API schema for seamless future integration.

### API Reference
Backend API spec: `openapi.yaml`
- Endpoints: `/training-days`, `/exercises`, `/training-session`
- Science-based metrics: RIR (Reps In Reserve), RPE (Rate of Perceived Exertion)
- Target position tracking (lengthened, shortened)
- Muscle-specific subcategories for precise tracking
