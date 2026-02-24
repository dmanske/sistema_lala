"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAniversariantesHoje, diasParaProximoAniversario, isAniversarioHoje } from '@/lib/utils/birthdayUtils';
import { formatBirthDate, calcularIdade, formatPhone, parseLocalDate } from '@/lib/utils/dateFormatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Gift, Users, Search, Phone, MessageSquare, Clock, Download, Send, Cake, Sparkles, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';

interface Cliente {
  id: string;
  name: string;
  birth_date: string | null;
  phone?: string;
  whatsapp?: string;
  photo_url?: string;
}

interface AniversarianteComDias extends Cliente {
  diasRestantes: number;
  idade: number;
}

export default function Aniversarios() {
  const [aniversariantesHoje, setAniversariantesHoje] = useState<Cliente[]>([]);
  const [proximosAniversarios, setProximosAniversarios] = useState<AniversarianteComDias[]>([]);
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<AniversarianteComDias[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mesFilter, setMesFilter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'hoje' | 'proximos' | 'todos' | 'calendario'>('hoje');
  const [showMensagemMassa, setShowMensagemMassa] = useState(false);
  const [mensagemTemplate, setMensagemTemplate] = useState('Parabéns, {nome}! 🥳✨ Que seu dia seja incrível e repleto de alegrias! Receba todo o carinho da equipe Lala. 🎈💖');
  const [enviandoMensagens, setEnviandoMensagens] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Cache de 5 minutos - evita recargas desnecessárias
  const CACHE_DURATION = 5 * 60 * 1000;

  useEffect(() => {
    console.log('[ANIVERSARIOS] 🔄 useEffect montagem', {
      lastFetch,
      shouldFetch: lastFetch === 0 || (Date.now() - lastFetch > CACHE_DURATION),
      timestamp: new Date().toISOString()
    });
    
    const now = Date.now();
    const shouldFetch = now - lastFetch > CACHE_DURATION;
    
    // AbortController para cancelar queries ao desmontar
    const abortController = new AbortController();
    
    if (shouldFetch || lastFetch === 0) {
      buscarDadosAniversarios(abortController.signal);
    } else {
      console.log('[ANIVERSARIOS] ⚡ Usando cache! Idade do cache:', ((now - lastFetch) / 1000).toFixed(1), 'segundos');
    }
    
    // Cleanup: cancelar queries pendentes ao desmontar
    return () => {
      console.log('[ANIVERSARIOS] 🧹 Limpando queries pendentes...');
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Roda apenas na montagem do componente

  useEffect(() => {
    filtrarClientes();
  }, [searchTerm, mesFilter, todosClientes]);

  const buscarDadosAniversarios = async (signal?: AbortSignal) => {
    console.log('[ANIVERSARIOS] 🔄 Iniciando buscarDadosAniversarios...', {
      lastFetch: new Date(lastFetch).toISOString(),
      cacheAge: Date.now() - lastFetch,
      timestamp: new Date().toISOString()
    });
    
    try {
      setLoading(true);
      const supabase = createClient();

      console.log('[ANIVERSARIOS] 📡 Buscando clientes...');
      const startTime = performance.now();
      
      // Timeout de 8 segundos (mais agressivo)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Query demorou mais de 8 segundos')), 8000)
      );
      
      // Query com AbortSignal
      const queryPromise = supabase
        .from('clients')
        .select('id, name, birth_date, phone, whatsapp, photo_url')
        .not('birth_date', 'is', null)
        .order('name')
        .abortSignal(signal!);

      const { data: clientes, error } = await Promise.race([queryPromise, timeoutPromise]);

      // Verificar se foi cancelado
      if (signal?.aborted) {
        console.log('[ANIVERSARIOS] ⚠️ Query cancelada (componente desmontado)');
        return;
      }

      if (error) {
        console.error('[ANIVERSARIOS] ❌ Erro na query:', error);
        throw error;
      }

      const fetchTime = performance.now() - startTime;
      console.log('[ANIVERSARIOS] ✅ Clientes carregados', {
        total: clientes?.length || 0,
        timeMs: fetchTime.toFixed(2)
      });

      const clientesValidos = (clientes || []).filter(c => c.birth_date);
      setTodosClientes(clientesValidos);

      const hoje = clientesValidos.filter(c => isAniversarioHoje(c.birth_date!));
      setAniversariantesHoje(hoje);
      console.log('[ANIVERSARIOS] 🎂 Aniversariantes hoje:', hoje.length);

      const clientesComDias = clientesValidos
        .map(c => ({
          ...c,
          diasRestantes: diasParaProximoAniversario(c.birth_date!) || 999,
          idade: calcularIdade(c.birth_date || '')
        }))
        .filter(c => c.diasRestantes <= 60 && c.diasRestantes > 0)
        .sort((a, b) => a.diasRestantes - b.diasRestantes);

      setProximosAniversarios(clientesComDias);
      console.log('[ANIVERSARIOS] 📅 Próximos aniversários (60 dias):', clientesComDias.length);
      
      setLastFetch(Date.now());
      console.log('[ANIVERSARIOS] 🎉 Concluído! Cache atualizado.');
    } catch (error) {
      // Ignorar erros de abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[ANIVERSARIOS] ⚠️ Query abortada');
        return;
      }
      console.error('[ANIVERSARIOS] ❌ Erro fatal:', error);
      toast.error('Erro ao carregar dados de aniversários: ' + (error as Error).message);
    } finally {
      setLoading(false);
      console.log('[ANIVERSARIOS] 🏁 Loading finalizado');
    }
  };

  const filtrarClientes = () => {
    let filtered = todosClientes.map(c => ({
      ...c,
      diasRestantes: diasParaProximoAniversario(c.birth_date!) || 999,
      idade: calcularIdade(c.birth_date || '')
    }));

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
      );
    }

    if (mesFilter !== null) {
      filtered = filtered.filter(c =>
        c.birth_date && parseLocalDate(c.birth_date)?.getMonth() === mesFilter
      );
    }

    filtered.sort((a, b) => a.diasRestantes - b.diasRestantes);
    setClientesFiltrados(filtered);
  };

  const enviarParabens = (cliente: Cliente) => {
    const contato = cliente.whatsapp || cliente.phone;
    if (!contato) {
      toast.error('Cliente sem contato');
      return;
    }

    const idade = calcularIdade(cliente.birth_date || '');
    const msg = mensagemTemplate
      .replace('{nome}', cliente.name)
      .replace('{idade}', idade.toString());

    window.open(
      'https://wa.me/55' + contato.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg),
      '_blank'
    );
    toast.success('Mensagem enviada para ' + cliente.name);
  };

  const enviarMensagemMassa = async () => {
    const comContato = aniversariantesHoje.filter(c => c.whatsapp || c.phone);

    if (comContato.length === 0) {
      toast.error('Nenhum aniversariante com contato');
      return;
    }

    setEnviandoMensagens(true);
    for (const c of comContato) {
      const contato = c.whatsapp || c.phone;
      const msg = mensagemTemplate
        .replace('{nome}', c.name)
        .replace('{idade}', calcularIdade(c.birth_date || '').toString());

      window.open(
        'https://wa.me/55' + contato!.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg),
        '_blank'
      );
      await new Promise(r => setTimeout(r, 1000));
    }

    setEnviandoMensagens(false);
    setShowMensagemMassa(false);
    toast.success(comContato.length + ' mensagens enviadas!');
  };

  const exportarCSV = () => {
    if (clientesFiltrados.length === 0) return;
    const csv = [
      'Nome,Data Nascimento,Idade,Dias,Telefone',
      ...clientesFiltrados.map(c =>
        `${c.name},${formatBirthDate(c.birth_date)},${c.idade},${c.diasRestantes},${formatPhone(c.phone || '')}`
      )
    ].join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'aniversariantes_' + format(new Date(), 'yyyy-MM-dd') + '.csv';
    a.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const stats = {
    hoje: aniversariantesHoje.length,
    proximos: proximosAniversarios.length,
    total: todosClientes.length
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header Compacto e Premium */}
      <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl transition-all group-hover:bg-purple-500/20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
              <Cake className="h-6 w-6 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold tracking-tight font-heading">Aniversários</h1>
                <Badge variant="outline" className="border-purple-400/30 bg-purple-500/10 text-purple-200 text-[10px] h-5 py-0">
                  <Sparkles className="mr-1 h-2.5 w-2.5" /> Gestão
                </Badge>
              </div>
              <p className="text-slate-400 text-sm">
                Acompanhe e parabenize seus clientes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Stats Compactos no Header */}
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-1 pr-4 border border-white/5">
              <div className="flex -space-x-2 ml-2">
                <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center border-2 border-slate-900 shadow-lg" title="Hoje">
                  <Cake className="h-4 w-4 text-white" />
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-slate-900 shadow-lg" title="Próximos">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex gap-4 ml-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Hoje</p>
                  <p className="text-sm font-bold leading-none">{stats.hoje}</p>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">60 dias</p>
                  <p className="text-sm font-bold leading-none">{stats.proximos}</p>
                </div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-1 hidden xl:block" />

            <div className="flex items-center gap-2">
              {aniversariantesHoje.length > 0 && (
                <Button
                  onClick={() => setShowMensagemMassa(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                >
                  <Send className="h-4 w-4 mr-2" />
                  WhatsApp Massa ({aniversariantesHoje.filter(c => c.whatsapp || c.phone).length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportarCSV}
                className="bg-white/10 border-white/10 text-white hover:bg-white/20 rounded-xl h-10 px-4 backdrop-blur-md"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-card/50 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl shadow-purple-500/5 transition-all hover:shadow-purple-500/10">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              className="pl-12 bg-white/40 border-white/20 focus:bg-white/60 rounded-2xl h-12 text-lg transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={mesFilter ?? ''}
            onChange={(e) => setMesFilter(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full sm:w-[200px] h-12 px-4 bg-white/40 border border-white/20 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos os Meses</option>
            {meses.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-8">
        <TabsList className="bg-white/40 backdrop-blur-lg border border-white/20 p-1.5 rounded-2xl h-14 w-fit shadow-sm">
          <TabsTrigger
            value="hoje"
            className="rounded-xl px-6 h-full data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/20 transition-all font-medium"
          >
            <Cake className="h-4 w-4 mr-2" /> Hoje
          </TabsTrigger>
          <TabsTrigger
            value="proximos"
            className="rounded-xl px-6 h-full data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 transition-all font-medium"
          >
            <Clock className="h-4 w-4 mr-2" /> Próximos
          </TabsTrigger>
          <TabsTrigger
            value="todos"
            className="rounded-xl px-6 h-full data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 transition-all font-medium"
          >
            <Users className="h-4 w-4 mr-2" /> Todos
          </TabsTrigger>
          <TabsTrigger
            value="calendario"
            className="rounded-xl px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-medium"
          >
            <Calendar className="h-4 w-4 mr-2" /> Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="outline-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500/20 border-t-pink-500"></div>
              <p className="text-slate-500 font-medium">Carregando aniversariantes...</p>
            </div>
          ) : aniversariantesHoje.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/20 border-dashed">
              <div className="h-20 w-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                <Gift className="h-10 w-10 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Nenhum aniversário hoje</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto text-lg">
                Mas não se preocupe, sempre há motivos para celebrar com seus clientes!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aniversariantesHoje.map(c => (
                <div
                  key={c.id}
                  className="group relative bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-[2rem] p-6 border border-pink-100 shadow-xl shadow-pink-500/5 transition-all hover:shadow-pink-500/10 hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-pink-500 text-white animate-pulse">🎉 HOJE!</Badge>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                        <AvatarImage src={c.photo_url} />
                        <AvatarFallback className="bg-pink-100 text-pink-600 text-2xl font-bold text-white bg-gradient-to-br from-pink-500 to-rose-600">
                          {getInitials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                        <Cake className="h-5 w-5 text-pink-500" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{c.name}</h3>
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <span className="font-semibold text-pink-600">{calcularIdade(c.birth_date!)} anos</span>
                        <span>•</span>
                        <span>{formatBirthDate(c.birth_date)}</span>
                      </div>
                    </div>

                    {c.phone && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl border border-pink-100/50">
                        <Phone className="h-4 w-4 text-pink-400" />
                        <span className="text-sm font-medium text-slate-600">{formatPhone(c.phone)}</span>
                      </div>
                    )}

                    <div className="pt-4 w-full">
                      {(c.whatsapp || c.phone) ? (
                        <Button
                          onClick={() => enviarParabens(c)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-12 shadow-lg shadow-green-500/20 group/btn"
                        >
                          <MessageCircle className="h-5 w-5 mr-2 transition-transform group-hover/btn:scale-110" />
                          Enviar WhatsApp
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="w-full rounded-2xl h-12 opacity-50">
                          Sem Contato
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proximos" className="outline-none">
          {proximosAniversarios.length === 0 ? (
            <div className="text-center py-20 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/20 border-dashed">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">Nenhum aniversário nos próximos 60 dias</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {proximosAniversarios.map(c => (
                <div
                  key={c.id}
                  className="bg-white/60 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={c.photo_url} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{formatBirthDate(c.birth_date)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Próxima Idade</span>
                      <span className="font-bold text-indigo-600">{c.idade + 1} anos</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn(
                        "rounded-lg px-2 py-1 border-0",
                        c.diasRestantes === 1 ? "bg-amber-100 text-amber-700" : "bg-indigo-50 text-indigo-700"
                      )}>
                        {c.diasRestantes === 1 ? '🎉 AMANHÃ' : `Faltam ${c.diasRestantes} dias`}
                      </Badge>

                      {c.phone && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => enviarParabens(c)}
                          className="h-9 w-9 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="outline-none">
          <div className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-[2rem] overflow-hidden shadow-xl shadow-purple-500/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/20">
              {clientesFiltrados.map(c => (
                <div
                  key={c.id}
                  className={cn(
                    "flex flex-col p-6 bg-white transition-all hover:bg-slate-50 group",
                    c.diasRestantes === 0 && "bg-pink-50 hover:bg-pink-100/50"
                  )}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                      <AvatarImage src={c.photo_url} />
                      <AvatarFallback className={cn(
                        "font-bold",
                        c.diasRestantes === 0 ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                        {c.name}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium">
                        {formatBirthDate(c.birth_date)} • {c.idade} anos
                      </p>
                    </div>
                    {c.diasRestantes === 0 && (
                      <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                        <Cake className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                      <Calendar className="h-3 w-3" />
                      {c.diasRestantes === 0 ? 'CELEBRANDO HOJE!' : `Em ${c.diasRestantes} dias`}
                    </div>

                    {c.phone && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => enviarParabens(c)}
                        className="h-10 px-4 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" /> Contato
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {clientesFiltrados.length === 0 && (
              <div className="py-32 text-center">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Nenhum cliente encontrado</h3>
                <p className="text-slate-500 mt-2">Tente ajustar seus filtros de busca ou mês.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meses.map((mes, i) => {
              const currentMonth = new Date().getMonth();
              const isCurrentMonth = currentMonth === i;
              const anivMes = todosClientes.filter(c =>
                c.birth_date && parseLocalDate(c.birth_date)?.getMonth() === i
              );

              return (
                <Card
                  key={i}
                  className={cn(
                    "border-white/20 bg-white/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
                    isCurrentMonth && "ring-2 ring-pink-500 ring-offset-4 ring-offset-slate-50 bg-white/60"
                  )}
                >
                  <div className={cn(
                    "h-2 w-full",
                    isCurrentMonth ? "bg-pink-500" : "bg-slate-200"
                  )} />
                  <CardHeader className="pb-4 pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold font-heading text-slate-800">
                        {mes}
                      </CardTitle>
                      <Badge className={cn(
                        "rounded-lg",
                        isCurrentMonth ? "bg-pink-500" : "bg-slate-100 text-slate-600"
                      )}>
                        {anivMes.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-3">
                      {anivMes.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-sm italic">
                          Sem aniversários este mês
                        </div>
                      ) : (
                        <>
                          {anivMes.sort((a, b) => {
                            const dateA = parseLocalDate(a.birth_date);
                            const dateB = parseLocalDate(b.birth_date);
                            if (!dateA || !dateB) return 0;
                            return dateA.getDate() - dateB.getDate();
                          }).slice(0, 5).map(c => {
                            const date = parseLocalDate(c.birth_date);
                            return (
                              <div key={c.id} className="flex items-center justify-between text-sm group/item">
                                <div className="flex items-center gap-2 truncate flex-1">
                                  <div className="h-2 w-2 rounded-full bg-pink-400/50 group-hover/item:bg-pink-500" />
                                  <span className="font-medium text-slate-700 truncate">{c.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded leading-none">
                                  {date ? date.getDate() : '-'}
                                </span>
                              </div>
                            );
                          })}
                          {anivMes.length > 5 && (
                            <button
                              onClick={() => {
                                setMesFilter(i);
                                setActiveTab('todos');
                              }}
                              className="w-full text-center text-xs font-bold text-purple-600 hover:text-purple-700 pt-2 border-t border-slate-100"
                            >
                              Ver todos os {anivMes.length}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Mensagem em Massa */}
      <Dialog open={showMensagemMassa} onOpenChange={setShowMensagemMassa}>
        <DialogContent className="sm:max-w-[600px] border-white/20 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 bg-green-500/20 rounded-full blur-2xl" />
            <div className="relative z-10 space-y-2">
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-2xl">
                  <Send className="h-6 w-6 text-green-400" />
                </div>
                Encantar Clientes
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-lg">
                Envie uma mensagem personalizada para todos os {aniversariantesHoje.filter(c => c.whatsapp || c.phone).length} aniversariantes de hoje via WhatsApp.
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                Template da Mensagem
              </label>
              <Textarea
                value={mensagemTemplate}
                onChange={(e) => setMensagemTemplate(e.target.value)}
                rows={4}
                className="rounded-2xl border-slate-200 bg-slate-50 focus:ring-purple-500/20 text-lg p-4 transition-all"
                placeholder="Escreva sua mensagem aqui..."
              />
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{"{nome}"} Nome do Cliente</Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">{"{idade}"} Idade Completa</Badge>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-12 w-12 text-purple-600" />
              </div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Preview da Mensagem</p>
              <p className="text-slate-700 text-lg font-medium leading-relaxed italic">
                "{mensagemTemplate.replace('{nome}', 'Letícia Silva').replace('{idade}', '30')}"
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowMensagemMassa(false)}
                className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
              >
                Talvez mais tarde
              </Button>
              <Button
                onClick={enviarMensagemMassa}
                disabled={enviandoMensagens}
                className="flex-[2] bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 font-bold shadow-xl shadow-green-500/10 transition-all hover:scale-105 active:scale-95"
              >
                {enviandoMensagens
                  ? <div className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> Enviando...</div>
                  : `Enviar para todos agora`
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
