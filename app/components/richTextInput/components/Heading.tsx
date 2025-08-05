import { Dropdown, Button, Menu } from '@arco-design/web-react'
import { IconDown } from '@arco-design/web-react/icon'
import { useEditorState } from '@tiptap/react'

export default function HeadingMenu({ editor }: any) {
  const headingItems = [
    { key: 'p', content: '正文', fontSize: '14px', fontWeight: 400 },
    { key: 'h1', content: '标题 1', fontSize: '32px', fontWeight: 700 },
    { key: 'h2', content: '标题 2', fontSize: '28px', fontWeight: 600 },
    { key: 'h3', content: '标题 3', fontSize: '24px', fontWeight: 600 },
    { key: 'h4', content: '标题 4', fontSize: '20px', fontWeight: 500 },
    { key: 'h5', content: '标题 5', fontSize: '16px', fontWeight: 500 },
    { key: 'h6', content: '标题 6', fontSize: '14px', fontWeight: 500 },
  ]

  // 监听当前段落类型
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isParagraph: ctx.editor.isActive('paragraph') ?? false,
      isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
      isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
      isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
      isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
    }),
  })

  // 根据当前状态获取显示文字
  const getCurrentLabel = () => {
    if (editorState.isParagraph) return '正文'
    if (editorState.isHeading1) return '标题 1'
    if (editorState.isHeading2) return '标题 2'
    if (editorState.isHeading3) return '标题 3'
    if (editorState.isHeading4) return '标题 4'
    if (editorState.isHeading5) return '标题 5'
    if (editorState.isHeading6) return '标题 6'
    return '正文'
  }

  const onClickMenuItem = (key: string) => {
    if (!editor) return
    const chain = editor.chain().focus()

    if (key === 'p') {
      chain.setParagraph().run()
    } else {
      const level = Number(key.replace('h', ''))
      chain.toggleHeading({ level }).run()
    }
  }

  const droplist = (
    <Menu
      onClickMenuItem={onClickMenuItem}
      style={{
        maxHeight: 'none',
        overflow: 'visible',
      }}
    >
      {headingItems.map((item) => (
        <Menu.Item
          key={item.key}
          style={{
            display: 'flex',
            alignItems: 'center',  // 垂直居中
            fontSize: item.fontSize,
            fontWeight: item.fontWeight,
            lineHeight: '1.2',
            height: '40px',        // 统一高度更美观
          }}
        >
          {item.content}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <Dropdown droplist={droplist} position="bottom">
      <Button type="text">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {getCurrentLabel()}
          <IconDown />
        </span>
      </Button>
    </Dropdown>
  )
}
