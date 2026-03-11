import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { detectVideoType, getVideoTypeBadge } from '@/lib/video-utils';
import VideoPlayer from './VideoPlayer';
import type { VideoType } from '@/types/media';

interface VideoUrlInputProps {
  value: string;
  onChange: (url: string, type: VideoType | null) => void;
  error?: string;
  disabled?: boolean;
}

const VideoUrlInput: React.FC<VideoUrlInputProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [detectedType, setDetectedType] = useState<VideoType | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (value) {
      const type = detectVideoType(value);
      setDetectedType(type);
      setShowPreview(!!type);
      onChange(value, type);
    } else {
      setDetectedType(null);
      setShowPreview(false);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    const type = detectVideoType(newUrl);
    setDetectedType(type);
    setShowPreview(!!type);
    onChange(newUrl, type);
  };

  const typeBadge = detectedType ? getVideoTypeBadge(detectedType) : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL do Vídeo *</Label>
        <div className="relative">
          <Input
            id="videoUrl"
            value={value}
            onChange={handleChange}
            placeholder="Cole o link do YouTube, Vimeo ou Google Drive"
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
          {detectedType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge className={typeBadge?.color}>{typeBadge?.label}</Badge>
            </div>
          )}
          {value && !detectedType && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Formatos aceitos:
          </p>
          <ul className="ml-4 space-y-0.5">
            <li>YouTube: https://www.youtube.com/watch?v=...</li>
            <li>Vimeo: https://vimeo.com/...</li>
            <li>Google Drive: https://drive.google.com/file/d/.../view</li>
          </ul>
        </div>
      </div>

      {/* Preview */}
      {showPreview && detectedType && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="border border-border rounded-lg overflow-hidden">
            <VideoPlayer url={value} type={detectedType} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUrlInput;
