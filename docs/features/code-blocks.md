# Code Blocks

Whiteboard's code blocks are interactive, editable areas with syntax highlighting, powered by CodeMirror.

## How Code Blocks Work

Unlike static syntax highlighting that just colors text, Whiteboard's code blocks are full CodeMirror editors embedded as DOM elements on the canvas. When you paste code, Whiteboard detects programming syntax and creates an interactive code block rather than plain text.

The detection looks for language keywords (function, class, if, def), common operators, and code structure patterns like brackets and semicolons. If your pasted text looks like code, it becomes a code block. If it's plain text or natural language, it becomes a text object instead.

### Editing Code Blocks

Double-click any code block to enter edit mode. The CodeMirror editor activates, giving you a full-featured code editing experience directly on the canvas.

While editing, you get automatic indentation, bracket matching, and syntax highlighting that updates as you type. The highlighting uses language detection - if you paste JavaScript, it highlights JavaScript keywords and syntax. Change the code to Python syntax and the highlighting adapts (though manual language selection isn't implemented yet, so it relies on syntax patterns).

Click outside the code block or press Escape to exit edit mode. Your changes are saved immediately, and the code block returns to its rendered state.

### Syntax Highlighting

The highlighting uses CodeMirror's language modes, which understand the structure of programming languages. Keywords like `function`, `class`, `if`, and `return` appear in orange/purple. String literals get green highlighting. Comments are gray and italicized. Numbers appear in light blue. Operators and punctuation stay neutral.

This isn't just regex-based token matching - the highlighter understands context. A word that's a keyword in one position (like `class` at the start of a declaration) but a variable name in another gets colored appropriately based on context.

The current theme is One Dark (the Atom editor's dark theme), chosen for readability on the default white canvas background. The dark code block background with light text creates clear contrast, making code easy to read even at normal zoom levels.

### Moving and Positioning Code Blocks

Code blocks are positioned like any smart object - click and drag to move them around the canvas. They maintain their aspect ratio and content scaling as you zoom the canvas in and out.

Unlike strokes (which are canvas elements), code blocks are HTML divs with absolute positioning. This means they appear crisp at any zoom level and render on top of canvas strokes. The positioning system uses canvas coordinates for consistency with other objects, but the rendering is DOM-based for text clarity.

## Supported Languages

CodeMirror's language detection covers most common programming languages automatically. Paste JavaScript, Python, Java, C++, Rust, Go, PHP, Ruby, Swift, TypeScript, HTML, CSS, JSON, SQL, Bash, or dozens of other languages and you'll get appropriate syntax highlighting.

The language modes include language-specific features - Python mode understands indentation-based blocks, JavaScript mode recognizes ES6 arrow functions, JSX mode handles embedded HTML in JavaScript, and so on.

If you paste a language CodeMirror doesn't recognize, it falls back to basic highlighting of common patterns (strings, numbers, comments) without language-specific keyword highlighting.

## Size and Scaling

Code blocks have a minimum width and height to ensure text remains readable. Very short snippets (one or two lines) still get enough vertical space for comfortable reading. Long code blocks can scroll if they exceed a maximum height, though this is discouraged - split large code across multiple frames instead.

When you zoom the canvas, code blocks scale their font size proportionally. At 200% zoom, the code appears at double size. This keeps code readable when you zoom in to focus on details, but it also means extremely zoomed-out views make code too small to read. Frame your canvas zoom so code blocks are legible when presenting.

## Recording with Code Blocks

For tutorials where you type code live, you can double-click an empty canvas area to create a new code block, then type into it while recording. The syntax highlighting appears in real-time as you type, which can be visually engaging ("watch as the code comes together").

Alternatively, paste complete code and use the spotlight tool to walk through it line by line. The spotlight appears above the code block (thanks to HTML layering), creating a clear highlight as you explain each section.

For code reviews or debugging demos, paste the buggy code, use the laser pointer to circle the problematic section, then double-click to edit and fix it live. The red laser pointer provides clear emphasis before you make the correction.

## Integration with Other Features

Code blocks work seamlessly with spotlight highlighting because both use HTML rendering. The spotlight's z-index ensures it appears above code blocks, unlike canvas-based annotation which would render underneath.

Laser pointer strokes appear above code blocks too, since they're rendered on the canvas layer which sits above the background but the spotlight overlay sits above everything.

Frame navigation preserves code blocks - they're stored as smart objects with position and content data, so navigating away and back to a frame shows the code exactly as you left it.

## Performance Considerations

Each code block is a full CodeMirror instance, which has some overhead. Creating dozens of code blocks on one canvas can slow down interactions. A reasonable limit is 10-15 code blocks per frame for smooth performance.

Very large code blocks (hundreds of lines) can also cause slowness, especially during editing when syntax highlighting recalculates on every keystroke. Keep code snippets focused - if you need to show a large codebase, split it across multiple frames with each frame showing one relevant section.

The syntax highlighting is synchronous, running on the main thread. On slow devices, typing in very large code blocks might lag slightly as the highlighter processes your input. This is a CodeMirror characteristic, not something Whiteboard adds.

## Technical Implementation

Code blocks are positioned absolutely using CSS transforms that match the canvas coordinate system. When the canvas pans or zooms, JavaScript updates the transform of all code blocks to keep them synchronized with canvas coordinates.

This hybrid approach (canvas for strokes, HTML for code blocks) creates some complexity - hit testing needs to check both canvas elements and DOM elements, and z-ordering requires careful management. The benefit is crystal-clear text rendering that would be impossible to achieve with canvas-based text.

The CodeMirror instances are reused when possible - entering edit mode activates an existing instance rather than creating a new one. This reduces initialization overhead and keeps memory usage reasonable even with many code blocks.

## Limitations and Workarounds

You can't currently set the language manually - it's always auto-detected from syntax. If the wrong language is detected, try adding more language-specific keywords or syntax to trigger the correct mode.

There's no line numbering option yet, though CodeMirror supports it. If you need to reference specific line numbers, add them as comments in the code.

Code blocks can't be resized by dragging - they auto-size based on content. For wide code that doesn't fit well, split it into multiple shorter lines or rotate the layout.

The theme is currently fixed at One Dark. Light theme support would require checking the canvas background and switching themes accordingly, which isn't implemented yet.
