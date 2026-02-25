'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProjects } from '@/app/(app)/settings/projects/actions';

interface ProjectSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProjectSelector({
  value,
  onValueChange,
  placeholder = 'Selecione um projeto',
  className,
}: ProjectSelectorProps) {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  const activeProjects = projects?.filter((p) => p.status === 'ACTIVE') || [];

  return (
    <Select 
      value={value || undefined} 
      onValueChange={(val) => onValueChange(val === 'none' ? '' : val)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum</SelectItem>
        {activeProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name} {project.code && `(${project.code})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
