import { LocalStorageProfessionalRepository } from "@/infrastructure/repositories/LocalStorageProfessionalRepository";

// Dados dos profissionais mockados originais
const MOCK_PROFESSIONALS_DATA = [
    { name: "Lala (Principal)", color: "#8b5cf6", commission: 0 },
    { name: "Bruna Designer", color: "#ec4899", commission: 30 },
    { name: "Carol Estética", color: "#10b981", commission: 25 },
];

export async function seedProfessionals() {
    const repo = new LocalStorageProfessionalRepository();
    const existing = await repo.getAll();

    // Só faz seed se não houver profissionais cadastrados
    if (existing.length === 0) {
        for (const prof of MOCK_PROFESSIONALS_DATA) {
            await repo.create({
                name: prof.name,
                color: prof.color,
                commission: prof.commission,
                status: "ACTIVE",
            });
        }
        console.log("✅ Profissionais iniciais criados com sucesso!");
        return true;
    }

    console.log("ℹ️ Profissionais já existem, seed ignorado.");
    return false;
}
