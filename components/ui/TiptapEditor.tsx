'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import { ButtonGroup, Button } from 'react-bootstrap';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Začni psát...' }),
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="border border-secondary-subtle rounded overflow-hidden shadow-sm tiptap-wrapper bg-body">
      <div className="bg-body-secondary p-2 border-bottom border-secondary-subtle d-flex gap-2 flex-wrap">
        <ButtonGroup size="sm">
          <Button variant={editor.isActive('bold') ? 'secondary' : 'light'} onClick={() => editor.chain().focus().toggleBold().run()}>Tučné</Button>
          <Button variant={editor.isActive('italic') ? 'secondary' : 'light'} onClick={() => editor.chain().focus().toggleItalic().run()}>Kurzíva</Button>
        </ButtonGroup>
        <ButtonGroup size="sm">
          <Button variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'light'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
          <Button variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'light'} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
        </ButtonGroup>
        <ButtonGroup size="sm">
          <Button variant={editor.isActive('bulletList') ? 'secondary' : 'light'} onClick={() => editor.chain().focus().toggleBulletList().run()}>Odrážky</Button>
          <Button variant={editor.isActive('orderedList') ? 'secondary' : 'light'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>Číslování</Button>
        </ButtonGroup>
        <ButtonGroup size="sm">
          <Button variant={editor.isActive('link') ? 'secondary' : 'light'} onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('Zadejte URL adresu:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }
          }}>Odkaz</Button>
        </ButtonGroup>
      </div>
      <EditorContent editor={editor} className="p-3 bg-body text-body" />
    </div>
  );
}
