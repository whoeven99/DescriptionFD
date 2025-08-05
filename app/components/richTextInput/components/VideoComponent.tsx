import { Modal, Input } from '@arco-design/web-react';
import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface VideoComponentProps {
  onInsert: (url: string) => void;
}

const VideoComponent = forwardRef(({ onInsert }: VideoComponentProps, ref) => {
  const [visible, setVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const openModal = () => {
    setVideoUrl('');
    setVisible(true);
  };

  const handleOk = () => {
    if (videoUrl) {
      onInsert(videoUrl);
      setVisible(false);
    }
  };

  useImperativeHandle(ref, () => ({
    openModal,
  }));

  return (
    <Modal
      title="插入视频"
      visible={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      okText="确认"
      cancelText="取消"
    >
      <Input
        placeholder="请输入 iframe 视频链接"
        value={videoUrl}
        onChange={setVideoUrl}
      />
    </Modal>
  );
});

export default VideoComponent;