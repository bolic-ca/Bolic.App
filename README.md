# Bolic.App - Moble UI

Mobile UI for the Bolic training platform, a science-based hypertrophy focused fitness training app

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

The app uses a type system based on `openapi.yaml` as the source of truth, a majority of objects aren't used, i.e. perodized programming (the whole meso, macrocycle stuff). Most of the objects used started off as backend records.

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

The app uses GitHub Actions for CI/CD. See [`.github/workflows/build.yml`](.github/workflows/build.yml).

**Version Management:**
- App version syncs from git tags via `app.config.js`
- Build numbers auto-increment via EAS
- Format: Version 1.0.5 (Build 3)

---

## Roadmap

See [Issues](https://github.com/bolic-ca/Bolic.App/issues) for the active task list and known issues.

