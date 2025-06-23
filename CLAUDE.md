# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production 
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React + TypeScript audio identification frontend built with Vite. The app records audio, sends it to a FastAPI backend for music identification, and displays results.

### Key Architecture Patterns

**State Management**: Uses React hooks with a centralized `AppState` type that controls the main UI flow:
- `initial` → `recording` → `processing` → `result` | `error`

**Audio Processing**: The `useAudioRecording` hook handles:
- MediaRecorder API for 7-second audio capture
- Web Audio API for real-time frequency visualization
- Automatic cleanup of audio resources

**API Integration**: `musicApi.ts` service handles:
- Rate limiting (10-second cooldown between requests)
- Client ID generation and persistence
- Backend response transformation from FastAPI format to frontend types

**Component Structure**:
- `App.tsx` - Main state machine and UI orchestration
- `components/` - Reusable UI components with consistent styling
- `hooks/useAudioRecording.ts` - Audio capture and visualization logic
- `services/musicApi.ts` - Backend API communication
- `types/index.ts` - TypeScript interfaces for both backend and frontend data

### Environment Configuration

The app expects `VITE_API_BASE_URL` environment variable for the backend API URL (defaults to `http://localhost:8000`).

### Styling System

Uses Tailwind CSS with custom design tokens:
- Custom color palette with accent gradients (`accent-start`, `accent-end`)
- Custom animations for audio visualization and UI feedback
- Responsive design optimized for mobile-first approach

### Audio Visualization

Real-time frequency analysis creates a 32-bar waveform visualization during recording using Web Audio API's AnalyserNode with 256 FFT size.