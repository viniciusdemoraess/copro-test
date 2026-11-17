# 🚀 Guia de Deploy no Nginx - Path `/cooprosoja`

## **Passo 1: Build da Aplicação**

Na sua máquina local:

```bash
cd C:\Projetos\COOPROSOJA\SITE

# Instalar dependências (se necessário)
npm install

# Build para produção
npm run build
```

Isso vai criar uma pasta `dist/` com os arquivos estáticos prontos.

---

## **Passo 2: Transferir Arquivos para o Servidor**

Usando SCP ou SFTP:

```bash
# Copiar build para servidor
scp -r dist/ usuario@seu-servidor.com:/var/www/cooprosoja/

# Ou usando rsync (mais eficiente)
rsync -avz dist/ usuario@seu-servidor.com:/var/www/cooprosoja/
```

---

## **Passo 3: Configurar Nginx**

### Opção A: Novo bloco server (recomendado)

Crie arquivo: `/etc/nginx/sites-available/cooprosoja`

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name seu-servidor.com www.seu-servidor.com;
    
    # Redirecionar HTTP para HTTPS (opcional)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name seu-servidor.com www.seu-servidor.com;
    
    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-servidor.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-servidor.com/privkey.pem;
    
    # Raiz da aplicação
    root /var/www;
    
    # Compressão
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Rota principal da aplicação Cooprosoja
    location /cooprosoja/ {
        alias /var/www/cooprosoja/;
        
        # Tentar arquivo, senão servir index.html (SPA)
        try_files $uri $uri/ /cooprosoja/index.html;
        
        # Headers de cache para HTML
        add_header Cache-Control "public, max-age=3600";
        
        # Headers de segurança
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
    
    # Health check (opcional)
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

### Opção B: Adicionar ao bloco server existente

Se já tem um servidor rodando:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name seu-servidor.com;
    root /var/www;
    
    # ... outras configurações ...
    
    # Adicionar esta seção:
    location /cooprosoja/ {
        alias /var/www/cooprosoja/;
        try_files $uri $uri/ /cooprosoja/index.html;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

---

## **Passo 4: Ativar Configuração**

```bash
# Criar link simbólico (se usando sites-available/enabled)
sudo ln -s /etc/nginx/sites-available/cooprosoja /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Se tudo ok, recarregar Nginx
sudo systemctl reload nginx
# ou
sudo service nginx reload
```

---

## **Passo 5: Verificar Deploy**

```bash
# Ver logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Testar URL
curl -I https://seu-servidor.com/cooprosoja/
```

---

## **Estrutura de Diretórios Esperada**

```
/var/www/
├── cooprosoja/
│   ├── index.html
│   ├── assets/
│   │   ├── *.js
│   │   └── *.css
│   └── ... outros arquivos
```

---

## **Environment Variables**

Se precisar de variáveis de ambiente para Supabase:

1. Adicionar ao `src/.env.production`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

2. Fazer rebuild: `npm run build`

3. Ou usar um script de inicialização que injeta as variáveis no HTML

---

## **Melhorias Adicionais**

### Adicionar SSL/HTTPS com Let's Encrypt:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-servidor.com
```

### Configurar Auto-Renew:

```bash
sudo systemctl enable certbot.timer
```

### Monitoramento:

```bash
# Ver status do Nginx
sudo systemctl status nginx

# Monitorar uso de recursos
sudo htop

# Verificar portas abertas
sudo netstat -tlnp | grep nginx
```

---

## **Troubleshooting**

### 404 Not Found
```nginx
# Adicionar debug
try_files $uri $uri/ /cooprosoja/index.html =404;
error_log /var/log/nginx/cooprosoja_error.log debug;
```

### CORS Issues
```nginx
add_header Access-Control-Allow-Origin "https://seu-servidor.com" always;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
```

### Assets não carregam
- Verificar se `base: '/cooprosoja/'` está em `vite.config.ts`
- Limpar cache do navegador (Ctrl+Shift+Del)
- Verificar path correto: `/var/www/cooprosoja/assets/`

---

## **Script de Deploy Automático**

Crie `deploy.sh`:

```bash
#!/bin/bash

echo "🔨 Iniciando build..."
npm run build

echo "📤 Transferindo arquivos..."
rsync -avz --delete dist/ usuario@seu-servidor.com:/var/www/cooprosoja/

echo "🔄 Recarregando Nginx..."
ssh usuario@seu-servidor.com sudo systemctl reload nginx

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://seu-servidor.com/cooprosoja/"
```

Executar:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## **Comandos Úteis**

```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Verificar espaço em disco
df -h

# Remover build antigo antes de novo deploy
rm -rf /var/www/cooprosoja/*

# Ver permissões
ls -la /var/www/cooprosoja/

# Definir permissões corretas
sudo chown -R www-data:www-data /var/www/cooprosoja/
sudo chmod -R 755 /var/www/cooprosoja/
```

---

## **Checklist Final**

- ✅ `vite.config.ts` com `base: '/cooprosoja/'`
- ✅ Build executado: `npm run build`
- ✅ Arquivos em `/var/www/cooprosoja/`
- ✅ Nginx configurado com `location /cooprosoja/`
- ✅ `try_files $uri $uri/ /cooprosoja/index.html`
- ✅ Nginx testado: `nginx -t`
- ✅ Nginx recarregado: `systemctl reload nginx`
- ✅ Acesso em: `https://seu-servidor.com/cooprosoja/`
- ✅ Assets carregando corretamente
- ✅ SPA routing funcionando (F5 em qualquer página)

---

**Dúvidas?** Verifique logs:
```bash
sudo tail -f /var/log/nginx/error.log
```
