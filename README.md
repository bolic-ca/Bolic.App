# 📱 Bolic.App — Mobile Training Platform

**Bolic.App** is the mobile companion to the [Bolic training platform](https://github.com/markus-bcit/Bolic.Backend) — a functionally designed, science-based fitness training app built with **React Native**, **Expo Router**, and **TypeScript**.

The app provides an offline-first training experience with local storage, allowing users to track workouts, manage programs (simple or periodized), and follow science-based training principles without requiring constant connectivity.

> **Backend Repository**: See [Bolic.Backend](https://github.com/markus-bcit/Bolic.Backend) for the Azure Functions backend with functional C# and LanguageExt v5.

---

## 🎯 Philosophy

Bolic is designed for **SBLs (Science Based Lifters)** who want to track their training in the most optimal way. The app implements:

- **Periodization models** (mesocycles, microcycles, training days)
- **Science-based metrics** (RIR, RPE, target positions)
- **Progressive overload tracking** with real-time feedback
- **Offline-first architecture** for uninterrupted training sessions

---

## 🚀 Quick Start

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

## 🏗️ Architecture Overview

### **Phase A: Local Storage (✅ Current)**
The app runs **100% offline** using AsyncStorage for data persistence.

**Key Components:**
- `services/storage/` — CRUD operations for all entities
- `contexts/StorageContext.tsx` — Anonymous user ID and storage initialization
- `hooks/` — React hooks for programs, training days, sessions, and stats

**Features:**
- ✅ Anonymous user accounts (no signup required)
- ✅ Onboarding flow with storage initialization
- ✅ Program templates (Upper/Lower Split, Periodized Full Body)
- ✅ Workout session tracking with set-by-set logging
- ✅ Personal records and statistics

### **Phase B: Cloud Sync (📋 Planned)**
Future integration with [Bolic.Backend](https://github.com/markus-bcit/Bolic.Backend):
- Authentication (signup/login)
- Cloud sync for premium users
- Data migration from anonymous to authenticated accounts
- Offline queue for syncing changes

See [`.claude/plans/mutable-whistling-spring.md`](.claude/plans/mutable-whistling-spring.md) for the full implementation plan.

---

## 📦 Project Structure

```
app/                      # Expo Router pages
├── (tabs)/              # Tab navigation (home, programs, stats, profile)
├── onboarding.tsx       # First-time user onboarding
└── _layout.tsx          # Root layout with storage provider

components/              # Reusable UI components
├── ui/                  # Header, icons, collapsibles
└── ThemedText.tsx       # Theme-aware components

services/
├── storage/             # AsyncStorage abstraction layer
│   ├── base-storage.ts          # Generic CRUD operations
│   ├── program-storage.ts       # Program management
│   ├── training-day-storage.ts  # Training day storage
│   ├── session-storage.ts       # Workout session tracking
│   ├── stats-storage.ts         # User statistics
│   └── template-loader.ts       # Load program templates

hooks/                   # React hooks for storage access
├── usePrograms.ts       # Manage training programs
├── useActiveProgram.ts  # Get/set active program
├── useWorkoutSession.ts # Track active workout
└── useStats.ts          # User stats and PRs

types/
├── training.ts          # Core training types
└── storage.ts           # Storage wrapper types

data/
└── program-templates.ts # Pre-built program templates
```

---

## 🎨 Features

### **Program Management**
- **Simple Programs**: Rotating training days (e.g., Upper/Lower split)
- **Periodized Programs**: Full mesocycle/microcycle structure
- **Templates**: Pre-built programs to get started quickly

### **Workout Tracking**
- Set-by-set logging with weight, reps, RIR, and RPE
- Real-time session tracking with pause/resume
- Historical session data with monthly partitioning

### **Progress Tracking**
- Personal records with automatic detection
- Volume and intensity tracking
- Workout streaks and statistics

---

## 🔗 Related Repositories

- **[Bolic.Backend](https://github.com/markus-bcit/Bolic.Backend)** — Azure Functions backend with functional C# and LanguageExt v5

---

## 📖 Type System

The app uses a comprehensive type system based on the OpenAPI spec:

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

## 🛠️ Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Routing**: Expo Router (file-based)
- **Storage**: @react-native-async-storage/async-storage
- **State**: React Context + Hooks
- **Styling**: StyleSheet with theme system
- **Build**: EAS Build
- **CI/CD**: GitHub Actions

---

## 📱 Building for Production

### **EAS Build (Recommended)**

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

## 🎯 Roadmap

### Phase A: Local Storage ✅
- [ ] AsyncStorage foundation
- [ ] Anonymous user accounts
- [ ] Program and session management
- [ ] Statistics and personal records
- [ ] Onboarding flow
- [ ] Program templates

### Phase B: Cloud Sync (Next)
- [ ] Authentication system
- [ ] Backend integration with Bolic.Backend
- [ ] Offline sync queue
- [ ] Data migration for existing users

### Phase C: Social Features (Future)
- [ ] Share programs with other users
- [ ] Community templates
- [ ] Progress photos and notes
- [ ] Coach/athlete relationships

---

---

**Built with 💪 for Science Based Lifters**
