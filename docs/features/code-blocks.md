# Code Blocks & Smart Objects

Whiteboard is uniquely designed for technical educators. You can bring real, syntax-highlighted code and interactive visualizations directly onto the canvas.

---

## 💻 Working with Code

Forget about static screenshots. Whiteboard uses **CodeMirror** to provide a full editor experience on your canvas.

### How to Create a Code Block:
1. Copy code from your IDE (VS Code, IntelliJ, etc.).
2. **Cmd + V** on the Whiteboard canvas.
3. If your clipboard contains a Markdown code block (e.g., ` ```python ... ``` `), Whiteboard will automatically create a themed code block with the correct syntax highlighting.

### Interacting with Code:
- **Move:** Click and drag to position.
- **Edit:** **Double-click** the block to enter edit mode. You can fix typos or change logic live during your recording.
- **Language Detection:** Hover over the top bar of a code block to see the detected language.

---

## 📊 Interactive D3 Visualizations

For advanced users, Whiteboard supports "Smart D3 Objects". These are JavaScript-based visualizations that react to your canvas in real-time.

### How it works:
- You can paste a specific D3 script (wrapped in ` ```d3 ... ``` `).
- Whiteboard renders this script as a live SVG visualization.
- These objects can even be connected to the **Animation Player** (see [Animations](/features/animations)). As you step through the timeline, your D3 chart can animate its data!

---

## 📐 LaTeX Math Support

Math and Code go hand-in-hand. Whiteboard renders beautiful equations using **KaTeX**.

### How to add Math:
1. Copy a LaTeX string (e.g., `$$ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} $$`).
2. **Paste** it on the board.
3. It instantly becomes a crisp, scalable math object.

---

## 📝 Sticky Notes & Markdown

Organize your thoughts with quick sticky notes.
- **Paste:** ` ```note ... ``` ` creates a yellow post-it note.
- **Style:** These use a handwritten-style font to blend in with your drawings.

---

## Best Practices for Recording

- **Font Size:** Don't paste too much code in one block. Keep snippets under 15 lines so they stay readable for your viewers.
- **Spotlight Walkthrough:** Use the **Spotlight** (`Shift+P`) to highlight specific lines of code as you explain them.
- **Live Edits:** Instead of showing the "final" code, paste the "starting" code and use **Double-click** to type the solution live. It's much more engaging for students.

---

## Why HTML Code Blocks on a Canvas?
Whiteboard uses a hybrid rendering system. Strokes are on the **Canvas (Konva)** for speed, but Code Blocks are **HTML (DOM)** elements. This ensures:
1. **Perfect Text Selection:** You (or your viewers) can actually select and copy text from the screen.
2. **Crisp Rendering:** Text never gets "blurry" when zooming in.
3. **Accessibility:** Screen readers can "see" the code you've pasted.
