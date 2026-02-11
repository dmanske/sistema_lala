#!/usr/bin/env node

/**
 * Script para aplicar migrations no Supabase
 * 
 * Uso:
 *   node scripts/apply-migration.mjs
 * 
 * Este script lê o arquivo SQL de migração e aplica via Supabase client
 * usando a service_role_key para bypass de RLS.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load env from .env.local
import { config } from 'dotenv';
config({ path: join(rootDir, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

async function applyMigration(filename) {
    const filePath = join(rootDir, 'supabase', 'migrations', filename);
    console.log(`\n📄 Reading: ${filename}`);

    const sql = readFileSync(filePath, 'utf-8');

    console.log(`🔄 Applying migration...`);

    // Split by semicolons, but handle DO $$ blocks properly
    const statements = splitStatements(sql);

    let successCount = 0;
    let errorCount = 0;

    for (const stmt of statements) {
        const trimmed = stmt.trim();
        if (!trimmed || trimmed.startsWith('--')) continue;

        try {
            const { error } = await supabase.rpc('exec_sql', { sql_string: trimmed });
            if (error) {
                // Try direct query via postgrest
                console.error(`  ⚠️  Statement error: ${error.message}`);
                console.error(`     SQL: ${trimmed.substring(0, 100)}...`);
                errorCount++;
            } else {
                successCount++;
            }
        } catch (e) {
            console.error(`  ❌ Exception: ${e.message}`);
            errorCount++;
        }
    }

    console.log(`\n✅ Applied: ${successCount} statements`);
    if (errorCount > 0) {
        console.log(`⚠️  Errors: ${errorCount} statements`);
    }
}

function splitStatements(sql) {
    const results = [];
    let current = '';
    let inDollarBlock = false;

    const lines = sql.split('\n');

    for (const line of lines) {
        current += line + '\n';

        // Track $$ blocks (DO blocks, CREATE FUNCTION, etc.)
        const dollarCount = (line.match(/\$\$/g) || []).length;
        if (dollarCount % 2 !== 0) {
            inDollarBlock = !inDollarBlock;
        }

        // If we hit a semicolon outside a $$ block, that's a statement boundary
        if (!inDollarBlock && line.trimEnd().endsWith(';')) {
            results.push(current.trim());
            current = '';
        }
    }

    // Remaining
    if (current.trim()) {
        results.push(current.trim());
    }

    return results;
}

// Main
const migrationFile = process.argv[2] || '001_complete_schema.sql';
console.log('🚀 Supabase Migration Runner');
console.log(`📍 URL: ${supabaseUrl}`);
applyMigration(migrationFile)
    .then(() => console.log('\n🏁 Done!'))
    .catch(err => {
        console.error('\n💥 Fatal error:', err.message);
        process.exit(1);
    });
