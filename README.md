# Bolic.App - Moble UI

Mobile UI for the Bolic training platform, a science-based hypertrophy focused fitness training app

<table
  <tr>
    <td><img src="http://raw.githubusercontent.com/bolic-ca/bolic.ca/refs/heads/main/public/screenshots/home-dark.PNG" width="300" /></td>
    <td><img src="http://raw.githubusercontent.com/bolic-ca/bolic.ca/refs/heads/main/public/screenshots/training-session-dark.PNG" width="300" /></td>
    <td><img src="http://raw.githubusercontent.com/bolic-ca/bolic.ca/refs/heads/main/public/screenshots/exercises-dark.PNG" width="300" /></td>
  </tr>
</table>

The goal here is to create a simple, easy to use, yet in-depth and metric rich fitness tracking app. Create exercises with metrics down to target muscle positions, include specific rep and RIR ranges as well as any notes to help aid in your training. Set your active program and rotate through your custom training days, or select a specific one.  

Quickly view the previous sets performed in the previous session, or click-in and view the entire history. Swap out your exercises on the fly, either perform the same sequence of exercises, the original day, or keep it as the new training day.

All records/types were created in the [Bolic.Backend](https://github.com/bolic-ca/Bolic.Backend), which I used and intend on using as the root of all flows/records. I'll be shifting most of my focus there for the forseable future aside from maintence/minor features here.

---

## Quick Start

```bash
# Install dependencies
npm i

# Start development server, 
# Note: Runs with --tunnel
npm run start
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
```

---


## Building for Production

The app uses GitHub Actions for CI/CD. See [`.github/workflows/build.yml`](.github/workflows/build.yml).

**Version Management:**
- App version syncs from git tags via `app.config.js`
- Build numbers auto-increment via EAS
- Format: `1.0.5`  
- Deployed to testflight first, then build is manually selected for app store review. 
- No android deployment yet

---

## Roadmap

See [Issues](https://github.com/bolic-ca/Bolic.App/issues) for the active task list and known issues.

