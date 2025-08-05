import { useEditorState } from "@tiptap/react";
import { CodeIcon, TextBoldIcon, TextItalicIcon,TextUnderlineIcon } from "@shopify/polaris-icons";
import "./styles/commands.css";
import { useState, useEffect, useRef } from "react";
import Typography from "@tiptap/extension-typography";
import TableMenu from "./components/TableMenu";
import { AlignText } from "./components/AlignText";
import HeadingMenu from "./components/Heading";
// import VideoComponent from './components/VideoComponent'
import ImageUpload from "./components/ImageUpload";
import { Button,Tooltip } from "@shopify/polaris";

const Commands = ({ editor, handleTiptap }: any) => {
  const sanitizeHtml = (html: any) => {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "") // 移除 script
      .replace(/\son\w+="[^"]*"/gi, ""); // 移除 onClick/onError 等事件
  };
  // 格式化 HTML 内容以换行显示
  const formatHtml = (html: any) => {
    return html
      .replace(/></g, ">\n<") // 标签之间加换行
      .replace(/\n\s*\n/g, "\n"); // 去掉多余空行
  };

  const videoRef = useRef<{ openModal: () => void }>(null);
  const textareaRef = useRef(null);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
      isParagraph: ctx.editor.isActive("paragraph") ?? false,
      isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
      isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
      isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
    }),
  });

  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("<p>Please enter content</p>");
  const htmlEditorRef: any = useRef(null);
  useEffect(() => {
    if (isHtmlMode && textareaRef.current) {
      const el = textareaRef.current as HTMLTextAreaElement;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [isHtmlMode, htmlContent]);
  // 初始化编辑器内容
  useEffect(() => {
    if (editor && !editor.getJSON().content) {
      editor.commands.setContent("<p>Please enter content</p>");
    }
  }, [editor]);

  // HTML 模式下同步 div 内容
  useEffect(() => {
    if (isHtmlMode && htmlEditorRef.current) {
      htmlEditorRef.current.innerText = formatHtml(htmlContent);
      // htmlEditorRef.current.innerText = (htmlContent);
    }
  }, [isHtmlMode, htmlContent]);

  // 处理 HTML 模式下的输入
  const handleHtmlInput = (e: any) => {
    // const content = e.target.innerText;
    const content = e.target.innerHTML;
    setHtmlContent(content);
  };

  const toggleHtmlMode = () => {
    if (!editor) return;

    if (!isHtmlMode) {
      setHtmlContent(editor.getHTML());
      setIsHtmlMode(true);
      handleTiptap(false);
    } else {
      // 仅当用户修改了 HTML 时才更新
      if (htmlContent !== editor.getHTML()) {
        const cleanedHtml =
          sanitizeHtml(htmlContent.trim()) || "<p>Please enter content</p>";
        editor.commands.setContent(cleanedHtml);
      }
      setIsHtmlMode(false);
      handleTiptap(true);
    }
  };

  return (
    <div>
      <div className="commands">
        <Tooltip content="heading" dismissOnMouseOut>
          <HeadingMenu editor={editor} disabled={isHtmlMode}/>
        </Tooltip>
        <Tooltip content="Bold" dismissOnMouseOut>
          <Button
            variant="tertiary"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editorState.canBold || isHtmlMode}
            icon={TextBoldIcon}
          />
        </Tooltip>
        <Tooltip content="Italic" dismissOnMouseOut>
          <Button
            variant="tertiary"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editorState.canItalic || isHtmlMode}
            icon={TextItalicIcon}
          />
        </Tooltip>
        <Tooltip content="Underline" dismissOnMouseOut>
          <Button
            variant="tertiary"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editorState.canUnderline || isHtmlMode}
            icon={TextUnderlineIcon}
          />
        </Tooltip>
        
        <Tooltip content="table" dismissOnMouseOut>
          <TableMenu editor={editor} disabled={isHtmlMode}/>
        </Tooltip>
        
        {/* <Button
          type="text"
          onClick={() => videoRef.current?.openModal()}
        >
          <IconFileVideo />
        </Button>
        <VideoComponent ref={videoRef}  onInsert={(url) => {
          editor.chain().focus().setVideo({ src: url }).run();
        }}/> */}
        <Tooltip content="Image" dismissOnMouseOut>
          <ImageUpload editor={editor} disabled={isHtmlMode}/>
        </Tooltip>
        <Tooltip content={isHtmlMode?'Show Editor':'Show HTML'} dismissOnMouseOut>
          <Button
            variant="tertiary"
            onClick={toggleHtmlMode}
            disabled={!editor}
            icon={CodeIcon}
          ></Button>
        </Tooltip>

        
        
      </div>
      {isHtmlMode && (
        <textarea
          ref={textareaRef}
          value={formatHtml(htmlContent)}
          onChange={(e) => setHtmlContent(e.target.value)}
          style={{
            border: "1px solid #ccc",
            padding: "8px",
            height: "auto",
            fontFamily: "monospace",
            whiteSpace: "pre",
            overflow: "auto",
            width: "100%",
            // width : '800px'
          }}
        />
      )}
    </div>
  );
};

export { Commands, Typography };
