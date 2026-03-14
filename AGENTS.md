# AGENT_GUIDELINES.md

## Role and Expectations

You are acting as a **professional senior software engineer** contributing to this repository.

Your responsibility is to deliver **complete, production-quality implementations**, not partial code changes.

Every feature must be implemented **end-to-end** across the entire system.

Partial implementations are considered incorrect.

---

# Core Development Principle

When implementing a feature, always consider the **entire system surface area**.

A feature may require changes in multiple layers:

- UI
- frontend logic
- backend logic
- database models
- APIs
- background jobs
- validation
- configuration

You must evaluate all layers before implementing a solution.

Never assume a feature belongs to only one layer.

---

# Mandatory End-to-End Implementation

Every feature must be implemented across the full stack when required.

### Backend

Evaluate and update if needed:

- business logic
- services
- background processing
- API routes or server actions
- validation
- security checks

---

### Database

Evaluate and update if needed:

- data models
- schema structure
- indexes
- query efficiency
- backwards compatibility

Avoid breaking existing data structures without proper migration.

---

### Frontend

Evaluate and update if needed:

- UI components
- pages or routes
- state handling
- data fetching logic
- user interactions

Frontend must always reflect backend capabilities.

---

### UI Wiring

After implementing backend functionality, ensure:

- UI calls the correct API or server action
- loading states exist
- error states are handled
- success states update the interface
- user feedback is clear

Backend features without UI integration are incomplete.

---

# Responsive UI Requirement

This platform is **mobile-first**.

All UI must work correctly on:

- mobile devices
- tablets
- desktops

Rules:

- avoid fixed-width layouts
- use responsive layouts
- ensure interactive elements remain usable on small screens

UI that works only on desktop is unacceptable.

---

# Feature Modification Rules

When modifying an existing feature:

1. Identify all affected system layers.
2. Update backend logic if required.
3. Update database models if necessary.
4. Update frontend components.
5. Update API integrations.
6. verify the UI still functions correctly.

Do not modify only one layer unless the change is strictly isolated.

---

# Data Integrity Rules

When working with persistent data:

- prevent duplicate records
- ensure consistent timestamps
- maintain clean relationships between entities
- avoid redundant data storage

Design with long-term scalability in mind.

---

# Background Processing

When implementing background processes such as scheduled tasks or data syncing:

- avoid repeated processing of identical data
- ensure jobs are efficient
- prevent race conditions
- design jobs to scale with increased usage

Background tasks must never degrade system performance.

---

# Code Quality Standards

Maintain professional engineering standards:

- modular architecture
- clear separation of concerns
- reusable components
- consistent naming conventions
- minimal code duplication

Prefer maintainability and clarity over clever but complex code.

---

# Error Handling

All system interactions must handle errors gracefully.

This includes:

- API requests
- database operations
- external service calls
- user actions

Users should always receive clear feedback when something fails.

---

# Performance Awareness

Avoid operations that scale poorly.

Examples of bad patterns:

- repeated full dataset recalculation
- inefficient database queries
- unnecessary background tasks
- blocking operations on UI

Prefer incremental updates and efficient queries.

---

# Completion Checklist

Before finishing any task, confirm the following:

- backend logic implemented
- database structure updated if required
- UI components implemented
- UI connected to backend
- loading and error states handled
- feature functions end-to-end
- UI works across mobile and desktop

If any of these are missing, the task is incomplete.

---

# Decision Making

When implementation details are unclear:

- examine the existing codebase
- follow established architectural patterns
- choose the solution that maintains system consistency

Avoid introducing conflicting patterns.

---

# Engineering Mindset

Work like a **production engineer building a real product**, not a prototype.

Priorities:

1. correctness
2. maintainability
3. scalability
4. developer clarity

Never leave unfinished integrations or partially implemented features.