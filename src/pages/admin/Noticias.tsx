import React, { useState } from 'react';
import { Plus, Trash2, Edit, Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNewsAdmin,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  useUploadNewsImage,
  getNewsImages,
  News,
} from '@/hooks/useNews';

export default function Noticias() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);

  // Multiple images state: list of { file?: File, preview: string, url?: string }
  const [images, setImages] = useState<{ file?: File; preview: string; url?: string }[]>([]);

  const { data: newsList, isLoading } = useNewsAdmin();
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const deleteMutation = useDeleteNews();
  const uploadMutation = useUploadNewsImage();

  const handleAdd = () => {
    setEditingNews(null);
    setImages([]);
    setIsModalOpen(true);
  };

  const handleEdit = (news: News) => {
    setEditingNews(news);
    const existingImages = getNewsImages(news).map((url) => ({ preview: url, url }));
    setImages(existingImages);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deletingNews) {
      await deleteMutation.mutateAsync(deletingNews.id);
      setDeletingNews(null);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map((file) => {
      const preview = URL.createObjectURL(file);
      return { file, preview };
    });
    setImages((prev) => [...prev, ...newEntries]);
    // Reset input so same files can be re-added if needed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const entry = prev[index];
      if (entry.file) URL.revokeObjectURL(entry.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (images.length === 0) {
      alert('Por favor, adicione pelo menos uma imagem');
      return;
    }

    // Upload any new files; keep existing URLs as-is
    const uploadedUrls: string[] = [];
    for (const entry of images) {
      if (entry.file) {
        const url = await uploadMutation.mutateAsync(entry.file);
        uploadedUrls.push(url);
      } else if (entry.url) {
        uploadedUrls.push(entry.url);
      }
    }

    const firstImageUrl = uploadedUrls[0];
    const title = formData.get('title') as string;
    const slug = editingNews?.slug || generateSlug(title);

    const data = {
      title,
      summary: formData.get('summary') as string,
      content: formData.get('content') as string,
      image_url: firstImageUrl,
      image_urls: uploadedUrls,
      slug,
      active: formData.get('active') === 'on',
      order_position: 0,
    };

    try {
      if (editingNews) {
        await updateMutation.mutateAsync({ id: editingNews.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      setEditingNews(null);
      setImages([]);
    } catch (error) {
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notícias</h1>
          <p className="text-muted-foreground">
            Gerencie as notícias exibidas no site
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Notícia
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {newsList?.map((news) => (
            <div
              key={news.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <img
                src={getNewsImages(news)[0]}
                alt={news.title}
                className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="font-bold text-lg text-foreground">{news.title}</h3>
                  {news.active ? (
                    <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Inativo
                    </span>
                  )}
                  {getNewsImages(news).length > 1 && (
                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      {getNewsImages(news).length} imagens
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {news.summary}
                </p>
                <p className="text-xs text-muted-foreground">
                  Criado em: {formatDate(news.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(news)}
                  className="h-9 w-9"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingNews(news)}
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {newsList?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma notícia cadastrada. Clique em "Adicionar Notícia" para começar.
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl">
                {editingNews ? 'Editar Notícia' : 'Adicionar Notícia'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Preencha os dados da notícia
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingNews?.title || ''}
                  required
                  placeholder="Digite o título da notícia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumo *</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  defaultValue={editingNews?.summary || ''}
                  required
                  placeholder="Breve resumo da notícia (será exibido nos cards)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo (HTML) *</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingNews?.content || ''}
                  required
                  placeholder="Conteúdo completo da notícia em HTML"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use tags HTML: &lt;p&gt; para parágrafos, &lt;h2&gt; para subtítulos, &lt;strong&gt; para negrito
                </p>
              </div>

              {/* Multiple images */}
              <div className="space-y-3">
                <Label>
                  Imagens *{' '}
                  <span className="text-muted-foreground font-normal text-xs">
                    (a primeira será a capa; adicione mais de uma para exibir em carrossel)
                  </span>
                </Label>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Imagem ${i + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            capa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remover imagem"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                />
                <p className="text-xs text-muted-foreground">
                  Você pode selecionar múltiplos arquivos de uma vez ou adicionar em várias etapas.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="active" className="text-base font-medium">
                    Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notícia ativa será exibida no site
                  </p>
                </div>
                <Switch
                  id="active"
                  name="active"
                  defaultChecked={editingNews?.active ?? true}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Salvando...'
                  : editingNews
                  ? 'Salvar Alterações'
                  : 'Criar Notícia'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingNews} onOpenChange={() => setDeletingNews(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
