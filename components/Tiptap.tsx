import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Toolbar from "./Toolbar";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";

const Tiptap = ({ onChange }: { onChange: (richText: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Heading.configure({
        levels: [2],
        HTMLAttributes: {
          class: "text-3xl font-bold",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc",
        },
        itemTypeName: "listItem",
        keepMarks: true,
        keepAttributes: true,
      }),
      Code.configure({
        HTMLAttributes: {
          class: "prose bg-gray-500 text-white",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "rounded-md border min-h-[150px] border-input outline-none",
      },
    },
    onUpdate({ editor }) {
      console.log(editor.getHTML());
      onChange(editor.getHTML());
    },
  });

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor}></EditorContent>
    </div>
  );
};

export default Tiptap;
