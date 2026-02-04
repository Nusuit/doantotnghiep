export function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { firstName: undefined, lastName: fullName.trim() };
    return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}
