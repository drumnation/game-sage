Project Title & Description
Title: GameSage

Tagline: Your AI-powered gaming strategist, commentator, and companion.

GitHub Repository Description:

GameSage is an Electron-React application powered by TypeScript and OpenAI Vision APIs. It periodically captures gameplay screenshots, analyzes them in real-time, and provides mode-specific insights—ranging from tactical suggestions and character build advice to e-sports-style commentary. Designed for extensibility, GameSage supports multiple games, custom profiles, and a variety of interaction modes, including voice commands. Built with Electron, React, Redux Toolkit, Styled Components, and Ant Design, it aims to seamlessly blend into your gaming experience and enhance decision-making, entertainment, and immersion.

Additional Features to Consider
Mode Variations:

Tactical Advisor Mode: Provides strategic suggestions, build optimizations, and recommended choices for items, routes, and leveling strategies.
Commentary Mode: Acts like a seasoned commentator, providing play-by-play breakdowns, highlighting significant moments, and offering narrative flavor.
E-Sports Cast Mode: Delivers high-energy casting similar to professional tournament streams, including player performance highlights, clutch moments, and hype-driven narration.
Voice Input & Output:
Integrate a voice assistant feature for hands-free queries and responses, using a library like @electron/remote plus a local speech-to-text engine or a web API where feasible.

Custom Hotkeys & On-Demand Capture:
Allow toggling between continuous capture and on-demand capture using a global keyboard shortcut.

Visual Enhancements:
Incorporate small game-related icons next to recommended items or abilities if available from a local asset library or through game-specific integrations.

Pluggable Game Profiles:
Let users select or create profiles tailored to specific games. Each profile can define unique prompt templates and logic, making GameSage adaptable to any title.

Performance Monitoring:
Track the AI latency, screenshot processing times, and memory usage. Log this data to help optimize performance.

Overall Development Plan (High-Level)
Project Setup & Basic Architecture:

Initialize Electron + React project using a minimal, Vite-based Electron starter.
Integrate TypeScript, Redux Toolkit, Styled Components, and Ant Design.
Establish directory structure and coding conventions.
Screenshot Management System:

Implement periodic and on-demand screenshot capture.
Support multiple monitors and configurable intervals.
Introduce image processing (compression, format handling) and scene change detection.
AI Integration & Prompting:

Connect to OpenAI Vision APIs and handle authentication.
Implement a prompt management system, defining unique templates for each mode.
Handle AI responses, including parsing, error handling, and state management for conversation context.
Game Profiles & Configurations:

Design a data model for game profiles.
Implement logic to load, edit, and switch between profiles.
Persist user settings and performance metrics locally.
UI/UX Implementation:

Create main window with start screen, mode selection, and game selection input.
Implement the multi-mode interface and a real-time advice/commentary panel.
Add voice interaction UI elements (push-to-talk button, mic status indicator).
Style using Styled Components and Ant Design for a polished look.
Testing & Optimization:

Set up unit and integration tests for critical components (e.g., screenshot capture, AI response parsing).
Optimize performance, caching, and memory usage.
Iterate on UI/UX improvements based on test feedback.
Phase Prompting Strategy
Below are the prompts you can use in separate phases. Each prompt assumes the previous phase is complete and stable. After implementing one phase, move on to the next.

General Instructions for the Agent (or Composer Mode in Cursor):

Consistency: For each phase, provide detailed technical specifications, code examples, and architectural guidance.
Iteration: After completing a phase, review any issues or challenges before moving to the next.
Specificity: Always specify dependencies, versions, and test approaches.
Context: Begin each new prompt with a short summary of the current project state.
Follow-Up: End each phase prompt by asking if any unclear areas need refinement or if there are alternative solutions.
