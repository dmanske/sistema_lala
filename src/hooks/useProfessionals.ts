import { useState, useEffect } from "react";
import { Professional, CreateProfessionalInput, UpdateProfessionalInput } from "@/core/domain/Professional";
import { LocalStorageProfessionalRepository } from "@/infrastructure/repositories/LocalStorageProfessionalRepository";
import { toast } from "sonner";

const repository = new LocalStorageProfessionalRepository();

export function useProfessionals() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProfessionals = async () => {
        try {
            setLoading(true);
            const data = await repository.getAll();
            setProfessionals(data);
        } catch (error) {
            console.error("Error fetching professionals:", error);
            toast.error("Erro ao carregar profissionais");
        } finally {
            setLoading(false);
        }
    };

    const fetchActive = async () => {
        try {
            const data = await repository.getActive();
            return data;
        } catch (error) {
            console.error("Error fetching active professionals:", error);
            return [];
        }
    };

    const addProfessional = async (data: CreateProfessionalInput) => {
        try {
            const newProfessional = await repository.create(data);
            setProfessionals(prev => [...prev, newProfessional]);
            toast.success("Profissional criado com sucesso!");
            return newProfessional;
        } catch (error) {
            console.error("Error creating professional:", error);
            toast.error("Erro ao criar profissional");
            throw error;
        }
    };

    const updateProfessional = async (id: string, data: UpdateProfessionalInput) => {
        try {
            const updated = await repository.update(id, data);
            setProfessionals(prev => prev.map(p => p.id === id ? updated : p));
            toast.success("Profissional atualizado com sucesso!");
            return updated;
        } catch (error) {
            console.error("Error updating professional:", error);
            toast.error("Erro ao atualizar profissional");
            throw error;
        }
    };

    const deleteProfessional = async (id: string) => {
        try {
            await repository.delete(id);
            setProfessionals(prev => prev.filter(p => p.id !== id));
            toast.success("Profissional excluído com sucesso!");
        } catch (error) {
            console.error("Error deleting professional:", error);
            toast.error("Erro ao excluir profissional");
            throw error;
        }
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    return {
        professionals,
        loading,
        fetchProfessionals,
        fetchActive,
        addProfessional,
        updateProfessional,
        deleteProfessional,
    };
}
