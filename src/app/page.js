'use client';
import { useState, useRef } from 'react';

export default function TextSelectionPage() {
  const [text, setText] = useState('');
  const [formats, setFormats] = useState([]);
  const [lastSelection, setLastSelection] = useState(null);
  const [activeFormat, setActiveFormat] = useState(null); // NEW

  const textRef = useRef(null);

  const isOverlappingSameType = (newRange) => {
    return formats.some(
      ({ start, end, type }) =>
        type === newRange.type &&
        !(newRange.end <= start || newRange.start >= end)
    );
  };

  const addFormat = (type) => {
    const textarea = textRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    const newRange = { start, end, type };

    if (isOverlappingSameType(newRange)) return;

    setFormats((prev) => [...prev, newRange]);
    setLastSelection({ start, end });
    setActiveFormat(type); // NEW

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = end;
    }, 0);
  };

  const removeFormat = () => {
    const textarea = textRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    setFormats((prev) =>
      prev.filter(({ start: s, end: e }) => end <= s || start >= e)
    );
    setLastSelection({ start, end });
    setActiveFormat('none'); // NEW

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = end;
    }, 0);
  };

  const getFormattedText = () => {
    if (formats.length === 0) return text;

    let result = '';
    let index = 0;
    const insertions = {};

    for (const { start, end, type } of formats) {
      const tag = type === 'bold' ? 'b' : 'i';
      if (!insertions[start]) insertions[start] = [];
      if (!insertions[end]) insertions[end] = [];
      insertions[start].push(`<${tag}>`);
      insertions[end].unshift(`</${tag}>`);
    }

    while (index <= text.length) {
      if (insertions[index]) {
        result += insertions[index].join('');
      }
      if (index < text.length) {
        result += text[index];
      }
      index++;
    }

    return result;
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📝 Text Formatter</h1>

      <textarea
        ref={textRef}
        rows={8}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFormats([]);
          setLastSelection(null);
          setActiveFormat(null); // Reset active format
        }}
        className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-gray-800"
        placeholder="Type and select some text to format it..."
      />

      <div className="flex flex-wrap items-center gap-4 mt-4">
        <button
          onClick={() => addFormat('bold')}
          className={`px-4 py-2 rounded transition ${
            activeFormat === 'bold'
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => addFormat('italic')}
          className={`px-4 py-2 rounded transition ${
            activeFormat === 'italic'
              ? 'bg-purple-700 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          Italic
        </button>
        <button
          onClick={removeFormat}
          className={`px-4 py-2 rounded transition ${
            activeFormat === 'none'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Normal (Remove Format)
        </button>
      </div>

      {lastSelection && (
        <p className="mt-3 text-sm text-gray-600">
          Selected index range: <strong>{lastSelection.start}</strong> to{' '}
          <strong>{lastSelection.end}</strong>
        </p>
      )}

      {activeFormat && (
        <p className="mt-2 text-sm text-blue-700">
          Last action: <strong>{activeFormat}</strong>
        </p>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Preview:</h2>
        <div
          className="border p-4 rounded bg-white text-gray-800 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: getFormattedText() }}
        />
      </div>
    </div>
  );
}
