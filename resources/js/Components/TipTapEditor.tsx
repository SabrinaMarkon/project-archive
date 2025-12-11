import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link as LinkIcon, Code } from 'lucide-react';

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function TipTapEditor({ value, onChange, className = '' }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className={`border rounded-md ${className}`} style={{ borderColor: '#e5e3df' }} data-testid="tiptap-editor">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 border-b flex-wrap" style={{ borderColor: '#e5e3df', backgroundColor: '#f9f8f6' }}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
                    title="Italic"
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
                    title="Bullet List"
                >
                    <List size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('codeBlock') ? 'bg-gray-300' : ''}`}
                    title="Code Block"
                >
                    <Code size={18} />
                </button>
                <button
                    type="button"
                    onClick={addLink}
                    className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
                    title="Add Link"
                >
                    <LinkIcon size={18} />
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
                style={{ maxHeight: '500px', overflowY: 'auto' }}
            />

            {/* Helper Text */}
            <div className="px-4 py-2 text-xs border-t" style={{ borderColor: '#e5e3df', color: '#7a7a7a', backgroundColor: '#f9f8f6' }}>
                Use the toolbar buttons to format your content. Generates clean, safe HTML.
            </div>
        </div>
    );
}
