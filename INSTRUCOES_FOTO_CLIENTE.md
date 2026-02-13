# Instruções para Habilitar Upload de Foto do Cliente

## O que foi implementado

1. **Componente PhotoUpload** (`src/components/clients/PhotoUpload.tsx`)
   - Interface de upload com preview
   - Validação de tipo (apenas imagens)
   - Validação de tamanho (máximo 2MB)
   - Preview circular da foto
   - Botão para remover foto

2. **API Route** (`src/app/api/upload/client-photo/route.ts`)
   - Endpoint para upload de fotos
   - Validação de autenticação
   - Upload para Supabase Storage
   - Retorna URL pública da foto

3. **Integração nos Formulários**
   - `ClientForm.tsx` - Formulário de criação/edição
   - `ClientDialog.tsx` - Dialog de criação rápida
   - Ambos agora incluem o campo de upload de foto

4. **Migration do Storage** (`supabase/migrations/20260212170000_create_client_photos_bucket.sql`)
   - Cria bucket público `client-photos`
   - Configura políticas de segurança (RLS)
   - Limita tamanho e tipos de arquivo

## Como aplicar no Supabase

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New Bucket**
5. Configure o bucket:
   - **Name**: `client-photos`
   - **Public bucket**: ✅ Ativado
   - **File size limit**: `2097152` (2MB)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`
6. Clique em **Create bucket**

7. Agora configure as políticas RLS:
   - Clique no bucket `client-photos`
   - Vá na aba **Policies**
   - Clique em **New Policy**
   - Crie as seguintes políticas:

**Política 1: Upload de fotos**
```sql
CREATE POLICY "Users can upload client photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'client-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
```

**Política 2: Atualizar fotos**
```sql
CREATE POLICY "Users can update their client photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'client-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
```

**Política 3: Deletar fotos**
```sql
CREATE POLICY "Users can delete their client photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'client-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
```

**Política 4: Visualizar fotos (público)**
```sql
CREATE POLICY "Public can view client photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'client-photos');
```

### Opção 2: Via SQL Editor

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `supabase/migrations/20260212170000_create_client_photos_bucket.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 3: Via CLI (se tiver Supabase CLI configurado)

```bash
npx supabase db push
```

## Como testar

1. Acesse a aplicação
2. Vá em **Clientes** > **Novo Cliente**
3. Preencha os dados obrigatórios
4. Clique na área de upload de foto
5. Selecione uma imagem (JPG, PNG, WEBP até 2MB)
6. Aguarde o upload
7. Veja o preview da foto
8. Salve o cliente
9. Acesse o perfil do cliente para ver a foto no avatar

## Estrutura de armazenamento

As fotos são organizadas por usuário:
```
client-photos/
  └── {user_id}/
      ├── 1707753600000.jpg
      ├── 1707753700000.png
      └── ...
```

Isso garante que cada usuário só pode gerenciar suas próprias fotos.

## Observações

- O campo `photo_url` já existe na tabela `clients` do banco de dados
- A exibição da foto já está implementada na página de perfil do cliente
- O componente Avatar já suporta fallback com iniciais caso não haja foto
- As fotos são públicas (podem ser visualizadas por qualquer pessoa com a URL)
- Apenas usuários autenticados podem fazer upload, atualizar ou deletar fotos
- Cada usuário só pode gerenciar fotos na sua própria pasta

## Próximos passos (opcional)

- Adicionar compressão de imagens antes do upload
- Adicionar crop/redimensionamento de imagens
- Adicionar suporte a arrastar e soltar (drag & drop)
- Adicionar galeria de fotos do cliente
