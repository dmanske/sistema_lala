-- Template para criar novas funções com segurança
-- SEMPRE use este template ao criar funções no Supabase

-- Exemplo de função segura:
CREATE OR REPLACE FUNCTION nome_da_funcao(
    p_parametro1 uuid,
    p_parametro2 text,
    p_parametro3 numeric DEFAULT NULL
)
RETURNS jsonb  -- ou void, uuid, TABLE, etc
LANGUAGE plpgsql
SECURITY DEFINER  -- Necessário para funções que precisam bypass RLS
SET search_path = public, pg_temp  -- ⚠️ CRÍTICO: Previne search_path injection
AS $$
DECLARE
    v_variavel1 tipo;
    v_variavel2 tipo;
BEGIN
    -- Lógica da função aqui
    
    -- Exemplo de validação
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registro não encontrado';
    END IF;
    
    -- Retorno
    RETURN jsonb_build_object('success', true, 'data', v_variavel1);
END;
$$;

-- ⚠️ REGRAS OBRIGATÓRIAS:
-- 1. SEMPRE adicionar: SET search_path = public, pg_temp
-- 2. SEMPRE usar SECURITY DEFINER se a função precisa bypass RLS
-- 3. SEMPRE validar inputs e lançar exceções claras
-- 4. SEMPRE usar prepared statements (o plpgsql já faz isso automaticamente)
-- 5. NUNCA concatenar SQL dinamicamente sem sanitização

-- Exemplo de função SEM SECURITY DEFINER (quando não precisa bypass RLS):
CREATE OR REPLACE FUNCTION funcao_simples(p_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE  -- ou IMMUTABLE se não modifica dados
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN (SELECT name FROM tabela WHERE id = p_id);
END;
$$;

-- Exemplo de trigger function:
CREATE OR REPLACE FUNCTION trigger_function_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Lógica do trigger
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
