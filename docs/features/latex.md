# LaTeX Math Support

Beautiful mathematical equations powered by KaTeX, perfect for STEM education.

## Overview

Whiteboard renders LaTeX math notation as beautifully typeset equations using KaTeX.

**Features:**
- Fast client-side rendering
- Beautiful typography
- Inline and display math
- Supports most LaTeX commands
- Editable after creation
- Scales perfectly at any zoom level

## Adding LaTeX

### Method 1: Paste LaTeX Code

The most reliable way to add math is to paste it wrapped in a code block:

1. Copy LaTeX code wrapped like this:
   ```latex
   E = mc^2
   ```
2. Paste on the canvas (`Cmd/Ctrl + V`).
3. It instantly renders as a crisp equation.

**Detection triggers:**
- Wrapped in ` ```latex ... ``` ` (Preferred)
- Wrapped in `$$...$$` (Standard block)

### Method 2: Type Directly

Using the text tool:

1. Select the text tool (`T`).
2. Click on the canvas.
3. Type your LaTeX syntax.
4. Wrap it in `$$...$$` to ensure it renders.

### Method 3: Import from Document

Copy from LaTeX editor:

1. Write equation in Overleaf/TeXShop
2. Copy the LaTeX source
3. Paste into Whiteboard
4. Equation renders automatically

## LaTeX Syntax

### Basic Math

**Superscripts:**
```latex
x^2           → x²
e^{i\pi}      → e^(iπ)
```

**Subscripts:**
```latex
a_i           → aᵢ
x_{max}       → xₘₐₓ
```

**Fractions:**
```latex
\frac{a}{b}              → a/b (typeset)
\frac{-b \pm \sqrt{b^2-4ac}}{2a}  → quadratic formula
```

### Greek Letters

**Lowercase:**
```latex
\alpha \beta \gamma \delta
\epsilon \theta \lambda \mu
\pi \sigma \tau \phi \omega
```

**Uppercase:**
```latex
\Gamma \Delta \Theta \Lambda
\Sigma \Phi \Psi \Omega
```

### Operators

**Sums and products:**
```latex
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
\prod_{i=1}^{n} i = n!
```

**Integrals:**
```latex
\int_{0}^{\infty} e^{-x} dx = 1
\iint \iiint (double, triple integrals)
```

**Limits:**
```latex
\lim_{x \to \infty} \frac{1}{x} = 0
\lim_{n \to \infty} (1 + \frac{1}{n})^n = e
```

### Brackets and Parentheses

**Auto-sizing:**
```latex
\left( \frac{a}{b} \right)     → (a/b) with proper height
\left[ x^2 \right]             → [x²]
\left\{ a, b, c \right\}       → {a, b, c}
```

**Manual sizing:**
```latex
\big( \Big( \bigg( \Bigg(
```

### Matrices

**Basic matrix:**
```latex
\begin{matrix}
a & b \\
c & d
\end{matrix}
```

**With brackets:**
```latex
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
```

**Determinant:**
```latex
\begin{vmatrix}
a & b \\
c & d
\end{vmatrix} = ad - bc
```

### Special Functions

**Trigonometry:**
```latex
\sin(x) \cos(x) \tan(x)
\arcsin(x) \arccos(x) \arctan(x)
```

**Logarithms:**
```latex
\log(x) \ln(x) \log_{2}(x)
```

**Other:**
```latex
\exp(x) \sqrt{x} \sqrt[n]{x}
```

### Arrows and Relations

**Arrows:**
```latex
\rightarrow \leftarrow \leftrightarrow
\Rightarrow \Leftarrow \Leftrightarrow
\uparrow \downarrow \updownarrow
```

**Relations:**
```latex
\leq \geq \neq \approx
\equiv \sim \propto
```

## Examples by Subject

### Algebra

**Quadratic formula:**
```latex
x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
```

**Binomial theorem:**
```latex
(x+y)^n = \sum_{k=0}^{n} \binom{n}{k} x^{n-k} y^k
```

### Calculus

**Derivative:**
```latex
f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
```

**Fundamental theorem:**
```latex
\int_a^b f(x)dx = F(b) - F(a)
```

**Partial derivatives:**
```latex
\frac{\partial^2 f}{\partial x \partial y}
```

### Linear Algebra

**Matrix multiplication:**
```latex
\begin{bmatrix} a & b \\ c & d \end{bmatrix}
\begin{bmatrix} x \\ y \end{bmatrix} =
\begin{bmatrix} ax + by \\ cx + dy \end{bmatrix}
```

**Eigenvalue equation:**
```latex
A\vec{v} = \lambda\vec{v}
```

### Statistics

**Normal distribution:**
```latex
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}(\frac{x-\mu}{\sigma})^2}
```

**Expected value:**
```latex
E[X] = \sum_{i=1}^{n} x_i P(X=x_i)
```

### Physics

**Einstein's equation:**
```latex
E = mc^2
```

**Schrödinger equation:**
```latex
i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi
```

**Maxwell's equations:**
```latex
\nabla \cdot \vec{E} = \frac{\rho}{\epsilon_0}
\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}
```

### Chemistry

**Chemical equation:**
```latex
\ce{2H2 + O2 -> 2H2O}
```

**Equilibrium constant:**
```latex
K_{eq} = \frac{[C]^c[D]^d}{[A]^a[B]^b}
```

## Editing LaTeX

### Edit Rendered Equation

**Double-click** to edit:
1. Double-click equation on canvas
2. LaTeX source appears in text editor
3. Modify the LaTeX code
4. Click outside to re-render

**What you can change:**
- Any part of the equation
- Add or remove symbols
- Fix typos or syntax errors

### Common Edits

**Add subscript:**
```latex
Before: x
After:  x_i
```

**Change fraction:**
```latex
Before: \frac{a}{b}
After:  \frac{a+1}{b-1}
```

**Extend sum:**
```latex
Before: \sum_{i=1}^{n} i
After:  \sum_{i=1}^{n} i^2
```

## Positioning

### Moving Equations

Like other smart objects:
1. Click and drag equation
2. Position anywhere on canvas
3. Maintains quality at any zoom

### Sizing

Equations auto-size based on content:
- Use `\displaystyle` for larger rendering
- Use `\scriptstyle` for smaller
- Or adjust canvas zoom

### Alignment

**With other content:**
- Position equations near diagrams
- Align with text labels
- Create structured layouts

## Best Practices

### For Readability

1. ✅ Use triple backticks (```latex) for pasting.
2. ✅ Use `$$...$$` if typing directly in the text tool for display math.
3. ✅ Use proper sizing: `\left( \right)` for brackets.
4. ✅ Add spacing: `\quad`, `\,` where needed.
5. ✅ Break long equations into multiple lines.

### For Teaching

**Structure equations:**
```latex
\begin{align}
f(x) &= x^2 + 2x + 1 \\
     &= (x+1)^2
\end{align}
```

**Highlight steps:**
1. Write initial equation
2. Use laser pointer to indicate transform
3. Add next step below
4. Show progression clearly

**Common patterns:**
- Problem → Solution
- Theorem → Proof
- Formula → Application

### For Performance

**Keep equations moderate:**
- ✅ < 100 characters: Fast rendering
- ⚠️ 100-500 characters: Acceptable
- ❌ 500+ characters: May slow down

**Split complex equations:**
- Multiple smaller equations > One huge equation
- Use frames for multi-step derivations

## Troubleshooting

### Equation not rendering

**Check syntax:**
- Missing `$` delimiters?
- Unmatched braces `{}`?
- Unknown command?
- Typo in LaTeX?

**Test at [katex.org](https://katex.org/):**
- Paste your LaTeX
- Verify it renders
- Check error messages

### Strange output

**Common issues:**
- `_` outside math mode → Use `$x_i$` not `x_i`
- Missing braces → `x^10` shows x¹⁰, use `x^{10}`
- Backslash in wrong place → `\frac a b` should be `\frac{a}{b}`

### Command not supported

KaTeX supports most but not all LaTeX:

**Unsupported:**
- `\usepackage` (not applicable)
- Some exotic packages
- TikZ graphics

**Workaround:**
- Render in Overleaf
- Export as image
- Import image to Whiteboard

### Can't edit equation

**Solutions:**
- Double-click directly on equation
- Ensure it's a LaTeX object (not image)
- Try single-click first, then double-click
- Refresh if stuck

## Advanced Features

### Multi-line Equations

**Aligned equations:**
```latex
\begin{align}
x + y &= 5 \\
2x - y &= 1
\end{align}
```

**Cases:**
```latex
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
```

### Custom Operators

**Define new operators:**
```latex
\DeclareMathOperator{\Tr}{Tr}
\Tr(AB) = \Tr(BA)
```

### Chemical Equations

Using mhchem extension:
```latex
\ce{H2O}
\ce{2H2 + O2 -> 2H2O}
```

## Integration with Other Features

### With Drawing Tools

**Annotated equations:**
1. Render equation
2. Use pen to circle terms
3. Draw arrows to labels
4. Add explanatory text

### With Spotlight

**Step-by-step derivations:**
1. Write multi-step equation
2. Use spotlight to highlight current step
3. Explain while highlighted
4. Move to next step

### With Frames

**Progressive disclosure:**
1. Frame 1: Problem statement
2. Frame 2: Initial equation
3. Frame 3: Simplification steps
4. Frame 4: Final result

## Resources

### Learn LaTeX

- [KaTeX Supported Functions](https://katex.org/docs/supported.html)
- [LaTeX Math Symbols](https://www.caam.rice.edu/~heinken/latex/symbols.pdf)
- [Overleaf LaTeX Guide](https://www.overleaf.com/learn/latex/Mathematical_expressions)

### Quick Reference

**Common symbols:**
- `\alpha` `\beta` `\gamma` → Greek
- `\sum` `\prod` `\int` → Operators
- `\frac{}{}` → Fractions
- `\sqrt{}` → Square root
- `^` `_` → Super/subscript

## Next Steps

- [Explore Code Blocks →](/features/code-blocks)
- [Learn About Animations →](/features/animations)
- [Master Smart Objects →](/guide/smart-objects)

## LaTeX Philosophy

Whiteboard's LaTeX support is designed for:

1. **Education:** Clear, beautiful math notation
2. **Simplicity:** Paste and render, no compilation
3. **Speed:** KaTeX renders instantly
4. **Integration:** Works seamlessly with drawings
5. **Flexibility:** Edit anytime, perfect equations

Perfect for math tutorials, physics lessons, and any STEM education content!
