# CopilotKit Interactive Playground

A comprehensive hands-on demonstration of all CopilotKit features through an interactive playground interface.

## 🚀 Features Demonstrated

### ✅ **Frontend Actions**
The assistant can interact with the app state through predefined actions:
- `changeTheme` - Change app theme (light/dark/auto)
- `addTodo` - Add new todo items
- `completeTodo` - Mark todos as complete
- `addNotification` - Show notifications
- `updateWeather` - Update weather data
- `deleteAllTodos` - Delete all todos (requires approval)
- `showChart` - Display data visualizations
- `showProgressTracker` - Show progress components
- `showInteractiveForm` - Display forms
- `listMcpServers` - List MCP server capabilities
- `useFileSystem` - File operations via MCP
- `searchWeb` - Web search via MCP

### ✅ **Context Management**
- Full app state awareness (todos, weather, notifications, preferences)
- Real-time state synchronization
- Available features and MCP server information

### ✅ **Generative UI**
- Dynamic chart rendering
- Progress trackers
- Interactive forms with user input collection

### ✅ **Human-in-the-Loop**
- Approval dialogs for sensitive actions (like deleting all todos)
- Interactive confirmation components

### ✅ **Tool Call Rendering**
- Custom loading states during tool execution
- Success/error status displays
- Formatted results and arguments

### ✅ **MCP Integration**
- File System Server (read, write, list operations)
- Git Server (repository management)
- Web Search Server (internet search)
- Server status monitoring

## 🎮 How to Use the Playground

### Start the Application
```bash
npm install
npm run dev
```

### Playground Interface

The application features a split-screen interactive playground:

#### 🏗️ **Left Side - Playground Controls**
Click buttons to trigger CopilotKit features:

**🎯 Frontend Actions:**
- **Toggle Theme** - Changes app theme (light/dark)
- **Add Todo** - Adds a new todo item
- **Add Notification** - Shows a notification
- **Update Weather** - Updates weather data

**🚀 Feature Triggers:**
- **📊 Show Chart** - Demonstrates Generative UI with data visualization
- **📈 Show Progress** - Shows progress tracker component
- **📝 Show Form** - Interactive form with user input
- **🗑️ Delete All Todos** - Human-in-the-Loop approval flow

**🔗 MCP Integration:**
- **📋 List MCP Servers** - Shows available MCP server capabilities
- **📁 File System** - Demonstrates file operations
- **🌐 Web Search** - Shows web search functionality

#### 💬 **Right Side - Chat Interface**
- AI responses and generated UI appear here
- Watch tool execution in real-time
- Experience all CopilotKit features interactively

### Expected Behavior
- **Real-time Updates**: App state changes instantly when buttons are clicked
- **AI Responses**: Every button click triggers an AI response explaining the feature
- **Generative UI**: Charts, forms, and progress bars appear in the chat
- **Approval Flows**: Sensitive actions require user confirmation
- **Tool Execution**: See loading states and results for each action
- **Live State Display**: Watch counters and values update on the left side

## 🏗️ Architecture

### Core Components
- **CopilotSidebar**: Main chat interface
- **useCopilotAction**: Frontend action definitions
- **useCopilotReadable**: Context management
- **useRenderToolCall**: Custom tool UI rendering
- **MCP Servers**: External tool integration

### State Management
- React useState for app state
- Real-time state updates
- Type-safe state management

### UI Framework
- Tailwind CSS for styling
- Clean, modern interface
- Responsive design

## 📊 Build Statistics
- **CSS Bundle**: 58.67 kB (includes all Tailwind classes)
- **JS Bundle**: 1.66 MB (full CopilotKit + React ecosystem)
- **Zero Linting Errors**: Clean, production-ready code

## 🔧 Technical Implementation

### Key Features
- All CopilotKit hooks utilized
- Comprehensive action definitions
- Custom generative UI components
- MCP server configurations
- Human-in-the-loop workflows
- Tool call visualization

### Code Quality
- TypeScript throughout
- Clean component architecture
- Proper error handling
- Production-ready build

This POC serves as a complete reference implementation showcasing every major CopilotKit capability in a focused, demonstrable application.