import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import VideoPlayer from '../shared/VideoPlayer';
import type { PopupVideo, VideoType } from '@/types/media';

interface PopupPreviewProps {
  video: PopupVideo;
  isOpen: boolean;
  onClose: () => void;
}

const PopupPreview: React.FC<PopupPreviewProps> = ({
  video,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <DialogTitle>{video.title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="px-4 pb-4">
          <VideoPlayer
            url={video.video_url}
            type={video.video_type as VideoType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupPreview;
