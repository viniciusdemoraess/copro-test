import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAboutContent, useUpdateAboutContent, useUploadAboutImage } from '@/hooks/useAboutContent';
import { Loader2, Save, FileText, Info } from 'lucide-react';

const QuemSomos: React.FC = () => {
  const { data: whyWeExist, isLoading: loadingWhy } = useAboutContent('why_we_exist');
  const { data: informations, isLoading: loadingInfo } = useAboutContent('informations');
  const updateMutation = useUpdateAboutContent();
  const uploadMutation = useUploadAboutImage();

  const [whyForm, setWhyForm] = useState({ title: '', content: '', image_url: '' });
  const [infoForm, setInfoForm] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (whyWeExist && !Array.isArray(whyWeExist)) {
      setWhyForm({
        title: whyWeExist.title || '',
        content: whyWeExist.content || '',
        image_url: whyWeExist.image_url || '',
      });
      setImagePreview(whyWeExist.image_url || '');
    }
  }, [whyWeExist]);

  useEffect(() => {
    if (informations && !Array.isArray(informations)) {
      setInfoForm({
        title: informations.title || '',
        content: informations.content || '',
      });
    }
  }, [informations]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWhy = async () => {
    let imageUrl = whyForm.image_url;

    if (imageFile) {
      const uploadedUrl = await uploadMutation.mutateAsync({
        file: imageFile,
        section: 'why_we_exist',
      });
      imageUrl = uploadedUrl;
    }

    await updateMutation.mutateAsync({
      section_key: 'why_we_exist',
      title: whyForm.title,
      content: whyForm.content,
      image_url: imageUrl,
    });
  };

  const handleSaveInfo = async () => {
    await updateMutation.mutateAsync({
      section_key: 'informations',
      title: infoForm.title,
      content: infoForm.content,
    });
  };

  if (loadingWhy || loadingInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Quem Somos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie o conteúdo da seção "Quem Somos" exibida na página inicial
        </p>
      </div>

      <Tabs defaultValue="why" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="why" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Por que Existimos
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Informações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="why" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Por que Existimos
              </CardTitle>
              <CardDescription>
                Edite o título, conteúdo e imagem da seção principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="why-title">Título</Label>
                <Input
                  id="why-title"
                  value={whyForm.title}
                  onChange={(e) => setWhyForm({ ...whyForm, title: e.target.value })}
                  placeholder="Por Que Existimos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="why-content">Conteúdo (HTML)</Label>
                <Textarea
                  id="why-content"
                  value={whyForm.content}
                  onChange={(e) => setWhyForm({ ...whyForm, content: e.target.value })}
                  placeholder="Digite o conteúdo em HTML. Ex: <p>Texto...</p>"
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use tags HTML: &lt;p&gt; para parágrafos, &lt;em&gt; para itálico, &lt;strong&gt; para negrito
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="why-image">Imagem (592px x 610px recomendado)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="why-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveWhy}
                  disabled={updateMutation.isPending || uploadMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending || uploadMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Por que Existimos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Informações
              </CardTitle>
              <CardDescription>
                Edite o título e conteúdo do card de informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="info-title">Título</Label>
                <Input
                  id="info-title"
                  value={infoForm.title}
                  onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
                  placeholder="Informações Cooprosoja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="info-content">Conteúdo (HTML)</Label>
                <Textarea
                  id="info-content"
                  value={infoForm.content}
                  onChange={(e) => setInfoForm({ ...infoForm, content: e.target.value })}
                  placeholder="Digite o conteúdo em HTML. Ex: <p>Texto...</p>"
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use tags HTML: &lt;p&gt; para parágrafos, &lt;em&gt; para itálico, &lt;strong&gt; para negrito
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveInfo}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Informações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 text-lg">Sobre a Edição de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p>
            O conteúdo é editado usando <strong>HTML básico</strong>.
          </p>
          <p>
            <strong>Tags principais:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>&lt;p&gt;Texto do parágrafo&lt;/p&gt; - Para criar parágrafos</li>
            <li>&lt;em&gt;Texto&lt;/em&gt; - Para texto em itálico</li>
            <li>&lt;strong&gt;Texto&lt;/strong&gt; - Para texto em negrito</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuemSomos;
