
export const normalizePhone = (value: string): string => {
    return value.replace(/\D/g, "");
};

export const formatPhone = (value: string): string => {
    const digits = normalizePhone(value);

    if (digits.length === 11) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 3)} ${digits.substring(3, 7)}-${digits.substring(7)}`;
    }

    if (digits.length === 10) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    }

    // Fallback for incomplete numbers (useful for inputs)
    return value;
};
