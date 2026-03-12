import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCreateSlide, useUpdateSlide } from '@/hooks/useCarouselSlides';
import { useAuth } from '@/contexts/AuthContext';
import ImageUploader from './ImageUploader';
import type { CarouselSlide } from '@/types/media';

const formSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  subtitle: z.string().max(200, 'Máximo 200 caracteres').optional(),
  linkUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http'),
      'URL inválida'
    ),
  active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface CarouselSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide?: CarouselSlide | null;
  nextPosition: number;
}

const CarouselSlideModal: React.FC<CarouselSlideModalProps> = ({
  isOpen,
  onClose,
  slide,
  nextPosition,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading, error: uploadError } = useImageUpload();
  const createSlide = useCreateSlide();
  const updateSlide = useUpdateSlide();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(slide?.image_url || null);
  const [imageError, setImageError] = useState<string | null>(null);

  const isEditing = !!slide;
  const isSubmitting = createSlide.isPending || updateSlide.isPending || uploading;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: slide?.title || '',
      subtitle: slide?.subtitle || '',
      linkUrl: slide?.link_url || '',
      active: slide?.active ?? true,
    },
  });

  useEffect(() => {
    if (slide) {
      form.reset({
        title: slide.title,
        subtitle: slide.subtitle || '',
        linkUrl: slide.link_url || '',
        active: slide.active,
      });
      setImageUrl(slide.image_url);
      setImageFile(null);
    } else {
      form.reset({
        title: '',
        subtitle: '',
        linkUrl: '',
        active: true,
      });
      setImageUrl(null);
      setImageFile(null);
    }
  }, [slide, form]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImageError(null);
    if (!file) {
      setImageUrl(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let finalImageUrl = imageUrl;

      // Upload new image if provided
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (!url) {
          setImageError(uploadError || 'Erro ao fazer upload da imagem');
          return;
        }
        finalImageUrl = url;
      }

      // Validate image exists
      if (!finalImageUrl) {
        setImageError('Imagem é obrigatória');
        return;
      }

      if (isEditing && slide) {
        await updateSlide.mutateAsync({
          id: slide.id,
          title: data.title,
          subtitle: data.subtitle || null,
          link_url: data.linkUrl || null,
          image_url: finalImageUrl,
          active: data.active,
        });
        toast({ title: 'Slide atualizado com sucesso' });
      } else {
        await createSlide.mutateAsync({
          title: data.title,
          subtitle: data.subtitle || null,
          link_url: data.linkUrl || null,
          image_url: finalImageUrl,
          order_position: nextPosition,
          active: data.active,
          created_by: user?.id || null,
        });
        toast({ title: 'Slide criado com sucesso' });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao salvar slide',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Slide' : 'Adicionar Slide'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem *</Label>
            <ImageUploader
              value={imageFile || imageUrl || undefined}
              onChange={handleImageChange}
              error={imageError || undefined}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Dimensões recomendadas: 1920x600px
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Economia na aquisição"
              {...form.register('title')}
              disabled={isSubmitting}
            />
            <div className="flex justify-between">
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {form.watch('title')?.length || 0}/100
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              placeholder="Descrição complementar (opcional)"
              {...form.register('subtitle')}
              disabled={isSubmitting}
            />
            <div className="flex justify-between">
              {form.formState.errors.subtitle && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subtitle.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {form.watch('subtitle')?.length || 0}/200
              </span>
            </div>
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link de Destino</Label>
            <Input
              id="linkUrl"
              placeholder="https://exemplo.com ou /pagina-interna"
              {...form.register('linkUrl')}
              disabled={isSubmitting}
            />
            {form.formState.errors.linkUrl && (
              <p className="text-sm text-destructive">
                {form.formState.errors.linkUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Para onde o usuário será redirecionado ao clicar
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="active">Status</Label>
              <p className="text-sm text-muted-foreground">
                {form.watch('active') ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <Switch
              id="active"
              checked={form.watch('active')}
              onCheckedChange={(checked) => form.setValue('active', checked)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarouselSlideModal;
