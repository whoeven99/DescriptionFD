import React from 'react'
import { Dropdown, Button, Menu } from '@arco-design/web-react'
import { IconAlignLeft, IconAlignCenter, IconAlignRight } from '@arco-design/web-react/icon'

interface AlignTextProps {
  editor: any
}

export const AlignText: React.FC<AlignTextProps> = ({ editor }) => {
  const handleAlignClick = (key: string) => {
    if (!editor) return

    switch (key) {
      case 'left':
        editor.chain().focus().setTextAlign('left').run()
        break
      case 'center':
        editor.chain().focus().setTextAlign('center').run()
        break
      case 'right':
        editor.chain().focus().setTextAlign('right').run()
        break
    }
  }

  const menu = (
    <Menu onClickMenuItem={handleAlignClick}>
      <Menu.Item key="left">
        <IconAlignLeft /> 左对齐
      </Menu.Item>
      <Menu.Item key="center">
        <IconAlignCenter /> 居中对齐
      </Menu.Item>
      <Menu.Item key="right">
        <IconAlignRight /> 右对齐
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown droplist={menu} position="bottom">
      <Button type="text" icon={<IconAlignLeft />} />
    </Dropdown>
  )
}
