
export const formatName = (value: string): string => {
    if (!value) return "";

    const lowerExceptions = ["de", "da", "do", "dos", "das", "e"];

    return value
        .split(" ")
        .map((word, index) => {
            // Keep short acronyms if they were typed in uppercase (e.g. MEI, DJ, PJ)
            // But if it's mixed or lower, we process it. 
            // The requirement says: "Se palavra já for sigla curta... manter como está".
            // We assume input might be messy, but if it comes as "DJ", keep "DJ".
            // If it comes as "dj", maybe format to "Dj"? The user example implies keeping "MEI" if it is an acronym.
            // Let's stick to: if word length <= 3 and is all uppercase, keep it.
            if (word.length <= 3 && word === word.toUpperCase() && !lowerExceptions.includes(word.toLowerCase())) {
                return word;
            }

            const lowerWord = word.toLowerCase();

            // Check exceptions (connectors)
            // First word should always be capitalized? Usually yes, unless it's like "e Silva" (rare). 
            // Let's Capitalize first word always.
            if (lowerExceptions.includes(lowerWord) && index !== 0) {
                return lowerWord;
            }

            return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join(" ");
};
