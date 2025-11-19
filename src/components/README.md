# 🎨 Reusable Components

This folder contains reusable React components extracted from the main AgenticChat component for better modularity and maintainability. These components are designed to work seamlessly with CopilotKit's tool rendering system.

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
