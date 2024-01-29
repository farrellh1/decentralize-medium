"use client";

import { type Editor } from "@tiptap/react";
import { Toggle } from "../@/components/ui/toggle";
import {
  FaBold,
  FaCode,
  FaHeading,
  FaItalic,
  FaList,
  FaStrikethrough,
} from "react-icons/fa6";

type Props = {
  editor: Editor | null;
};

const Toolbar = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="flex flex-row justify-around mb-4 border-solid border py-4 ">
      <Toggle
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() =>
          editor.chain().toggleHeading({ level: 2 }).run()
        }
      >
        <FaHeading
          className={
            editor.isActive("heading", { level: 2 })
              ? "is-active bg-black text-white rounded-md"
              : ""
          }
        ></FaHeading>
      </Toggle>
      <Toggle
        size={"sm"}
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <FaBold
          className={
            editor.isActive("bold")
              ? "is-active bg-black text-white rounded-md"
              : ""
          }
        ></FaBold>
      </Toggle>
      <Toggle
        size={"sm"}
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <FaItalic
          className={
            editor.isActive("italic")
              ? "is-active bg-black text-white rounded-md"
              : ""
          }
        ></FaItalic>
      </Toggle>
      <Toggle
        size={"sm"}
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <FaStrikethrough
          className={
            editor.isActive("strike")
              ? "is-active bg-black text-white rounded-md"
              : ""
          }
        ></FaStrikethrough>
      </Toggle>
      <Toggle
        size={"sm"}
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <FaList
          className={
            editor.isActive("bulletList")
              ? "is-active bg-black text-white rounded-md"
              : ""
          }
        ></FaList>
      </Toggle>
      <Toggle
        size={"sm"}
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
      >
        <FaCode
          className={
            editor.isActive("code")
              ? "is-active bg-black text-white rounded-md"
              : ""
          }
        ></FaCode>
      </Toggle>
    </div>
  );
};

export default Toolbar;
