# Code Blocks

Learn how to add, edit, and use syntax-highlighted code blocks in Whiteboard.

## Overview

Code blocks provide professional syntax highlighting for over 100 programming languages, powered by CodeMirror.

**Key Features:**
- Automatic syntax highlighting
- Language auto-detection
- Editable with CodeMirror editor
- Line numbers
- One Dark theme
- Copy-paste friendly

## Adding Code Blocks

### Method 1: Paste Code

The easiest way to add code:

1. Copy code from your editor/IDE
2. Paste onto canvas (`Cmd/Ctrl + V`)
3. Whiteboard detects programming syntax
4. Code block created with highlighting

**Auto-detection works for:**
- Code with keywords (function, class, if, etc.)
- Code with brackets/parentheses
- Common programming patterns

### Method 2: Manual Creation

Coming soon:
- Click "Code Block" button in toolbar
- Empty code editor appears
- Type or paste code
- Set language manually

## Supported Languages

### Popular Languages

- **JavaScript/TypeScript** ✅
- **Python** ✅
- **Java** ✅
- **C/C++** ✅
- **C#** ✅
- **Rust** ✅
- **Go** ✅
- **PHP** ✅
- **Ruby** ✅
- **Swift** ✅

### Web Technologies

- **HTML** ✅
- **CSS/SCSS** ✅
- **JSX/TSX** ✅
- **Vue** ✅
- **JSON** ✅
- **XML** ✅
- **Markdown** ✅

### Other Languages

- **SQL** ✅
- **Bash/Shell** ✅
- **PowerShell** ✅
- **R** ✅
- **MATLAB** ✅
- **LaTeX** ✅
- And 100+ more...

## Syntax Highlighting

### How It Works

CodeMirror analyzes code and applies color-coding:

**Keywords:** `if`, `function`, `class`, `import`
- Color: Orange/purple

**Strings:** `"hello"`, `'world'`
- Color: Green

**Comments:** `// comment`, `/* block */`
- Color: Gray/italic

**Numbers:** `42`, `3.14`
- Color: Light blue

**Operators:** `+`, `=`, `&&`
- Color: White/gray

**Functions/Methods:**
- Color: Blue

### Theme

Current theme: **One Dark** (Atom-style dark theme)

**Colors:**
- Background: Dark gray (#282c34)
- Foreground: Light gray (#abb2bf)
- Accent colors: Carefully chosen for readability

**Future:**
- Light theme option
- Custom theme support
- VSCode theme import

## Editing Code

### Open Editor

**Double-click** code block to edit:
1. Double-click anywhere on code block
2. CodeMirror editor opens
3. Full editor features available
4. Click outside to save and close

### Editor Features

**While editing:**
- Syntax highlighting updates live
- Auto-indentation
- Bracket matching
- Line numbers
- Scrolling for long code

**Keyboard shortcuts:**
- `Tab`: Indent
- `Shift+Tab`: Outdent
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + /`: Toggle comment
- `Cmd/Ctrl + Enter`: Save and close (coming soon)

### Moving Code Blocks

Like other smart objects:
1. Click and drag to move
2. Position anywhere on canvas
3. Resize by dragging corners (coming soon)

## Examples

### JavaScript Example

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

**Highlighted:**
- `function`, `if`, `return` → keywords
- `fibonacci` → function name
- `n <= 1` → operators and numbers
- `// 55` → comment

### Python Example

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

**Highlighted:**
- `def`, `if`, `return`, `for`, `in` → keywords
- String literals, numbers, operators

### HTML/CSS Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    .container {
      display: flex;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</body>
</html>
```

**Highlighted:**
- Tags: `<html>`, `<div>`, etc.
- Attributes: `lang`, `class`
- CSS properties and values

## Use Cases

### Programming Tutorials

**Show code snippets:**
1. Paste function example
2. Draw arrows with pen to explain parts
3. Use spotlight to walk through line-by-line
4. Use laser to point to specific variables

**Live coding:**
1. Start with empty code block
2. Type code while recording
3. Explain as you type
4. Syntax highlighting appears automatically

### Algorithm Explanations

**Visualize code flow:**
1. Paste algorithm code
2. Draw flowchart alongside
3. Use spotlight to highlight current step
4. Draw arrows showing execution path

### Code Reviews

**Annotate code:**
1. Paste code to review
2. Use highlighter for issues
3. Add text labels with suggestions
4. Use laser pointer for walkthroughs

### Documentation

**Code examples in tutorials:**
1. Paste example code
2. Add explanatory text above/below
3. Draw diagrams showing concepts
4. Reference code with arrows

## Best Practices

### Code Block Size

**Keep snippets focused:**
- ✅ 5-20 lines: Ideal for teaching
- ⚠️ 20-50 lines: Still manageable
- ❌ 50+ lines: Consider splitting

**Long code:**
- Split into multiple frames
- Show only relevant portions
- Link to full code externally

### Formatting

**Before pasting:**
1. Format code in your editor
2. Ensure consistent indentation
3. Add comments for clarity
4. Remove unnecessary blank lines

**Whiteboard preserves:**
- Your indentation (tabs/spaces)
- Blank lines
- All characters exactly as pasted

### Positioning

**On canvas:**
- Position prominently
- Leave space for annotations
- Don't overlap with drawings
- Consider spotlight visibility

### Language Selection

Currently auto-detected. Tips:
- Use clear syntax (keywords help detection)
- Add comments to clarify language
- Future: Manual language selection

## Performance

### Code Block Limits

**Recommended:**
- < 50 lines per block: Smooth performance
- < 20 blocks per canvas: No lag
- Keep total code reasonable

**Large code:**
- May slow rendering
- Split across frames
- Or link to GitHub gist

### Rendering

**CodeMirror is fast:**
- Instant syntax highlighting
- 60fps smooth scrolling (when editing)
- Optimized for performance

## Advanced Features

### Code Highlighting (Future)

Coming soon:
- Highlight specific lines
- Diff view (show changes)
- Annotations inline
- Breakpoint indicators

### Export (Future)

Planned export options:
- Copy code as plain text
- Export with syntax highlighting (HTML)
- Share as GitHub gist
- PDF with preserved highlighting

### Themes (Future)

Additional themes planned:
- Light theme
- High contrast
- VSCode theme import
- Custom theme creation

## Troubleshooting

### Code not highlighting

**Check:**
- Is it actually a code block? (Or plain text?)
- Does code have recognizable syntax?
- Try adding comments or keywords

**Solutions:**
- Add clear keywords (function, class, if)
- Format code properly
- Recreate code block

### Can't edit code

**Solutions:**
- Double-click the code block
- Ensure it's a code block (not plain text)
- Try clicking directly on code

### Wrong language detected

Currently no manual override. Workarounds:
- Add language-specific keywords
- Add comment: `// JavaScript`
- Future: Manual language selection

### Code block disappeared

**Check:**
- Zoom level (zoomed out too far?)
- Covered by other objects?
- Accidentally deleted?

**Solutions:**
- Zoom in
- Undo recent actions
- Check frame history

### Highlight colors hard to read

Current theme is fixed (One Dark). Future:
- Light theme for bright backgrounds
- High contrast mode
- Custom color schemes

## Integration with Other Features

### With Spotlight

Perfect combination:
1. Paste code block
2. Use spotlight tool
3. Move through code line-by-line
4. Explain each part while recording

[Learn more →](/desktop/laser-spotlight)

### With Laser Pointer

Annotate code temporarily:
1. Point to specific variables
2. Draw arrows showing flow
3. Circle important sections
4. Annotations fade automatically

### With Text Objects

Add explanations:
1. Code block on left
2. Text explanations on right
3. Arrows connecting code to text
4. Clear visual structure

### With Frames

Multi-step tutorials:
1. Frame 1: Problem statement + initial code
2. Frame 2: Highlight issue with laser
3. Frame 3: Show solution code
4. Frame 4: Final working example

## Examples by Language

### Python Class Example

```python
class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade

    def is_passing(self):
        return self.grade >= 60
```

### React Component Example

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### SQL Query Example

```sql
SELECT users.name, COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE users.created_at > '2024-01-01'
GROUP BY users.id
HAVING order_count > 5
ORDER BY order_count DESC;
```

## Next Steps

- [Explore LaTeX Support →](/features/latex)
- [Learn About Animations →](/features/animations)
- [Try Smart Objects →](/guide/smart-objects)

## Code Block Philosophy

Whiteboard's code blocks are designed for:

1. **Teaching:** Clear, readable syntax highlighting
2. **Simplicity:** Paste and go, no configuration
3. **Integration:** Works seamlessly with other tools
4. **Performance:** Fast even with multiple blocks
5. **Flexibility:** Edit anytime, move anywhere

Perfect for coding tutorials, algorithm explanations, and technical education!
