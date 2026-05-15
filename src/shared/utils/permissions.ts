export const expandPermissions = (permissions: any[]) => {
    const result = new Set<string>();

    const traverse = (perm: any) => {
        if (!perm) return
        result.add(perm.name);
        if (perm.childern && perm.children.length > 0) {
            for (const child of perm.children) traverse(child)
        }
    };

    permissions.forEach(traverse);
    return Array.from(result)
};