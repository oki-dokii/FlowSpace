import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className = ""
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  // Google Docs-like toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'check', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-full"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          height: calc(100% - 46px);
        }
        
        .rich-text-editor .ql-editor {
          min-height: 400px;
          padding: 20px;
          color: #1a1a1a;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f9fafb;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 10px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
          background: rgba(255, 255, 255, 0.03);
        }
        
        .rich-text-editor .ql-toolbar button {
          width: 30px !important;
          height: 30px !important;
          padding: 5px !important;
          border-radius: 6px;
        }
        
        .rich-text-editor .ql-toolbar button:hover {
          background: rgba(99, 102, 241, 0.08);
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          background: rgba(99, 102, 241, 0.15);
          color: rgb(99, 102, 241);
        }
        
        .rich-text-editor .ql-picker {
          font-size: 14px;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgba(0, 0, 0, 0.35);
          font-style: normal;
          font-size: 15px;
        }
        
        .rich-text-editor .ql-stroke {
          stroke: #4b5563;
        }
        
        .rich-text-editor .ql-fill {
          fill: #4b5563;
        }
        
        /* Dark mode support */
        .dark .rich-text-editor .ql-toolbar {
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .dark .rich-text-editor .ql-container {
          background: rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .dark .rich-text-editor .ql-editor {
          color: white;
        }
        
        .dark .rich-text-editor .ql-toolbar button:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .dark .rich-text-editor .ql-stroke {
          stroke: rgba(255, 255, 255, 0.8);
        }
        
        .dark .rich-text-editor .ql-fill {
          fill: rgba(255, 255, 255, 0.8);
        }
        
        .dark .rich-text-editor .ql-picker-label {
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
