import React, { useState, useEffect } from 'react';
import { Image, Type } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoCard, InfoCardCategory, InfoCardForm, categoryTabs, COLOR_PRESETS } from '@/types/info-card';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { CardPreviewLive } from './CardPreviewLive';
import ImageUploader from '@/components/admin/midias/carrossel/ImageUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useNextOrderPosition, useCreateInfoCard, useUpdateInfoCard, uploadCardImage, deleteCardImage } from '@/hooks/useInfoCards';

interface InfoCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCard: InfoCard | null;
  defaultCategory: InfoCardCategory;
}

export function InfoCardModal({
  isOpen,
  onClose,
  editingCard,
  defaultCategory,
}: InfoCardModalProps) {
  const { user } = useAuth();
  const createMutation = useCreateInfoCard();
  const updateMutation = useUpdateInfoCard();
  
  const [formData, setFormData] = useState<InfoCardForm>({
    title: '',
    description: '',
    category: defaultCategory,
    iconName: 'CheckCircle',
    imageUrl: undefined,
    linkUrl: '',
    linkText: 'Saiba mais',
    backgroundColor: '#ffffff',
    iconColor: '#0e873d',
    orderPosition: 1,
    active: true,
  });
  
  const [visualType, setVisualType] = useState<'icon' | 'image'>('icon');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: nextPosition } = useNextOrderPosition(formData.category);
  
  // Reset form when modal opens/closes or editingCard changes
  useEffect(() => {
    if (isOpen) {
      if (editingCard) {
        setFormData({
          title: editingCard.title,
          description: editingCard.description,
          category: editingCard.category as InfoCardCategory,
          iconName: editingCard.icon_name || undefined,
          imageUrl: editingCard.image_url || undefined,
          linkUrl: editingCard.link_url || '',
          linkText: editingCard.link_text || 'Saiba mais',
          backgroundColor: editingCard.background_color || '#ffffff',
          iconColor: editingCard.icon_color || '#0e873d',
          orderPosition: editingCard.order_position,
          active: editingCard.active,
        });
        setVisualType(editingCard.image_url ? 'image' : 'icon');
      } else {
        setFormData({
          title: '',
          description: '',
          category: defaultCategory,
          iconName: 'CheckCircle',
          imageUrl: undefined,
          linkUrl: '',
          linkText: 'Saiba mais',
          backgroundColor: '#ffffff',
          iconColor: '#0e873d',
          orderPosition: nextPosition || 1,
          active: true,
        });
        setVisualType('icon');
      }
      setImageFile(null);
    }
  }, [isOpen, editingCard, defaultCategory, nextPosition]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadCardImage(imageFile);
        
        // Delete old image if editing and had previous image
        if (editingCard?.image_url && editingCard.image_url !== imageUrl) {
          await deleteCardImage(editingCard.image_url);
        }
      }
      
      const cardData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        icon_name: visualType === 'icon' ? formData.iconName : null,
        image_url: visualType === 'image' ? imageUrl : null,
        link_url: formData.linkUrl || null,
        link_text: formData.linkText,
        background_color: formData.backgroundColor,
        icon_color: formData.iconColor,
        order_position: formData.orderPosition,
        active: formData.active,
        created_by: user?.id || null,
      };
      
      if (editingCard) {
        await updateMutation.mutateAsync({ id: editingCard.id, ...cardData });
      } else {
        await createMutation.mutateAsync(cardData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setFormData(prev => ({
      ...prev,
      imageUrl: URL.createObjectURL(file),
    }));
  };
  
  const isValid = formData.title.length >= 3 && 
                  formData.description.length >= 10 &&
                  (visualType === 'icon' ? formData.iconName : (formData.imageUrl || imageFile));
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCard ? 'Editar Card' : 'Adicionar Card'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as InfoCardCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTabs.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Assistência Agronômica"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/100
                </p>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o benefício ou serviço..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500
                </p>
              </div>
              
              {/* Icon or Image */}
              <div className="space-y-2">
                <Label>Visual do Card *</Label>
                <Tabs value={visualType} onValueChange={(v) => setVisualType(v as 'icon' | 'image')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="icon" className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Ícone
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Imagem
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="icon" className="mt-3">
                    <IconPicker
                      selected={formData.iconName}
                      onSelect={(iconName) => setFormData(prev => ({ ...prev, iconName }))}
                      iconColor={formData.iconColor}
                    />
                  </TabsContent>
                  
                  <TabsContent value="image" className="mt-3">
                    <ImageUploader
                      value={formData.imageUrl}
                      onChange={(file) => {
                        if (file) {
                          handleImageUpload(file);
                        } else {
                          setImageFile(null);
                          setFormData(prev => ({ ...prev, imageUrl: undefined }));
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Cor de Fundo"
                  value={formData.backgroundColor}
                  onChange={(color) => setFormData(prev => ({ ...prev, backgroundColor: color }))}
                  presets={COLOR_PRESETS.background}
                />
                <ColorPicker
                  label="Cor do Ícone"
                  value={formData.iconColor}
                  onChange={(color) => setFormData(prev => ({ ...prev, iconColor: color }))}
                  presets={COLOR_PRESETS.icon}
                />
              </div>
              
              {/* Link */}
              <div className="space-y-2">
                <Label>Link (opcional)</Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://exemplo.com ou /pagina"
                />
              </div>
              
              {formData.linkUrl && (
                <div className="space-y-2">
                  <Label>Texto do Link</Label>
                  <Input
                    value={formData.linkText}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                    placeholder="Saiba mais"
                    maxLength={50}
                  />
                </div>
              )}
              
              {/* Status */}
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <span className="text-sm">
                    {formData.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Preview */}
            <div className="hidden lg:block">
              <CardPreviewLive formData={formData} />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
