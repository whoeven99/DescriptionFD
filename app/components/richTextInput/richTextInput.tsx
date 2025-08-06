// src/Tiptap.tsx
import { useEditor, EditorContent } from "@tiptap/react";
// import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from "@tiptap/starter-kit";
import "./styles/tiptap.css";
import { Commands } from "./commands";
// import Underline from '@tiptap/extension-underline'
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
// import Link from '@tiptap/extension-link'
// import Image from '@tiptap/extension-image'
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import { Video } from "./extensions/VideoNode";
import { LocalImage } from "./extensions/imageNode";
import { useState } from "react";
const Tiptap = () => {
  const editor = useEditor({  
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight,
      LocalImage,
      Table.configure({
        resizable: true, // 允许拖动调整列宽
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"], // 指定允许设置对齐的节点类型
      }),
      Video,
      // Underline
    ], // define your extension array
    content: "<p>Hello World!</p>", // initial content
    immediatelyRender: false, // 🔹 SSR 环境下必须加这个
  });
  const [showTiptap, setShowTiptap] = useState(true);
  const hideTiptap = (value: boolean) => {
    console.log(value);
    setShowTiptap(value);
  };
  return (
    <div className="tiptap-content">
      {editor &&<Commands editor={editor} handleTiptap={hideTiptap} />}
      {showTiptap && <EditorContent editor={editor} />}
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </div>
  );
};

export default Tiptap;
