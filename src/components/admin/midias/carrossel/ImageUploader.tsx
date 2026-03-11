import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string | File;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  );

  const handleFile = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    onChange(null);
  }, [onChange]);

  if (preview) {
    return (
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label
              className={cn(
                'px-3 py-1.5 bg-white text-foreground text-sm rounded-md cursor-pointer hover:bg-gray-100 transition-colors',
                disabled && 'pointer-events-none opacity-50'
              )}
            >
              Alterar
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                disabled={disabled}
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="px-3 py-1.5 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              Remover
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          disabled && 'pointer-events-none opacity-50',
          error && 'border-destructive'
        )}
      >
        <div className="flex flex-col items-center justify-center py-6">
          {isDragging ? (
            <ImageIcon className="w-10 h-10 mb-3 text-primary" />
          ) : (
            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
          )}
          <p className="text-sm text-foreground font-medium">
            {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG ou WebP - Máx 2MB
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </label>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;
