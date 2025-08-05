import { Dropdown, Button, Menu } from '@arco-design/web-react'
import { IconApps } from '@arco-design/web-react/icon'

export default function TableMenu({ editor }:any) {
  const menuItems = [
    { key: 'insert', content: '插入 2x2 表格' },
    { key: 'addRow', content: '在下方插入行' },
    { key: 'addCol', content: '在右侧插入列' },
    { key: 'delete', content: '删除表格' },
  ]

  const onClickMenuItem = (key: string) => {
    if (!editor) return
    const chain = editor.chain().focus()

    switch (key) {
      case 'insert':
        chain.insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()
        break
      case 'addRow':
        chain.addRowAfter().run()
        break
      case 'addCol':
        chain.addColumnAfter().run()
        break
      case 'delete':
        chain.deleteTable().run()
        break
    }
  }

  const droplist = (
    <Menu onClickMenuItem={onClickMenuItem}>
      {menuItems.map((item) => (
        <Menu.Item key={item.key}>{item.content}</Menu.Item>
      ))}
    </Menu>
  )

  return (
    <Dropdown droplist={droplist} position="bottom">
      <Button type="text" icon={<IconApps />} />
    </Dropdown>
  )
}
