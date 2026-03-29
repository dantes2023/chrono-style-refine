import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}

const RichTextEditor = ({ value, onChange, label }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const imageInputRef = useRef<HTMLInputElement>(null);

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato não suportado. Use JPG, PNG, WEBP ou GIF.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      alert("Erro ao fazer upload da imagem.");
      return;
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(data.path);
    editor.chain().focus().setImage({ src: urlData.publicUrl }).run();

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="border border-input rounded-md overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-muted/50 border-b border-input">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Sublinhado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("highlight")}
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
            aria-label="Destaque"
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Lista"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            aria-label="Citação"
          >
            <Quote className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("link")}
            onPressedChange={addLink}
            aria-label="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={addImage}
            aria-label="Imagem"
          >
            <ImageIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
            aria-label="Linha horizontal"
          >
            <Minus className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[200px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_mark]:bg-accent"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
