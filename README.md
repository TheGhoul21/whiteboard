# 🎓 Teaching Whiteboard

A powerful, infinite-canvas whiteboard application designed specifically for creating educational content, coding tutorials, and math explanations. Built with **React**, **Konva**, and **Node.js**.

## ✨ Key Features

### 🖌️ Drawing & Tools
*   **Infinite Canvas:** Pan and zoom freely without limits.
*   **Smooth Pen:** "Fountain pen" style ink with variable pressure simulation (`perfect-freehand`).
*   **Laser Pointer:** Ephemeral ink that fades after 1 second (perfect for highlighting during recording).
*   **Shapes:** Rectangle, Circle, Arrow tools.
*   **Text:** Simple text insertion.

### 🧩 Smart Objects & Paste
Paste rich content directly onto the board with **Cmd+V**:
*   **Code Blocks:** Paste markdown code blocks (e.g., ` ```python ... ``` `). Double-click to edit, hover to change language. Syntax highlighting included.
*   **LaTeX Math:** Paste math formulas (e.g., `$$ \int f(x) dx $$` or ` ```latex ... ``` `) to render crisp equations.
*   **Sticky Notes:** Paste ` ```note ... ``` ` content to create yellow sticky notes.

### 📚 PDF & Media
*   **PDF Import:** Upload PDFs to render pages vertically on the canvas (auto-scaled to 50% screen width for readability).
*   **Images:** Paste images directly from your clipboard.

### 🛠️ Productivity
*   **Minimap:** Real-time navigation map showing all content and current viewport.
*   **Bookmarks (Frames):** Save and jump to specific viewports (e.g., "Intro", "Chapter 1").
*   **Selection:** 
    *   **Select All:** `Cmd+A`
    *   **Multi-Select:** Hold `Shift` to add to selection.
    *   **Recolor:** Select objects and click a palette color to update them all instantly.
*   **Undo/Redo:** Robust history system (`Cmd+Z` / `Cmd+Y`).

### 🎬 Animations (NEW!)
*   **Keyframe-Based Animations:** Record control changes over time to create smooth animations.
*   **Animation Controls:** Rewind, step forward/backward, play/pause, and adjustable playback speed (0.25x-2x).
*   **Visual Timeline:** See and navigate keyframes with clickable markers.
*   **Live Updates:** Auto-update visualizations when adjusting controls for rapid iteration.
*   **Perfect for Educational Content:** Create animated explanations of ML algorithms, math concepts, and more!

📖 **[See Animation Guide →](client/docs/ANIMATIONS.md)**

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd whiteboard
    ```

2.  **Install dependencies (Root):**
    ```bash
    # This installs both client and server dependencies
    cd client && npm install
    cd ../server && npm install
    ```

### Running the App

You need to run the Client and Server simultaneously.

**1. Start Backend (Port 3000):**
```bash
cd server
node index.js
```

**2. Start Frontend (Port 5173):**
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

## ⌨️ Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Pan Tool (Hold)** | `Spacebar` |
| **Undo** | `Cmd + Z` / `Ctrl + Z` |
| **Redo** | `Cmd + Y` / `Ctrl + Y` |
| **Select All** | `Cmd + A` / `Ctrl + A` |
| **Delete Selected** | `Delete` / `Backspace` |
| **Multi-Select** | `Shift + Click` / `Shift + Drag` |
| **Edit Code Block** | `Double Click` |

## 📚 Documentation

*   **[Creating Animations](client/docs/ANIMATIONS.md)** - Complete guide to creating animated educational content
*   **[Code Blocks](client/docs/CODE_BLOCKS.md)** - Reference for using executable code blocks and d3.js visualizations

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Canvas Engine:** React-Konva (Konva.js)
*   **Rendering:** KaTeX (Math), React Syntax Highlighter (Code), Perfect Freehand (Ink)
*   **Visualizations:** D3.js for data-driven graphics
*   **Backend:** Node.js, Express (for saving/loading boards)

## 📄 License

MIT
