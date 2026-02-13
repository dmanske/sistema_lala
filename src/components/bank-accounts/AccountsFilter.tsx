import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List, Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountsFilterProps {
    filter: 'all' | 'active' | 'inactive'
    onFilterChange: (value: 'all' | 'active' | 'inactive') => void
    searchTerm: string
    onSearchChange: (value: string) => void
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
    onNewAccount: () => void
}

export function AccountsFilter({
    filter,
    onFilterChange,
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
    onNewAccount
}: AccountsFilterProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl shadow-sm">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar por nome ou banco..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-primary/20 transition-all rounded-xl"
                    />
                </div>

                <Tabs value={filter} onValueChange={(v) => onFilterChange(v as any)} className="hidden sm:block">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <TabsTrigger value="active" className="rounded-lg px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">Ativas</TabsTrigger>
                        <TabsTrigger value="inactive" className="rounded-lg px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">Arquivadas</TabsTrigger>
                        <TabsTrigger value="all" className="rounded-lg px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">Todas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-lg transition-all",
                            viewMode === 'grid' ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                        onClick={() => onViewModeChange('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-lg transition-all",
                            viewMode === 'list' ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                        onClick={() => onViewModeChange('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    onClick={onNewAccount}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all rounded-xl px-4"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Nova Conta</span>
                    <span className="sm:hidden">Nova</span>
                </Button>
            </div>

            {/* Mobile Filter Fallback */}
            <div className="sm:hidden w-full">
                <Tabs value={filter} onValueChange={(v) => onFilterChange(v as any)} className="w-full">
                    <TabsList className="w-full bg-slate-100 dark:bg-slate-800 grid grid-cols-3 rounded-xl p-1">
                        <TabsTrigger value="active" className="rounded-lg">Ativas</TabsTrigger>
                        <TabsTrigger value="inactive" className="rounded-lg">Arquivadas</TabsTrigger>
                        <TabsTrigger value="all" className="rounded-lg">Todas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}

