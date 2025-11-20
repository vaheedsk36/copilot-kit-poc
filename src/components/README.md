# 🏗️ Components Architecture

This directory contains React components following a modular, scalable architecture for the CopilotKit POC application.

## 🏛️ Architectural Principles

### 1. **Component Composition Pattern**
- Components are composed rather than inherited
- Each component has a single, clear responsibility
- Complex UIs are built by combining simpler components

### 2. **Separation of Concerns**
- **UI Components**: Pure presentation components
- **Container Components**: Handle data and state logic
- **HOC/Components**: Handle cross-cutting concerns (AI, loading, errors)

### 3. **Design System First**
- Consistent styling through design tokens
- Reusable UI primitives
- Theme-aware components

### 4. **Performance Optimized**
- Memoization where appropriate
- Lazy loading for heavy components
- Efficient re-rendering strategies

### 5. **Type Safety**
- Strict TypeScript usage
- Shared type definitions
- Runtime type validation

### 6. **DRY (Don't Repeat Yourself)**
- Extract common logic into utilities
- Create reusable hooks
- Avoid code duplication

## 📁 Directory Structure

```
src/components/
├── core/                    # Core architectural components
│   ├── ui/                 # Design system primitives
│   ├── layout/             # Layout components
│   ├── providers/          # Context providers
│   └── hooks/              # Custom hooks
├── widgets/                # Dashboard widgets
│   ├── charts/             # Chart components
│   ├── cards/              # Card components
│   ├── tables/             # Table components
│   └── shared/             # Shared widget utilities
├── ai/                     # AI-powered components
│   ├── chat/               # Chat interfaces
│   ├── tools/              # AI tool integrations
│   └── assistants/         # AI assistant components
├── forms/                  # Form components
├── feedback/               # Loading, error, skeleton components
├── types.ts               # Shared type definitions
├── index.ts               # Public API exports
└── README.md             # This file
```

## Components

### 🎯 `CampaignDaypartingForm`
A comprehensive form component for setting up campaign dayparting with:
- Campaign name input
- Platform selection (Amazon, Flipkart, Myntra, etc.)
- Week-level day selection with checkboxes
- Day-level time slot configuration
- Form validation and submission handling

**Props:**
```typescript
interface CampaignDaypartingFormProps {
  campaignData: CampaignData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignData>>;
  onSubmit: () => void;
  isHumanInTheLoop?: boolean;
}
```

**Usage:**
```tsx
<CampaignDaypartingForm
  campaignData={campaignData}
  setCampaignData={setCampaignData}
  onSubmit={handleSubmit}
  isHumanInTheLoop={false}
/>
```

### 📊 `LineGraphWidget`
A wrapper component for displaying line graphs with loading states.

**Props:**
```typescript
interface LineGraphWidgetProps {
  data: any;
  status: string;
}
```

**Usage:**
```tsx
<LineGraphWidget data={graphData} status="complete" />
```

## Types

### `CampaignData`
```typescript
interface CampaignData {
  name: string;
  platform: string;
  selectedDays: string[];
  timeSlots: Record<string, string[]>;
}
```

## Architecture Benefits

1. **Separation of Concerns**: UI logic separated from business logic
2. **Reusability**: Components can be used in multiple places
3. **Maintainability**: Easier to test and modify individual components
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Clean Code**: Main component is now more focused and readable

## File Structure

```
src/components/
├── index.ts              # Barrel exports
├── types.ts              # Shared type definitions
├── CampaignDaypartingForm.tsx  # Campaign setup form
├── LineGraphWidget.tsx   # Graph display widget
└── README.md            # This documentation
```

## Integration

Components are integrated into the main `AgenticChat.tsx` through CopilotKit's render functions:

- `collect_user_prefs` tool uses `CampaignDaypartingForm`
- `render_line_graph` tool uses `LineGraphWidget`
- Human-in-the-Loop tool also uses `CampaignDaypartingForm`

All components maintain the same functionality while being more modular and reusable.
