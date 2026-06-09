# Bolic.App — Mobile Training Platform

**Bolic.App** is the mobile companion to the [Bolic training platform](https://github.com/markus-bcit/Bolic.Backend) — a functionally designed, science-based fitness training app built with **React Native**, **Expo Router**, and **TypeScript**.

The app provides an offline-first training experience with local storage, allowing users to track workouts, manage programs (simple or periodized), and follow science-based training principles without requiring constant connectivity.

> **Backend Repository**: See [Bolic.Backend](https://github.com/markus-bcit/Bolic.Backend) for the Azure Functions backend with functional C# and LanguageExt v5.

---

## Philosophy

Bolic is designed for **SBLs (Science Based Lifters)** who want to track their training in the most optimal way. The app implements:

- **Periodization models** (mesocycles, microcycles, training days)
- **Science-based metrics** (RIR, RPE, target positions)
- **Progressive overload tracking** with real-time feedback
- **Offline-first architecture** for uninterrupted training sessions

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

---

## Architecture Overview

### Phase A: Local Storage (Current)
The app runs **100% offline** using AsyncStorage for data persistence.

**Key Components:**
- `services/storage/` — CRUD operations for all entities
- `contexts/StorageContext.tsx` — Anonymous user ID and storage initialization
- `contexts/WorkoutSessionContext.tsx` — Shared workout session state across all components
- `contexts/WorkoutUIContext.tsx` — Expanded/minimized state for the workout interface
- `contexts/ThemeContext.tsx` — Accent color customization and user preferences
- `hooks/` — React hooks for programs, training days, and stats

**Features:**
- Anonymous user accounts (no signup required)
- Onboarding flow with storage initialization
- Program templates (Upper/Lower Split, Periodized Full Body)
- Workout session tracking with set-by-set logging
- Exercise swap during active sessions
- Personal records and statistics
- Data import/export (JSON)
- Custom accent color themes
- Weight unit preference (kg/lbs)
- Per-session day override (start a different day than auto-calculated next)

---

## Project Structure

```
app/                          # Expo Router pages
├── (tabs)/                  # Tab navigation
│   ├── index.tsx            # Home / start workout
│   ├── programs.tsx         # Program management
│   ├── exercises.tsx        # Exercise library
│   ├── stats.tsx            # Statistics and weekly activity
│   └── profile.tsx          # Settings, theme, import/export
├── simple-program-wizard/   # Multi-step program creation
│   ├── index.tsx            # Wizard entry (name + type)
│   ├── training-days.tsx    # Configure training days
│   ├── day-editor.tsx       # Edit exercises per day
│   ├── exercise-selector.tsx # Pick exercises for a day
│   └── preview.tsx          # Review before saving
├── exercise-form.tsx        # Create / edit exercise
├── program-edit.tsx         # Edit existing program
├── select-training-day.tsx  # Override next training day
├── session-detail.tsx       # View completed session
├── training-day-detail.tsx  # View training day exercises
├── history.tsx              # Session history
└── onboarding.tsx           # First-time user onboarding

components/
├── workout/                 # Full workout tracking UI
│   ├── WorkoutInterface.tsx  # Top-level session view
│   ├── WorkoutHeader.tsx
│   ├── WorkoutTimer.tsx
│   ├── WorkoutProgressBar.tsx
│   ├── ExerciseList.tsx
│   ├── ExerciseCard.tsx
│   ├── SetListItem.tsx
│   ├── SetEditor.tsx
│   ├── PreviousPerformance.tsx
│   ├── ExerciseSwapModal.tsx
│   ├── CompletionModal.tsx
│   └── ActiveWorkoutBanner.tsx
└── ui/                      # Header, icons, collapsibles

contexts/
├── StorageContext.tsx        # Anonymous user ID + initialization
├── WorkoutSessionContext.tsx # Session state, startSession, addSet, etc.
├── WorkoutUIContext.tsx      # Expanded/minimized workout panel state
├── ThemeContext.tsx          # Accent colors + user preferences
└── SimpleProgramWizardContext.tsx

hooks/
├── useActiveProgram.ts      # Get/set active program
├── usePrograms.ts           # CRUD for training programs
├── useExercises.ts          # CRUD for exercise library
├── useTrainingDay.ts        # Fetch a specific training day
└── useStats.ts              # User stats and personal records

services/
├── storage/                 # AsyncStorage abstraction layer
│   ├── base-storage.ts
│   ├── program-storage.ts
│   ├── training-day-storage.ts
│   ├── exercise-storage.ts
│   ├── session-storage.ts
│   ├── stats-storage.ts
│   ├── personal-records-storage.ts
│   └── storage-export.ts    # JSON import/export

utils/
├── day-override-store.ts    # Persist user-selected training day override
├── weight.ts                # kg/lbs conversion
├── workout-helpers.ts       # Shared workout calculation utilities
└── storage-helpers.ts       # ID generation, timestamps

types/
├── training.ts              # Core training types (aligned with openapi.yaml)
└── storage.ts               # Storage wrapper types

data/
└── program-templates.ts     # Pre-built program templates
```

---

## Features

### Program Management
- **Simple Programs**: Rotating training days (e.g., Upper/Lower split)
- **Periodized Programs**: Full mesocycle/microcycle structure
- **Templates**: Pre-built programs to get started quickly
- **Program Wizard**: Multi-step creation flow for simple programs

### Workout Tracking
- Set-by-set logging with weight, reps, RIR, RPE, and quality score
- Real-time session timer
- Exercise swap mid-session
- Previous performance shown per exercise during session
- "Choose a different day" override before starting
- Look Back section shows last session and previous instance of today's training day

### Progress Tracking
- Personal records with automatic detection
- Weekly activity grid (last 7 days)
- Total workouts and current streak
- Session history with full set details

### Customization
- Accent color picker (preset and custom hex)
- Weight unit toggle (kg / lbs)
- Toggle RIR, RPE, and notes display per set
- Data export to JSON file
- Data import from JSON file

---

## Type System

The app uses a comprehensive type system based on `openapi.yaml` as the source of truth:

```typescript
// Core training structures
Program → Mesocycle → Microcycle → TrainingDay → TrainingExercise → TrainingSet

// Storage wrappers
StorageItem<T> {
  id: string;
  userId: string;
  data: T;
  createdAt: string;
  updatedAt: string;
}

// Session tracking
WorkoutSession {
  programId: string;
  trainingDayId: string;
  exercises: SessionExercise[];
  startedAt: string;
  completedAt: string | null;
}
```

See [`types/training.ts`](types/training.ts) for complete type definitions.

---

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Routing**: Expo Router (file-based)
- **Storage**: @react-native-async-storage/async-storage
- **State**: React Context + Hooks
- **Styling**: StyleSheet with theme system + LinearGradient
- **Icons**: Ionicons (via @expo/vector-icons)
- **Build**: EAS Build
- **CI/CD**: GitHub Actions

---

## Building for Production

### EAS Build (Recommended)

```bash
# Build for TestFlight (triggered automatically on tag push)
git tag 1.0.5
git push origin 1.0.5

# Manual build
eas build --platform ios --profile production
```

The app uses GitHub Actions for CI/CD. See [`.github/workflows/build.yml`](.github/workflows/build.yml).

**Version Management:**
- App version syncs from git tags via `app.config.js`
- Build numbers auto-increment via EAS
- Format: Version 1.0.5 (Build 3)

---

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for the active task list and known issues.

## In the future

Cloud sync and authentication via [Bolic.Backend](https://github.com/markus-bcit/Bolic.Backend).

---

**Built for Science Based Lifters**
