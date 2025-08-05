import React, { useState, useCallback } from 'react';
import { Button, Popover, ActionList, Icon } from '@shopify/polaris';
import {  DataTableIcon } from '@shopify/polaris-icons';

interface TableMenuProps {
  editor: any;
}

export default function TableMenu({ editor }: TableMenuProps) {
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const handleClose = useCallback(() => setActive(false), []);

  const handleAction = (key: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();

    switch (key) {
      case 'insert':
        chain.insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
        break;
      case 'addRow':
        chain.addRowAfter().run();
        break;
      case 'addCol':
        chain.addColumnAfter().run();
        break;
      case 'delete':
        chain.deleteTable().run();
        break;
    }

    setActive(false); // 点击后关闭 Popover
  };

  const actions = [
    { content: '插入 2x2 表格', onAction: () => handleAction('insert') },
    { content: '在下方插入行', onAction: () => handleAction('addRow') },
    { content: '在右侧插入列', onAction: () => handleAction('addCol') },
    { content: '删除表格', destructive: true, onAction: () => handleAction('delete') },
  ];

  return (
    <Popover
      active={active}
      activator={
        <Button icon={<Icon source={DataTableIcon} />} onClick={toggleActive} size="slim" />
      }
      onClose={handleClose}
    >
      <ActionList items={actions} />
    </Popover>
  );
}
