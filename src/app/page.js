'use client';
import { useState, useRef } from 'react';

export default function TextSelectionPage() {
  const [text, setText] = useState('');
  const [boldRanges, setBoldRanges] = useState([]); // stores bold regions
  const [lastSelection, setLastSelection] = useState(null); // { start, end }
  const textRef = useRef(null);

  const handleBoldSelection = () => {
    const textarea = textRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    setBoldRanges((prev) => [...prev, { start, end }]);
    setLastSelection({ start, end });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = end;
    }, 0);
  };

  const getFormattedText = () => {
    if (boldRanges.length === 0) return text;

    let result = '';
    let lastIndex = 0;

    const sortedRanges = [...boldRanges].sort((a, b) => a.start - b.start);

    for (const { start, end } of sortedRanges) {
      result += text.slice(lastIndex, start); // plain
      result += `<b>${text.slice(start, end)}</b>`; // bold
      lastIndex = end;
    }

    result += text.slice(lastIndex);
    return result;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bold Selected Text in Textarea</h1>

      <textarea className='border'
        ref={textRef}
        rows={10}
        cols={60}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setBoldRanges([]); // reset bold formatting
          setLastSelection(null);
        }}
        placeholder="Type and select some text, then click 'Bold'"
      />

      <br />
      <button className='border' onClick={handleBoldSelection} style={{ marginTop: '10px' }}>
        Bold Selected Text
      </button>

      {lastSelection && (
        <p style={{ marginTop: '10px' }}>
          Selected index range: <strong>{lastSelection.start}</strong> to{' '}
          <strong>{lastSelection.end}</strong>
        </p>
      )}

      <div style={{ marginTop: '20px' }}>
        <strong>Preview:</strong>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            border: '1px solid #ccc',
            padding: '10px',
            marginTop: '10px',
          }}
          dangerouslySetInnerHTML={{ __html: getFormattedText() }}
        />
      </div>
    </div>
  );
}
