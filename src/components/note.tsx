"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { SlashCommand } from "./slash-command";

const lowlight = createLowlight(common);

interface NoteProps {
  content: string;
  onChange: (content: string) => void;
  pageNumber: number;
}

export function Note({ content, onChange, pageNumber }: NoteProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // Disable default, use CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-purple-600 underline cursor-pointer",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      SlashCommand,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-stone prose-sm max-w-none w-full h-full p-4 focus:outline-none overflow-auto " +
          "prose-headings:text-stone-800 prose-headings:font-semibold " +
          "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base " +
          "prose-p:text-stone-700 prose-p:leading-relaxed prose-p:my-2 " +
          "prose-strong:text-stone-900 prose-em:text-purple-700 " +
          "prose-code:text-amber-700 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none " +
          "prose-pre:bg-stone-900 prose-pre:text-stone-100 prose-pre:border prose-pre:border-stone-700 " +
          "prose-blockquote:border-l-purple-400 prose-blockquote:text-stone-600 prose-blockquote:bg-stone-50 prose-blockquote:py-1 prose-blockquote:px-3 " +
          "prose-ul:text-stone-700 prose-ol:text-stone-700 " +
          "prose-li:marker:text-purple-500 " +
          "prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline " +
          "prose-hr:border-stone-200",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when page changes
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [pageNumber, content, editor]);

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-white">
      <EditorContent editor={editor} className="flex-1 min-h-0 overflow-auto" />
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #a8a29e;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        .tiptap ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .tiptap ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          user-select: none;
        }
        .tiptap ul[data-type="taskList"] li > label input[type="checkbox"] {
          cursor: pointer;
          accent-color: #9333ea;
        }
        .tiptap ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .tiptap mark {
          background-color: #fef08a;
          padding: 0 0.125rem;
          border-radius: 0.125rem;
        }
        .tiptap pre {
          background: #1c1917;
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          overflow-x: auto;
        }
        .tiptap pre code {
          background: none;
          color: inherit;
          font-size: 0.875rem;
          padding: 0;
        }
        /* Syntax highlighting */
        .tiptap pre .hljs-comment,
        .tiptap pre .hljs-quote {
          color: #6b7280;
        }
        .tiptap pre .hljs-variable,
        .tiptap pre .hljs-template-variable,
        .tiptap pre .hljs-attribute,
        .tiptap pre .hljs-tag,
        .tiptap pre .hljs-regexp,
        .tiptap pre .hljs-link {
          color: #f87171;
        }
        .tiptap pre .hljs-number,
        .tiptap pre .hljs-meta,
        .tiptap pre .hljs-built_in,
        .tiptap pre .hljs-builtin-name,
        .tiptap pre .hljs-literal,
        .tiptap pre .hljs-type,
        .tiptap pre .hljs-params {
          color: #fb923c;
        }
        .tiptap pre .hljs-string,
        .tiptap pre .hljs-symbol,
        .tiptap pre .hljs-bullet {
          color: #4ade80;
        }
        .tiptap pre .hljs-title,
        .tiptap pre .hljs-section {
          color: #60a5fa;
        }
        .tiptap pre .hljs-keyword,
        .tiptap pre .hljs-selector-tag {
          color: #c084fc;
        }
        .tiptap pre .hljs-emphasis {
          font-style: italic;
        }
        .tiptap pre .hljs-strong {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
