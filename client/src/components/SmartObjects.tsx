import { useState, useCallback, useRef } from 'react';
import { Html } from 'react-konva-utils';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import Konva from 'konva';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { LatexObj, CodeObj, NoteObj } from '../types';

// Render Latex
export const LatexObject = ({ obj, onSelect, isSelected, draggable = true }: { obj: LatexObj, onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void, isSelected?: boolean, draggable?: boolean }) => {
  const divRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      try {
         katex.render(obj.text, node, {
           throwOnError: false,
           displayMode: true,
           output: 'html', 
         });
      } catch (e) {
         console.error("KaTeX Render Error", e);
         node.innerText = "LaTeX Error";
      }
    }
  }, [obj.text]);

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      onClick={onSelect}
      onTap={onSelect}
      draggable={draggable}
    >
      <Html divProps={{ style: { pointerEvents: 'none' } }}>
        <div 
           ref={divRef} 
           style={{ 
              fontSize: obj.fontSize, 
              color: obj.color,
              userSelect: 'none',
              minWidth: '50px',
              minHeight: '20px',
              border: isSelected ? '1px dashed blue' : 'none',
              padding: '5px'
           }} 
        />
      </Html>
      <Rect width={300} height={150} fill="transparent" /> 
    </Group>
  );
};

// Render Code
export const CodeObject = ({
   obj,
   onSelect,
   isSelected,
   onChangeLanguage,
   onChangeText,
   draggable = true
}: {
   obj: CodeObj,
   onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void,
   isSelected?: boolean,
   onChangeLanguage: (lang: string) => void,
   onChangeText: (text: string) => void,
   draggable?: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = () => {
     setIsEditing(true);
  };

  const handleBlur = () => {
     setIsEditing(false);
     if (textareaRef.current) {
        onChangeText(textareaRef.current.value);
     }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const value = e.currentTarget.value;
        e.currentTarget.value = value.substring(0, start) + "  " + value.substring(end);
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
     }
     e.stopPropagation();
  };

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      onClick={onSelect}
      onTap={onSelect}
      draggable={!isEditing && draggable}
    >
      <Html divProps={{ style: { pointerEvents: 'none' } }}>
        <div 
           className="relative group" 
           style={{ 
              width: obj.width, 
              height: obj.height,
              pointerEvents: 'none'
           }}
        >
           {(isSelected || isEditing) && (
              <div 
                 style={{ pointerEvents: 'auto', userSelect: 'none' }}
                 className="absolute -top-8 right-0 bg-gray-800 rounded-t-md px-2 py-1 flex items-center gap-2 z-50 shadow-md"
                 onPointerDown={(e) => e.stopPropagation()} 
              >
                 <span className="text-xs text-gray-400 font-mono select-none">Language:</span>
                 <select 
                    className="bg-gray-700 text-white text-xs p-1 rounded border-none outline-none cursor-pointer"
                    value={obj.language}
                    onChange={(e) => onChangeLanguage(e.target.value)}
                 >
                    <option value="">Select Language...</option>
                    <option value="javascript">JS/TS</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                 </select>
              </div>
           )}
           
           {isEditing ? (
              <textarea
                 ref={textareaRef}
                 autoFocus
                 className="w-full h-full p-3 bg-[#1e1e1e] text-white font-mono text-sm resize-none outline-none border-2 border-blue-500 rounded-lg shadow-xl"
                 style={{ fontSize: obj.fontSize, pointerEvents: 'auto', userSelect: 'text' }}
                 defaultValue={obj.text}
                 onBlur={handleBlur}
                 onKeyDown={handleKeyDown} 
                 onDoubleClick={(e) => e.stopPropagation()}
              />
           ) : (
              <div 
                 style={{ 
                    fontSize: obj.fontSize, 
                    width: '100%', 
                    height: '100%', 
                    overflow: 'hidden',
                    userSelect: 'none',
                    border: isSelected ? '1px dashed blue' : 'none',
                    borderRadius: '8px'
                 }}
              >
                 <SyntaxHighlighter 
                    language={obj.language} 
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: '8px', padding: '12px', height: '100%' }}
                 >
                    {obj.text || " "}
                 </SyntaxHighlighter>
              </div>
           )}
        </div>
      </Html>
      
      {!isEditing && (
         <Rect 
            width={obj.width} 
            height={obj.height} 
            fill="transparent" 
            onDblClick={handleDoubleClick}
         />
      )}
    </Group>
  );
};

// Render Sticky Note
export const NoteObject = ({ obj, onSelect, isSelected, onChangeText, draggable = true }: { obj: NoteObj, onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void, isSelected?: boolean, onChangeText: (text: string) => void, draggable?: boolean }) => {
   const [isEditing, setIsEditing] = useState(false);
   const textareaRef = useRef<HTMLTextAreaElement>(null);

   return (
      <Group
        id={obj.id}
        x={obj.x}
        y={obj.y}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => setIsEditing(true)}
        draggable={!isEditing && draggable}
      >
         <Rect 
            width={obj.width} 
            height={obj.height} 
            fill={obj.color} 
            shadowBlur={5}
            cornerRadius={2}
            stroke={isSelected ? 'blue' : 'transparent'}
            strokeWidth={2}
         />
         {isEditing ? (
            <Html divProps={{ style: { pointerEvents: 'none' } }}>
               <textarea
                  ref={textareaRef}
                  autoFocus
                  defaultValue={obj.text}
                  onBlur={() => {
                     setIsEditing(false);
                     if (textareaRef.current) onChangeText(textareaRef.current.value);
                  }}
                  style={{
                     width: obj.width - 20,
                     height: obj.height - 20,
                     margin: '10px',
                     backgroundColor: 'transparent',
                     border: 'none',
                     outline: 'none',
                     resize: 'none',
                     fontFamily: 'sans-serif',
                     fontSize: '16px',
                     color: '#333',
                     pointerEvents: 'auto'
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
               />
            </Html>
         ) : (
            <KonvaText
               x={10}
               y={10}
               width={obj.width - 20}
               text={obj.text}
               fontSize={16}
               fontFamily="sans-serif"
               fill="#333"
               listening={false} 
            />
         )}
      </Group>
   );
};