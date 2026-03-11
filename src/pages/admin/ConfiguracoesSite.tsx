import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { SiteSettingUpdate, useSiteSettings } from '@/hooks/useSiteSettings';
import { Loader2, Mail, Menu, MessageSquare, Phone, Save, Settings } from 'lucide-react';
import React, { useState } from 'react';

const ConfiguracoesSite: React.FC = () => {
  const {
    settings,
    isLoading,
    getSetting,
    getSettingsByCategory,
    updateMultipleSettings,
    isUpdating
  } = useSiteSettings();

  // Estado local para formulário
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Quando os dados carregarem, inicializar o formulário
  React.useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      const initialData: Record<string, string> = {};
      settings.forEach(setting => {
        initialData[setting.setting_key] = setting.setting_value || '';
      });
      setFormData(initialData);
    }
  }, [settings]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveCategory = (category: string) => {
    const categorySettings = getSettingsByCategory(category);
    const updates: SiteSettingUpdate[] = categorySettings.map(setting => ({
      setting_key: setting.setting_key,
      setting_value: formData[setting.setting_key] || '',
      setting_category: setting.setting_category,
      setting_description: setting.setting_description || undefined,
    }));

    updateMultipleSettings(updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const contactSettings = getSettingsByCategory('contact');
  const generalSettings = getSettingsByCategory('general');
  const headerSettings = getSettingsByCategory('header');
  const whatsappSettings = getSettingsByCategory('whatsapp');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Configurações do Site</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações globais e parâmetros do site.
          Alterações feitas aqui são refletidas automaticamente em todas as páginas.
        </p>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="header" className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            Header
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Geral
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurações de Contato */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
              <CardDescription>
                Configure os dados de contato exibidos no site (topo, rodapé, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key} className="flex items-center gap-2">
                    {setting.setting_key === 'contact_phone' && <Phone className="w-4 h-4" />}
                    {setting.setting_key === 'contact_email' && <Mail className="w-4 h-4" />}
                    {setting.setting_key === 'whatsapp_number' && <MessageSquare className="w-4 h-4" />}
                    {setting.setting_description || setting.setting_key}
                  </Label>
                  <Input
                    id={setting.setting_key}
                    value={formData[setting.setting_key] || ''}
                    onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                    placeholder={
                      setting.setting_key === 'contact_phone' ? '(65) 99999-9999' :
                      setting.setting_key === 'contact_email' ? 'contato@exemplo.com.br' :
                      setting.setting_key === 'whatsapp_number' ? '5565999999999' :
                      'Digite o valor'
                    }
                  />
                  {setting.setting_key === 'whatsapp_number' && (
                    <p className="text-sm text-muted-foreground">
                      Formato internacional sem +. Ex: 5565999999999
                    </p>
                  )}
                  {setting.setting_key === 'contact_phone' && (
                    <p className="text-sm text-muted-foreground">
                      Este número aparece no topo de todas as páginas do site
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveCategory('contact')}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="w-5 h-5" />
                Configurações do Header
              </CardTitle>
              <CardDescription>
                Configure elementos exibidos no cabeçalho do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {headerSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {setting.setting_description || setting.setting_key}
                  </Label>
                  {setting.setting_key === 'show_portal_cooperado' ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={setting.setting_key}
                        checked={formData[setting.setting_key] === 'true'}
                        onCheckedChange={(checked) =>
                          handleInputChange(setting.setting_key, checked ? 'true' : 'false')
                        }
                      />
                      <Label htmlFor={setting.setting_key} className="text-sm font-normal">
                        {formData[setting.setting_key] === 'true' ? 'Ativo' : 'Inativo'}
                      </Label>
                    </div>
                  ) : (
                    <Input
                      id={setting.setting_key}
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      placeholder={
                        setting.setting_key === 'portal_cooperado_url'
                          ? 'https://portal.exemplo.com.br'
                          : 'Digite o valor'
                      }
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveCategory('header')}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Header
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Configurações do WhatsApp
              </CardTitle>
              <CardDescription>
                Configure o botão flutuante do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {whatsappSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {setting.setting_description || setting.setting_key}
                  </Label>
                  {setting.setting_key === 'whatsapp_button_message' ? (
                    <Textarea
                      id={setting.setting_key}
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      placeholder="Olá! Gostaria de mais informações sobre a Cooprosoja."
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={setting.setting_key}
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      placeholder={
                        setting.setting_key === 'whatsapp_button_number'
                          ? '5565999999999'
                          : 'Digite o valor'
                      }
                    />
                  )}
                  {setting.setting_key === 'whatsapp_button_number' && (
                    <p className="text-sm text-muted-foreground">
                      Formato internacional sem +. Ex: 5565999999999
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveCategory('whatsapp')}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure informações básicas e identidade do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generalSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key}>
                    {setting.setting_description || setting.setting_key}
                  </Label>
                  {setting.setting_key === 'site_tagline' ? (
                    <Textarea
                      id={setting.setting_key}
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      placeholder="Digite o slogan do site"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={setting.setting_key}
                      value={formData[setting.setting_key] || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
                      placeholder="Digite o valor"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => handleSaveCategory('general')}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Geral
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Card informativo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 text-lg">Sobre as Configurações</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p>
            <strong>Configurações do Site</strong> centraliza todos os parâmetros reutilizados em várias páginas.
          </p>
          <p>
            Ao alterar uma configuração aqui, a mudança é refletida <strong>automaticamente</strong> em todas as páginas que utilizam essa informação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesSite;
