"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[100px] px-3 py-2',
            },
        },
        immediatelyRender: false,
    });

    // Reset editor content when prop changes to empty (e.g. after submit)
    React.useEffect(() => {
        if (editor && content === '' && editor.getHTML() !== '<p></p>') {
            editor.commands.setContent('');
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex space-x-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1 rounded ${editor.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                >
                    <s>S</s>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-1 rounded ${editor.isActive('code') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                >
                    Code
                </button>
            </div>
            <EditorContent editor={editor} className="max-h-[300px] overflow-y-auto" />
        </div>
    );
};

export default TiptapEditor;
