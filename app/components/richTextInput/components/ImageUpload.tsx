// components/LocalImageUpload.tsx
import { Button } from '@arco-design/web-react';
import { IconImage } from '@arco-design/web-react/icon';
import React, { useRef } from 'react';

export default function LocalImageUpload({ editor }: { editor: any }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 只接受图片
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);

    // 重置 input 否则无法连续选择同一个文件
    e.target.value = '';
  };

  return (
    <>
      <Button
        type="text"
        onClick={() => fileInputRef.current?.click()}
      >
        <IconImage />
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
