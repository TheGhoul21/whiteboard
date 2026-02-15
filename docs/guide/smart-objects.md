# Smart Objects

Learn about Whiteboard's intelligent objects: text, LaTeX equations, code blocks, notes, and images.

## What Are Smart Objects?

Smart objects are special canvas elements that go beyond simple strokes:

- **Text**: Editable text with fonts and styling
- **LaTeX**: Mathematical equations rendered beautifully
- **Code Blocks**: Syntax-highlighted code snippets
- **Notes**: Sticky note annotations
- **Images**: Imported graphics

Unlike drawn strokes, smart objects:
- Can be moved and repositioned
- Can be edited after creation
- Maintain quality at any zoom level
- Support rich content (equations, code, etc.)

## Text Objects

### Creating Text

**Method 1: Tool Selection**
1. Click text tool (`T` key)
2. Click on canvas
3. Type your text
4. Click outside to finish

**Method 2: Quick Add**
- Double-click on canvas with hand tool
- Text input appears
- Type and confirm

### Editing Text

**Edit existing text:**
1. Double-click text object
2. Modify content
3. Click outside to save

**Properties:**
- Font size
- Font family (coming soon)
- Color
- Alignment (coming soon)

### Use Cases

- Labels for diagrams
- Headings and titles
- Annotations
- Lists and notes
- Questions and answers

## LaTeX Math

### Adding LaTeX

**Paste LaTeX equation:**
1. Copy LaTeX code using triple backticks (e.g., ` ```latex E = mc^2 ``` `)
2. Paste on canvas (`Cmd/Ctrl + V`)
3. If LaTeX syntax detected → renders as equation
4. Otherwise → appears as plain text

**Manual creation:**
1. Use text tool
2. Type LaTeX syntax
3. Wrap in `$$` for block display

### LaTeX Examples

**Inline math:**
```latex
E = mc^2
```

**Fractions:**
```latex
\frac{a}{b}
```

**Greek letters:**
```latex
\alpha, \beta, \gamma, \Delta, \Omega
```

**Integrals:**
```latex
\int_{0}^{\infty} e^{-x} dx
```

**Matrices:**
```latex
\begin{bmatrix} a & b \\ c & d \end{bmatrix}
```

**Complex equations:**
```latex
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
```

### LaTeX Rendering

Powered by KaTeX:
- Fast rendering
- Beautiful typography
- Supports most LaTeX math commands
- Editable after creation

### Use Cases

- Math lessons
- Physics equations
- Chemistry formulas
- Statistics notation
- Engineering calculations

[Full KaTeX reference →](https://katex.org/docs/supported.html)

## Code Blocks

### Adding Code

**Paste code:**
1. Copy code from editor
2. Paste on canvas (`Cmd/Ctrl + V`)
3. Automatically detected as code block
4. Syntax highlighting applied

**Manual creation:**
1. Click code block button
2. Type or paste code
3. Select language (if needed)

### Supported Languages

- JavaScript/TypeScript
- Python
- Java
- C/C++
- Rust
- Go
- HTML/CSS
- SQL
- And many more...

### Code Block Features

**Syntax highlighting:**
- Automatic language detection
- Color-coded keywords
- Comment styling
- String highlighting

**Editing:**
- Double-click to edit
- CodeMirror editor
- Line numbers
- Auto-indentation

**Themes:**
- One Dark (default)
- Light theme (coming soon)
- Custom themes (coming soon)

### Use Cases

- Programming tutorials
- Algorithm explanations
- Code walkthroughs
- Debugging examples
- Syntax demonstrations

## Notes (Sticky Notes)

### Creating Notes

**Add note:**
1. Click note tool
2. Click on canvas
3. Type note content
4. Color-coded for organization

**Properties:**
- Yellow background (default)
- Custom colors (coming soon)
- Resizable
- Movable

### Use Cases

- TODO items
- Reminders
- Side notes
- Commentary
- Questions for later

## Images

### Importing Images

**Paste image:**
1. Copy image from web or file
2. Paste on canvas (`Cmd/Ctrl + V`)
3. Image appears at cursor position

**Drag and drop:**
- Drag image file onto canvas
- Automatically imported

### Image Properties

- Resizable (drag corners)
- Movable (drag to reposition)
- Maintains aspect ratio
- Quality preserved

### Use Cases

- Reference diagrams
- Screenshots
- Logos and icons
- Charts and graphs
- Photo annotations

## Object Manipulation

### Moving Objects

**Click and drag:**
1. Click object
2. Drag to new position
3. Release to place

**Keyboard nudge:**
- Arrow keys: Move 1px
- Shift+Arrow: Move 10px

### Resizing Objects

**Drag corners:**
- Click corner handle
- Drag to resize
- Shift+Drag: Maintain aspect ratio

### Deleting Objects

**Delete:**
- Select object
- Press `Delete` or `Backspace`
- Or use eraser tool (doesn't work on objects)

**Undo:**
- `Cmd/Ctrl + Z` to undo deletion

## Object Interactions

### Layering

Objects stack in creation order:
- Newer objects appear above older ones
- No manual z-index control (yet)
- Recreate object to bring to front

### Grouping

Not yet supported. Coming soon:
- Select multiple objects
- Group for movement
- Ungroup as needed

### Alignment

Coming soon:
- Align left/right/center
- Distribute evenly
- Snap to grid

## Smart Detection

### Magic Shapes

Convert rough drawings to perfect shapes:

**Magic Square:**
1. Draw rough rectangle
2. Click magic wand tool (`M`)
3. Click on rough drawing
4. Morphs into perfect rectangle

**Magic Circle:**
1. Draw rough circle
2. Click magic wand tool
3. Click on circle
4. Transforms to perfect circle

[Learn more about Magic Animations →](/features/animations)

### Auto-Detection

Some content is automatically detected:

**LaTeX:**
- Detects ` ```latex ... ``` ` syntax
- Renders immediately
- Editable as equation

**Code:**
- Detects programming syntax
- Applies highlighting
- Editable as code

## Best Practices

### For Text

1. ✅ Use for labels, not paragraphs
2. ✅ Keep text concise
3. ✅ Use appropriate size
4. ✅ Position clearly
5. ✅ Contrast with background

### For LaTeX

1. ✅ Test complex equations separately
2. ✅ Use triple backticks for pasting
3. ✅ Keep equations readable at zoom level
4. ✅ Position away from drawing area
5. ✅ Double-check syntax

### For Code Blocks

1. ✅ Keep examples short (<20 lines)
2. ✅ Use syntax highlighting effectively
3. ✅ Add comments for clarity
4. ✅ Position prominently
5. ✅ Test editability

### For Images

1. ✅ Use high-quality sources
2. ✅ Appropriate size (not too large)
3. ✅ Position strategically
4. ✅ Maintain aspect ratio
5. ✅ Consider file size

## Troubleshooting

### LaTeX not rendering

**Check:**
- Wrapped in ` ```latex ... ``` ` or `$$...$$`
- Valid LaTeX syntax
- Supported by KaTeX

**Solutions:**
- Test at [katex.org](https://katex.org/)
- Check for typos
- Verify command is supported

### Code not highlighting

**Check:**
- Language detection
- Valid syntax
- Code block vs. plain text

**Solutions:**
- Manually set language
- Reformat code
- Recreate code block

### Can't move object

**Check:**
- Actually clicking object (not canvas)
- Not in read-only mode
- Object not locked

**Solutions:**
- Click directly on object
- Try dragging from center
- Refresh if stuck

### Object disappeared

**Check:**
- Zoom level (zoomed out too far?)
- Accidentally deleted?
- Covered by other objects?

**Solutions:**
- Zoom to fit
- Undo recent actions
- Bring to front (recreate)

## Next Steps

- [Master Keyboard Shortcuts →](/guide/shortcuts)
- [Explore Code Blocks →](/features/code-blocks)
- [Learn LaTeX Features →](/features/latex)
