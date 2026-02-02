import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { HexColorPicker } from 'react-colorful';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    ListTodo,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Code,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Palette,
    Table as TableIcon,
    Undo,
    Redo,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    X,
    Columns,
    Rows,
    Trash2,
    FileCode,
    Copy,
    Check,
    Type,
    Plus,
    Minus,
    ArrowLeftFromLine,
    ArrowRightFromLine,
    ArrowUpFromLine,
    ArrowDownFromLine,
    Settings,
} from 'lucide-react';

// Custom FontSize extension
const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                ({ chain }) => {
                    return chain().setMark('textStyle', { fontSize }).run();
                },
            unsetFontSize:
                () =>
                ({ chain }) => {
                    return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
                },
        };
    },
});

// Rainbow Brackets extension using decorations
const RainbowBrackets = Extension.create({
    name: 'rainbowBrackets',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('rainbowBrackets'),
                props: {
                    decorations: (state) => {
                        const decorations: Decoration[] = [];

                        state.doc.descendants((node, pos) => {
                            if (node.type.name === 'codeBlock') {
                                const text = node.textContent;
                                let bracketLevel = 0;
                                const levelStack: number[] = [];
                                let offset = 0;

                                for (let i = 0; i < text.length; i++) {
                                    const char = text[i];

                                    if (char === '{') {
                                        const level = bracketLevel % 6;
                                        decorations.push(
                                            Decoration.inline(pos + 1 + offset, pos + 1 + offset + 1, {
                                                class: `bracket-level-${level}`,
                                            })
                                        );
                                        levelStack.push(bracketLevel);
                                        bracketLevel++;
                                        offset++;
                                    } else if (char === '}') {
                                        bracketLevel = Math.max(0, bracketLevel - 1);
                                        const level = (levelStack.pop() || 0) % 6;
                                        decorations.push(
                                            Decoration.inline(pos + 1 + offset, pos + 1 + offset + 1, {
                                                class: `bracket-level-${level}`,
                                            })
                                        );
                                        offset++;
                                    } else {
                                        offset++;
                                    }
                                }
                            }
                        });

                        return DecorationSet.create(state.doc, decorations);
                    },
                },
            }),
        ];
    },
});

// Custom CodeBlock keyboard extension factory with dynamic auto-match settings
const createCodeBlockKeyboard = (initialSettings: {
    parens: boolean;
    brackets: boolean;
    doubleQuotes: boolean;
    singleQuotes: boolean;
    backticks: boolean;
}) => Extension.create({
    name: 'codeBlockKeyboard',

    addStorage() {
        return {
            autoMatch: { ...initialSettings },
        };
    },

    addKeyboardShortcuts() {
        return {
            // Auto-close parentheses
            '(': () => {
                const { state } = this.editor;
                if (!state.selection.$from.parent.type.name.includes('codeBlock') || !this.storage.autoMatch.parens) {
                    return false;
                }
                this.editor.commands.insertContent('()');
                this.editor.commands.setTextSelection(state.selection.from + 1);
                return true;
            },

            // Auto-close square brackets
            '[': () => {
                const { state } = this.editor;
                if (!state.selection.$from.parent.type.name.includes('codeBlock') || !this.storage.autoMatch.brackets) {
                    return false;
                }
                this.editor.commands.insertContent('[]');
                this.editor.commands.setTextSelection(state.selection.from + 1);
                return true;
            },

            // Auto-close double quotes
            '"': () => {
                const { state } = this.editor;
                if (!state.selection.$from.parent.type.name.includes('codeBlock') || !this.storage.autoMatch.doubleQuotes) {
                    return false;
                }
                this.editor.commands.insertContent('""');
                this.editor.commands.setTextSelection(state.selection.from + 1);
                return true;
            },

            // Auto-close single quotes
            "'": () => {
                const { state } = this.editor;
                if (!state.selection.$from.parent.type.name.includes('codeBlock') || !this.storage.autoMatch.singleQuotes) {
                    return false;
                }
                this.editor.commands.insertContent("''");
                this.editor.commands.setTextSelection(state.selection.from + 1);
                return true;
            },

            // Auto-close backticks
            '`': () => {
                const { state } = this.editor;
                if (!state.selection.$from.parent.type.name.includes('codeBlock') || !this.storage.autoMatch.backticks) {
                    return false;
                }
                this.editor.commands.insertContent('``');
                this.editor.commands.setTextSelection(state.selection.from + 1);
                return true;
            },

            // Special handling for curly braces - put closing brace on new line
            // Always enabled - user likes this behavior
            '{': () => {
                const { state } = this.editor;
                const { $from } = state.selection;

                if (!$from.parent.type.name.includes('codeBlock')) {
                    return false;
                }

                // Get current line text before cursor
                const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
                const currentLine = textBefore.split('\n').pop() || '';

                // Calculate current indentation
                const match = currentLine.match(/^(\s+)/);
                const indent = match ? match[1] : '';

                // Insert opening brace, new indented line, closing brace on aligned line
                this.editor.commands.insertContent('{\n' + indent + '  \n' + indent + '}');

                // Move cursor to the indented line (between braces)
                // Position is: after '{', after first '\n', after indent, after '  '
                this.editor.commands.setTextSelection(state.selection.from + 1 + 1 + indent.length + 2);
                return true;
            },

            // Auto-indent on Enter
            'Enter': () => {
                const { state } = this.editor;
                const { $from } = state.selection;

                if (!$from.parent.type.name.includes('codeBlock')) {
                    return false;
                }

                // Get current line text
                const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
                const currentLine = textBefore.split('\n').pop() || '';

                // Calculate indentation
                const match = currentLine.match(/^(\s+)/);
                const indent = match ? match[1] : '';

                // Check if line ends with opening bracket (but not curly brace since we handle that separately)
                const endsWithOpening = /[[(]$/.test(currentLine.trim());

                this.editor.commands.insertContent('\n' + indent);

                // Extra indent if line ends with opening bracket
                if (endsWithOpening) {
                    this.editor.commands.insertContent('  '); // 2 spaces
                }

                return true;
            },

            // Prevent backspace from merging code blocks
            'Backspace': () => {
                const { state } = this.editor;
                const { $from } = state.selection;

                // Only handle if we're in a code block
                if (!$from.parent.type.name.includes('codeBlock')) {
                    return false;
                }

                // Check if cursor is at the start of the code block
                if ($from.parentOffset === 0) {
                    // Prevent default backspace behavior (which would merge blocks)
                    return true;
                }

                return false;
            },
        };
    },
});

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function TipTapEditor({ value, onChange, className = '' }: TipTapEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#ffff00');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkError, setLinkError] = useState('');
    const [imageError, setImageError] = useState('');
    const [showHtmlView, setShowHtmlView] = useState(false);
    const [htmlCode, setHtmlCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showFontSizePicker, setShowFontSizePicker] = useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);
    const [showAutoMatchSettings, setShowAutoMatchSettings] = useState(false);
    const [autoMatch, setAutoMatch] = useState(() => {
        const saved = localStorage.getItem('tiptap-autoMatch');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return {
                    parens: true,
                    brackets: true,
                    doubleQuotes: true,
                    singleQuotes: true,
                    backticks: true,
                };
            }
        }
        return {
            parens: true,
            brackets: true,
            doubleQuotes: true,
            singleQuotes: true,
            backticks: true,
        };
    });

    const codeLanguages = [
        { label: 'Plain Text', value: 'plaintext' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'JSX', value: 'jsx' },
        { label: 'TSX', value: 'tsx' },
        { label: 'HTML', value: 'xml' },
        { label: 'CSS', value: 'css' },
        { label: 'SCSS', value: 'scss' },
        { label: 'PHP', value: 'php' },
        { label: 'Python', value: 'python' },
        { label: 'Java', value: 'java' },
        { label: 'C', value: 'c' },
        { label: 'C++', value: 'cpp' },
        { label: 'C#', value: 'csharp' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rust' },
        { label: 'Ruby', value: 'ruby' },
        { label: 'Bash', value: 'bash' },
        { label: 'Shell', value: 'shell' },
        { label: 'SQL', value: 'sql' },
        { label: 'JSON', value: 'json' },
        { label: 'YAML', value: 'yaml' },
        { label: 'Markdown', value: 'markdown' },
        { label: 'Dockerfile', value: 'dockerfile' },
        { label: 'GraphQL', value: 'graphql' },
    ];

    const [, setForceUpdate] = useState(0);

    const fonts = [
        { label: 'Default', value: '' },
        { label: 'Arial', value: 'Arial, sans-serif' },
        { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
        { label: 'Times New Roman', value: '"Times New Roman", serif' },
        { label: 'Georgia', value: 'Georgia, serif' },
        { label: 'Garamond', value: 'Garamond, serif' },
        { label: 'Courier New', value: '"Courier New", monospace' },
        { label: 'Monaco', value: 'Monaco, "Courier New", monospace' },
        { label: 'Verdana', value: 'Verdana, sans-serif' },
        { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
        { label: 'Gill Sans', value: '"Gill Sans", sans-serif' },
        { label: 'Lucida Sans', value: '"Lucida Sans Unicode", sans-serif' },
        { label: 'Impact', value: 'Impact, sans-serif' },
        { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
        { label: 'Palatino', value: 'Palatino, "Palatino Linotype", serif' },
        { label: 'Baskerville', value: 'Baskerville, serif' },
        { label: 'Futura', value: 'Futura, sans-serif' },
        { label: 'Rockwell', value: 'Rockwell, serif' },
        { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
        { label: 'Roboto', value: 'Roboto, sans-serif' },
        { label: 'Open Sans', value: '"Open Sans", sans-serif' },
        { label: 'Lato', value: 'Lato, sans-serif' },
        { label: 'Montserrat', value: 'Montserrat, sans-serif' },
        { label: 'Poppins', value: 'Poppins, sans-serif' },
        { label: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif' },
        { label: 'Raleway', value: 'Raleway, sans-serif' },
        { label: 'PT Sans', value: '"PT Sans", sans-serif' },
        { label: 'Nunito', value: 'Nunito, sans-serif' },
        { label: 'Merriweather', value: 'Merriweather, serif' },
        { label: 'Playfair Display', value: '"Playfair Display", serif' },
    ];

    const fontSizes = [
        { label: 'Default', value: '' },
        { label: '10px', value: '10px' },
        { label: '12px', value: '12px' },
        { label: '14px', value: '14px' },
        { label: '16px', value: '16px' },
        { label: '18px', value: '18px' },
        { label: '20px', value: '20px' },
        { label: '24px', value: '24px' },
        { label: '28px', value: '28px' },
        { label: '32px', value: '32px' },
        { label: '36px', value: '36px' },
        { label: '48px', value: '48px' },
        { label: '64px', value: '64px' },
        { label: '72px', value: '72px' },
    ];

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
                underline: false,
                codeBlock: false, // Disable default code block
            }),
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: 'plaintext',
                HTMLAttributes: {
                    class: 'code-block-wrapper',
                },
            }),
            createCodeBlockKeyboard(autoMatch),
            RainbowBrackets,
            Gapcursor,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
            Underline,
            TextStyle,
            Color,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            FontSize,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Subscript,
            Superscript,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image.configure({
                inline: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onSelectionUpdate: () => {
            // Force re-render when selection changes to update toolbar state
            setForceUpdate((prev) => prev + 1);
        },
    }, [autoMatch]);

    // Save to localStorage when autoMatch settings change
    useEffect(() => {
        localStorage.setItem('tiptap-autoMatch', JSON.stringify(autoMatch));
    }, [autoMatch]);

    if (!editor) {
        return null;
    }

    const validateUrl = (url: string): boolean => {
        if (!url.trim()) return false;
        try {
            new URL(url);
            return true;
        } catch {
            // Check if it's a relative URL
            return url.startsWith('/') || url.startsWith('#');
        }
    };

    const handleAddLink = () => {
        if (!validateUrl(linkUrl)) {
            setLinkError('Please enter a valid URL (e.g., https://example.com or /page)');
            return;
        }
        editor.chain().focus().setLink({ href: linkUrl }).run();
        setShowLinkDialog(false);
        setLinkUrl('');
        setLinkError('');
    };

    const handleAddImage = () => {
        if (!validateUrl(imageUrl)) {
            setImageError('Please enter a valid image URL');
            return;
        }
        editor.chain().focus().setImage({ src: imageUrl }).run();
        setShowImageDialog(false);
        setImageUrl('');
        setImageError('');
    };

    const applyTextColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        setTextColor(color);
    };

    const applyHighlight = (color: string) => {
        editor.chain().focus().setHighlight({ color }).run();
        setHighlightColor(color);
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const toggleHtmlView = () => {
        if (!showHtmlView) {
            // Switching to HTML view - get current HTML
            setHtmlCode(editor.getHTML());
        } else {
            // Switching back to editor - update content
            editor.commands.setContent(htmlCode);
            onChange(htmlCode);
        }
        setShowHtmlView(!showHtmlView);
    };

    const copyHtmlToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(htmlCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        title,
        icon: Icon,
    }: {
        onClick: () => void;
        isActive?: boolean;
        title: string;
        icon: React.ElementType;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded hover:bg-gray-200 transition ${isActive ? 'bg-gray-300' : ''}`}
            title={title}
        >
            <Icon size={18} />
        </button>
    );

    const Divider = () => <div className="w-px bg-gray-300 mx-1 self-stretch" />;

    return (
        <div className={`border rounded-md ${className} relative`} style={{ borderColor: '#e5e3df' }} data-testid="tiptap-editor">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 border-b flex-wrap" style={{ borderColor: '#e5e3df', backgroundColor: '#f9f8f6' }}>
                {/* History */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" icon={Undo} />
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" icon={Redo} />

                <Divider />

                {/* Text Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                    icon={Bold}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                    icon={Italic}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline"
                    icon={UnderlineIcon}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                    icon={Strikethrough}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    isActive={editor.isActive('subscript')}
                    title="Subscript"
                    icon={SubscriptIcon}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    isActive={editor.isActive('superscript')}
                    title="Superscript"
                    icon={SuperscriptIcon}
                />

                <Divider />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                    icon={Heading1}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                    icon={Heading2}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                    icon={Heading3}
                />

                <Divider />

                {/* Text Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                    icon={AlignLeft}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                    icon={AlignCenter}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                    icon={AlignRight}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    title="Justify"
                    icon={AlignJustify}
                />

                <Divider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                    icon={List}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                    icon={ListOrdered}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    title="Task List"
                    icon={ListTodo}
                />

                <Divider />

                {/* Text Style */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            setShowColorPicker(!showColorPicker);
                            setShowHighlightPicker(false);
                            setShowFontPicker(false);
                            setShowFontSizePicker(false);
                            setShowLanguagePicker(false);
                        }}
                        title="Text Color"
                        icon={Palette}
                    />
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded shadow-lg z-50" style={{ borderColor: '#e5e3df' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Text Color</span>
                                <button type="button" onClick={() => setShowColorPicker(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={16} />
                                </button>
                            </div>
                            <HexColorPicker color={textColor} onChange={applyTextColor} />
                            <input
                                type="text"
                                value={textColor}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setTextColor(value);
                                    // Apply if valid hex color
                                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                                        applyTextColor(value);
                                    }
                                }}
                                className="mt-2 w-full border rounded px-2 py-1 text-sm font-mono"
                                style={{ borderColor: '#e5e3df' }}
                                placeholder="#000000"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setShowColorPicker(false);
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                                    style={{ borderColor: '#e5e3df' }}
                                >
                                    Remove Color
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        applyTextColor(textColor);
                                        setShowColorPicker(false);
                                    }}
                                    className="flex-1 px-3 py-2 text-white rounded-md text-sm"
                                    style={{ backgroundColor: '#7a9d7a' }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            setShowHighlightPicker(!showHighlightPicker);
                            setShowColorPicker(false);
                            setShowFontPicker(false);
                            setShowFontSizePicker(false);
                            setShowLanguagePicker(false);
                        }}
                        isActive={editor.isActive('highlight')}
                        title="Highlight"
                        icon={Highlighter}
                    />
                    {showHighlightPicker && (
                        <div className="absolute top-full left-0 mt-1 p-3 bg-white border rounded shadow-lg z-50" style={{ borderColor: '#e5e3df' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Highlight Color</span>
                                <button type="button" onClick={() => setShowHighlightPicker(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={16} />
                                </button>
                            </div>
                            <HexColorPicker color={highlightColor} onChange={applyHighlight} />
                            <input
                                type="text"
                                value={highlightColor}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setHighlightColor(value);
                                    // Apply if valid hex color
                                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                                        applyHighlight(value);
                                    }
                                }}
                                className="mt-2 w-full border rounded px-2 py-1 text-sm font-mono"
                                style={{ borderColor: '#e5e3df' }}
                                placeholder="#ffff00"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().unsetHighlight().run();
                                        setShowHighlightPicker(false);
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                                    style={{ borderColor: '#e5e3df' }}
                                >
                                    Remove Highlight
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        applyHighlight(highlightColor);
                                        setShowHighlightPicker(false);
                                    }}
                                    className="flex-1 px-3 py-2 text-white rounded-md text-sm"
                                    style={{ backgroundColor: '#7a9d7a' }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Font Family */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => {
                            setShowFontPicker(!showFontPicker);
                            setShowColorPicker(false);
                            setShowHighlightPicker(false);
                            setShowFontSizePicker(false);
                            setShowLanguagePicker(false);
                        }}
                        title="Font Family"
                        icon={Type}
                    />
                    {showFontPicker && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-50 min-w-[200px]" style={{ borderColor: '#e5e3df' }}>
                            <div className="flex justify-between items-center mb-2 px-2">
                                <span className="text-sm font-medium">Font Family</span>
                                <button type="button" onClick={() => setShowFontPicker(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {fonts.map((font) => (
                                    <button
                                        key={font.value}
                                        type="button"
                                        onClick={() => {
                                            if (font.value) {
                                                editor.chain().focus().setFontFamily(font.value).run();
                                            } else {
                                                editor.chain().focus().unsetFontFamily().run();
                                            }
                                            setShowFontPicker(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                        style={{ fontFamily: font.value || 'inherit' }}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Font Size */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setShowFontSizePicker(!showFontSizePicker);
                            setShowColorPicker(false);
                            setShowHighlightPicker(false);
                            setShowFontPicker(false);
                            setShowLanguagePicker(false);
                        }}
                        className="p-2 rounded hover:bg-gray-200 transition text-xs font-semibold"
                        title="Font Size"
                    >
                        Size
                    </button>
                    {showFontSizePicker && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-50 min-w-[120px]" style={{ borderColor: '#e5e3df' }}>
                            <div className="flex justify-between items-center mb-2 px-2">
                                <span className="text-sm font-medium">Font Size</span>
                                <button type="button" onClick={() => setShowFontSizePicker(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {fontSizes.map((size) => (
                                    <button
                                        key={size.value}
                                        type="button"
                                        onClick={() => {
                                            if (size.value) {
                                                editor.chain().focus().setFontSize(size.value).run();
                                            } else {
                                                editor.chain().focus().unsetFontSize().run();
                                            }
                                            setShowFontSizePicker(false);
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Insert */}
                <ToolbarButton
                    onClick={() => setShowLinkDialog(true)}
                    isActive={editor.isActive('link')}
                    title="Add Link"
                    icon={LinkIcon}
                />
                <ToolbarButton onClick={() => setShowImageDialog(true)} title="Insert Image" icon={ImageIcon} />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                    icon={Code}
                />

                {/* Language Picker - Only show when cursor is in a code block */}
                {editor.isActive('codeBlock') && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setShowLanguagePicker(!showLanguagePicker);
                                setShowColorPicker(false);
                                setShowHighlightPicker(false);
                                setShowFontPicker(false);
                                setShowFontSizePicker(false);
                            }}
                            className="p-2 rounded hover:bg-gray-200 transition text-xs font-semibold"
                            title="Code Language"
                        >
                            Lang
                        </button>
                        {showLanguagePicker && (
                            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-50 min-w-[160px]" style={{ borderColor: '#e5e3df' }}>
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-sm font-medium">Language</span>
                                    <button type="button" onClick={() => setShowLanguagePicker(false)} className="text-gray-500 hover:text-gray-700">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {codeLanguages.map((lang) => (
                                        <button
                                            key={lang.value}
                                            type="button"
                                            onClick={() => {
                                                editor.chain().focus().updateAttributes('codeBlock', { language: lang.value }).run();
                                                setShowLanguagePicker(false);
                                            }}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <ToolbarButton onClick={insertTable} title="Insert Table" icon={TableIcon} />

                <Divider />

                {/* HTML View Toggle */}
                <ToolbarButton
                    onClick={toggleHtmlView}
                    isActive={showHtmlView}
                    title="HTML Code View"
                    icon={FileCode}
                />

                <Divider />

                {/* Auto-Match Settings */}
                <ToolbarButton
                    onClick={() => setShowAutoMatchSettings(true)}
                    isActive={showAutoMatchSettings}
                    title="Auto-Matching Settings"
                    icon={Settings}
                />
            </div>

            {/* Table Controls - Separate row when cursor is in a table */}
            {editor.isActive('table') && (
                <div className="flex gap-1 p-2 border-b flex-wrap items-center" style={{ borderColor: '#e5e3df', backgroundColor: '#f0f9f0' }}>
                    <span className="text-xs font-semibold mr-2" style={{ color: '#7a9d7a' }}>
                        TABLE CONTROLS:
                    </span>

                    {/* Columns Section */}
                    <span className="text-xs font-medium mr-1" style={{ color: '#5a5a5a' }}>
                        Columns:
                    </span>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                        title="Add Column Before"
                        icon={ArrowLeftFromLine}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                        title="Add Column After"
                        icon={ArrowRightFromLine}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                        title="Delete Column"
                        icon={Minus}
                    />

                    <Divider />

                    {/* Rows Section */}
                    <span className="text-xs font-medium mr-1" style={{ color: '#5a5a5a' }}>
                        Rows:
                    </span>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                        title="Add Row Before"
                        icon={ArrowUpFromLine}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        title="Add Row After"
                        icon={ArrowDownFromLine}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        title="Delete Row"
                        icon={Minus}
                    />

                    <Divider />

                    {/* Table Section */}
                    <span className="text-xs font-medium mr-1" style={{ color: '#5a5a5a' }}>
                        Table:
                    </span>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        title="Delete Entire Table"
                        icon={Trash2}
                    />
                </div>
            )}

            {/* Editor Content */}
            {showHtmlView ? (
                <div className="relative">
                    <textarea
                        value={htmlCode}
                        onChange={(e) => setHtmlCode(e.target.value)}
                        className="w-full p-4 min-h-[300px] font-mono text-sm focus:outline-none border-0"
                        style={{ maxHeight: '500px', overflowY: 'auto' }}
                    />
                    <button
                        type="button"
                        onClick={copyHtmlToClipboard}
                        className="absolute top-2 right-2 px-3 py-2 rounded-md text-white flex items-center gap-2 transition"
                        style={{ backgroundColor: copied ? '#22c55e' : '#7a9d7a' }}
                        title={copied ? 'Copied!' : 'Copy HTML to clipboard'}
                    >
                        {copied ? (
                            <>
                                <Check size={16} />
                                <span className="text-sm">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                <span className="text-sm">Copy HTML</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <EditorContent
                    editor={editor}
                    className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
                    style={{ maxHeight: '500px', overflowY: 'auto' }}
                />
            )}

            {/* Helper Text */}
            <div className="px-4 py-2 text-xs border-t" style={{ borderColor: '#e5e3df', color: '#7a7a7a', backgroundColor: '#f9f8f6' }}>
                Use the toolbar buttons to format your content. Click inside a table to see table editing controls. Click inside a code block to select the programming language. Click outside tables or code blocks to exit them. Use the settings button (gear icon) to configure auto-matching for brackets and quotes in code blocks. Use the code view button to edit HTML directly.
            </div>

            {/* Editor Styling */}
            <style>{`
                .ProseMirror table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                .ProseMirror table td,
                .ProseMirror table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                    min-width: 100px;
                }
                .ProseMirror table th {
                    background-color: #f9f8f6;
                    font-weight: bold;
                    text-align: left;
                }
                .ProseMirror table tr:hover {
                    background-color: #f5f5f5;
                }

                /* Code Block with Syntax Highlighting - VS Code Dark Theme */
                .ProseMirror pre {
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                    padding: 1em;
                    border-radius: 6px;
                    overflow-x: auto;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 1em 0;
                }

                .ProseMirror pre code {
                    background: none;
                    color: inherit;
                    padding: 0;
                    font-size: inherit;
                }

                /* Inline code */
                .ProseMirror code {
                    background-color: #f4f4f4;
                    color: #d63384;
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 0.9em;
                }

                /* Syntax Highlighting Colors - VS Code Dark */
                .hljs-comment,
                .hljs-quote {
                    color: #6a9955;
                    font-style: italic;
                }

                .hljs-keyword,
                .hljs-selector-tag,
                .hljs-literal,
                .hljs-section,
                .hljs-link {
                    color: #569cd6;
                }

                .hljs-string {
                    color: #ce9178;
                }

                .hljs-number,
                .hljs-regexp {
                    color: #b5cea8;
                }

                .hljs-title,
                .hljs-name,
                .hljs-selector-id,
                .hljs-selector-class {
                    color: #4ec9b0;
                }

                .hljs-attribute,
                .hljs-variable,
                .hljs-template-variable {
                    color: #9cdcfe;
                }

                .hljs-built_in,
                .hljs-builtin-name,
                .hljs-type,
                .hljs-class {
                    color: #4ec9b0;
                }

                .hljs-function {
                    color: #dcdcaa;
                }

                .hljs-tag {
                    color: #569cd6;
                }

                .hljs-attr {
                    color: #9cdcfe;
                }

                .hljs-meta {
                    color: #d4d4d4;
                }

                .hljs-deletion {
                    color: #f14c4c;
                }

                .hljs-addition {
                    color: #89d185;
                }

                .hljs-emphasis {
                    font-style: italic;
                }

                .hljs-strong {
                    font-weight: bold;
                }

                /* Rainbow Brackets - Curly braces color-coded by nesting level */
                .ProseMirror .bracket-level-0 { color: #ffd700 !important; font-weight: bold; } /* Gold */
                .ProseMirror .bracket-level-1 { color: #da70d6 !important; font-weight: bold; } /* Orchid */
                .ProseMirror .bracket-level-2 { color: #87ceeb !important; font-weight: bold; } /* Sky Blue */
                .ProseMirror .bracket-level-3 { color: #98fb98 !important; font-weight: bold; } /* Pale Green */
                .ProseMirror .bracket-level-4 { color: #f08080 !important; font-weight: bold; } /* Light Coral */
                .ProseMirror .bracket-level-5 { color: #dda0dd !important; font-weight: bold; } /* Plum */
            `}</style>

            {/* Link Dialog */}
            {showLinkDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96" style={{ borderColor: '#e5e3df' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Insert Link</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLinkDialog(false);
                                    setLinkUrl('');
                                    setLinkError('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3d' }}>
                                URL
                            </label>
                            <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => {
                                    setLinkUrl(e.target.value);
                                    setLinkError('');
                                }}
                                placeholder="https://example.com"
                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2"
                                style={{ borderColor: '#e5e3df' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                            />
                            {linkError && <div className="text-red-600 text-sm mt-1">{linkError}</div>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLinkDialog(false);
                                    setLinkUrl('');
                                    setLinkError('');
                                }}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                style={{ borderColor: '#e5e3df' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddLink}
                                className="px-4 py-2 text-white rounded-md"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Insert Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Dialog */}
            {showImageDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96" style={{ borderColor: '#e5e3df' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Insert Image</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageDialog(false);
                                    setImageUrl('');
                                    setImageError('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3d' }}>
                                Image URL
                            </label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => {
                                    setImageUrl(e.target.value);
                                    setImageError('');
                                }}
                                placeholder="https://example.com/image.jpg"
                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2"
                                style={{ borderColor: '#e5e3df' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                            />
                            {imageError && <div className="text-red-600 text-sm mt-1">{imageError}</div>}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageDialog(false);
                                    setImageUrl('');
                                    setImageError('');
                                }}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                style={{ borderColor: '#e5e3df' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="px-4 py-2 text-white rounded-md"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Insert Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Auto-Match Settings Dialog */}
            {showAutoMatchSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96" style={{ borderColor: '#e5e3df' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Auto-Matching Settings</h3>
                            <button
                                type="button"
                                onClick={() => setShowAutoMatchSettings(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm mb-4" style={{ color: '#7a7a7a' }}>
                                Automatically insert closing characters when typing in code blocks:
                            </p>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoMatch.parens}
                                        onChange={(e) => setAutoMatch({ ...autoMatch, parens: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Parentheses <code className="bg-gray-100 px-1 rounded">()</code></span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoMatch.brackets}
                                        onChange={(e) => setAutoMatch({ ...autoMatch, brackets: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Square Brackets <code className="bg-gray-100 px-1 rounded">[]</code></span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoMatch.doubleQuotes}
                                        onChange={(e) => setAutoMatch({ ...autoMatch, doubleQuotes: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Double Quotes <code className="bg-gray-100 px-1 rounded">""</code></span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoMatch.singleQuotes}
                                        onChange={(e) => setAutoMatch({ ...autoMatch, singleQuotes: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Single Quotes <code className="bg-gray-100 px-1 rounded">''</code></span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoMatch.backticks}
                                        onChange={(e) => setAutoMatch({ ...autoMatch, backticks: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Backticks <code className="bg-gray-100 px-1 rounded">``</code></span>
                                </label>
                                <div className="pt-2 mt-2 border-t" style={{ borderColor: '#e5e3df' }}>
                                    <p className="text-xs italic" style={{ color: '#7a7a7a' }}>
                                        Note: Curly braces <code className="bg-gray-100 px-1 rounded">{'{}'}</code> always auto-close with smart formatting (indented, cursor between braces).
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAutoMatchSettings(false)}
                                className="px-4 py-2 text-white rounded-md"
                                style={{ backgroundColor: '#7a9d7a' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
