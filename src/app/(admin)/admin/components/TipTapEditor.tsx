'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface TipTapEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function TipTapEditor({ value, onChange, placeholder, disabled }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value from parent if it changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
        Initializing editor...
      </div>
    );
  }

  return (
    <div className="tiptap-editor-container" style={{
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap-content-area .ProseMirror {
          outline: none;
          min-height: 220px;
          font-family: inherit;
        }
        .tiptap-content-area .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }
        .tiptap-content-area .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.8rem;
          margin-bottom: 0.4rem;
          color: #334155;
        }
        .tiptap-content-area .ProseMirror p {
          margin-bottom: 0.8rem;
          line-height: 1.6;
          color: #334155;
        }
        .tiptap-content-area .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.8rem;
        }
        .tiptap-content-area .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.8rem;
        }
        .tiptap-content-area .ProseMirror blockquote {
          border-left: 4px solid #f7931e;
          padding-left: 1rem;
          font-style: italic;
          color: #475569;
          margin: 1rem 0;
          background: #fffbeb;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 4px 4px 0;
        }
      ` }} />

      {/* Sleek Toolbar */}
      <div className="tiptap-toolbar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '8px',
        borderBottom: '1px solid #cbd5e1',
        background: '#f8fafc',
      }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('bold') ? '#e2e8f0' : 'transparent',
            fontWeight: 'bold',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('italic') ? '#e2e8f0' : 'transparent',
            fontStyle: 'italic',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run() || disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('strike') ? '#e2e8f0' : 'transparent',
            textDecoration: 'line-through',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          S
        </button>
        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: 'auto 4px' }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('heading', { level: 2 }) ? '#e2e8f0' : 'transparent',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('heading', { level: 3 }) ? '#e2e8f0' : 'transparent',
            fontWeight: '600',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          H3
        </button>
        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: 'auto 4px' }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('bulletList') ? '#e2e8f0' : 'transparent',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('orderedList') ? '#e2e8f0' : 'transparent',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: editor.isActive('blockquote') ? '#e2e8f0' : 'transparent',
            color: '#334155',
            cursor: 'pointer',
            fontFamily: 'serif',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          “
        </button>
        <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: 'auto 4px' }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          ↩️
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || disabled}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: 'none',
            background: 'transparent',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          ↪️
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="tiptap-content-area" style={{
        padding: '16px',
        minHeight: '250px',
        maxHeight: '450px',
        overflowY: 'auto',
      }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
