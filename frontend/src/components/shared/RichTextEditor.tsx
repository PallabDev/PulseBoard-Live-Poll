import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Code } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 bg-zinc-950/50 p-2">
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
                className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
                className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
                className={`h-8 w-8 ${editor.isActive('strike') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            
            <div className="mx-1 h-4 w-px bg-zinc-800"></div>
            
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run() }}
                className={`h-8 w-8 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
                className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            
            <div className="mx-1 h-4 w-px bg-zinc-800"></div>
            
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
                className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
                className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            
            <div className="mx-1 h-4 w-px bg-zinc-800"></div>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }}
                className={`h-8 w-8 ${editor.isActive('blockquote') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run() }}
                className={`h-8 w-8 ${editor.isActive('codeBlock') ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-50'}`}
            >
                <Code className="h-4 w-4" />
            </Button>
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder = 'Write something...', minHeight = '150px' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm prose-invert max-w-none focus:outline-none p-4 min-h-[${minHeight}]`,
            },
        },
    });

    return (
        <div className="flex flex-col rounded-md border border-zinc-800 bg-zinc-950/50 overflow-hidden focus-within:ring-1 focus-within:ring-zinc-700">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="bg-zinc-900/20 max-h-[400px] overflow-y-auto" />
        </div>
    );
};
