# 🔒 CORREÇÃO DE SEGURANÇA - Storage de Fotos

## ⚠️ PROBLEMA IDENTIFICADO

O bucket `client-photos` está configurado como **público**, permitindo que qualquer pessoa com a URL acesse as fotos dos clientes.

## 🛠️ SOLUÇÃO

### 1. Tornar o Bucket Privado

Execute no Supabase SQL Editor:

```sql
-- Tornar bucket privado
UPDATE storage.buckets 
SET public = false 
WHERE name = 'client-photos';
```

### 2. Criar Políticas de Acesso RLS para Storage

```sql
-- Permitir usuários autenticados fazerem upload apenas na sua pasta
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir usuários autenticados visualizarem apenas fotos do seu tenant
CREATE POLICY "Users can view own tenant photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM auth.users 
    WHERE id IN (
      SELECT id FROM profiles WHERE tenant_id = get_my_tenant_id()
    )
  )
);

-- Permitir usuários autenticados deletarem apenas fotos do seu tenant
CREATE POLICY "Users can delete own tenant photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM auth.users 
    WHERE id IN (
      SELECT id FROM profiles WHERE tenant_id = get_my_tenant_id()
    )
  )
);
```

### 3. Atualizar Código para Usar URLs Assinadas

**Antes (URL pública):**
```typescript
const { data: { publicUrl } } = supabase.storage
  .from("client-photos")
  .getPublicUrl(data.path);
```

**Depois (URL assinada - expira em 1 hora):**
```typescript
const { data, error: signError } = await supabase.storage
  .from("client-photos")
  .createSignedUrl(data.path, 3600); // 1 hora

if (signError) {
  return NextResponse.json({ error: "Erro ao gerar URL" }, { status: 500 });
}

return NextResponse.json({ url: data.signedUrl });
```

### 4. Atualizar Componentes que Exibem Fotos

Quando buscar clientes, gerar URLs assinadas:

```typescript
// Em getClientRepository ou similar
const { data: signedUrl } = await supabase.storage
  .from("client-photos")
  .createSignedUrl(client.photo_url, 3600);

client.photo_url = signedUrl?.signedUrl || client.photo_url;
```

## 📊 IMPACTO

**Antes:**
- ❌ Qualquer pessoa com URL pode ver fotos
- ❌ Fotos acessíveis indefinidamente
- ❌ Sem controle de acesso

**Depois:**
- ✅ Apenas usuários autenticados do mesmo tenant
- ✅ URLs expiram em 1 hora (renováveis)
- ✅ RLS protege acesso ao storage

## ⏱️ TEMPO ESTIMADO

- Executar SQL: 2 minutos
- Atualizar código: 30 minutos
- Testar: 15 minutos
- **Total: ~45 minutos**

## 🎯 PRIORIDADE

**ALTA** - Dados sensíveis de clientes expostos

## 📝 CHECKLIST

- [ ] Executar SQL para tornar bucket privado
- [ ] Criar políticas RLS para storage
- [ ] Atualizar API de upload para usar URLs assinadas
- [ ] Atualizar repositórios para gerar URLs assinadas ao buscar clientes
- [ ] Testar upload de foto
- [ ] Testar visualização de foto
- [ ] Testar que usuários de outros tenants não veem fotos
- [ ] Documentar mudança no PRD

## 🔗 REFERÊNCIAS

- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [Signed URLs](https://supabase.com/docs/guides/storage/serving/downloads#authenticated-downloads)
