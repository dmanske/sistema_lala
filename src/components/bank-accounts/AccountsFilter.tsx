
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List, Search, Plus } from 'lucide-react'

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/30 p-4 rounded-xl border backdrop-blur-sm">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar contas..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all"
                    />
                </div>

                <Tabs value={filter} onValueChange={(v) => onFilterChange(v as any)} className="hidden sm:block">
                    <TabsList className="bg-background/50">
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="active">Ativas</TabsTrigger>
                        <TabsTrigger value="inactive">Inativas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md bg-background/50 p-1">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewModeChange('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewModeChange('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                <Button onClick={onNewAccount} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta
                </Button>
            </div>

            {/* Mobile Filter Fallback */}
            <div className="sm:hidden w-full">
                <Tabs value={filter} onValueChange={(v) => onFilterChange(v as any)} className="w-full">
                    <TabsList className="w-full bg-background/50 grid grid-cols-3">
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="active">Ativas</TabsTrigger>
                        <TabsTrigger value="inactive">Inativas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}
