import React, { useState } from 'react';
import { Loader2, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { extractYouTubeVideoId, fetchYouTubeData, isValidYouTubeUrl } from '@/lib/youtube-utils';
import { YouTubeVideoData } from '@/types/podcast';

interface YouTubeUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onDataLoaded: (data: YouTubeVideoData) => void;
  disabled?: boolean;
  error?: string;
}

const YouTubeUrlInput: React.FC<YouTubeUrlInputProps> = ({
  value,
  onChange,
  onDataLoaded,
  disabled = false,
  error,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isValid = isValidYouTubeUrl(value);

  const handleLoad = async () => {
    if (!isValid) return;

    const videoId = extractYouTubeVideoId(value);
    if (!videoId) return;

    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchYouTubeData(videoId);
      onDataLoaded(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="youtube-url">URL do YouTube *</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="youtube-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setLoadError(null);
            }}
            className="pl-10"
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          onClick={handleLoad}
          disabled={!isValid || loading || disabled}
          variant="secondary"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Carregar'
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Cole o link do vídeo do YouTube e clique em "Carregar" para extrair as informações
      </p>
      {(error || loadError) && (
        <p className="text-xs text-destructive">{error || loadError}</p>
      )}
    </div>
  );
};

export default YouTubeUrlInput;
