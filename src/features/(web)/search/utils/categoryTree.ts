import type { Category } from "@/src/features/(web)/searchAndFilter/api";

/** الـ API يعيد الجذور مع `children` متداخلة */
export function flattenCategoryTree(categories: Category[]): Category[] {
    const out: Category[] = [];
    const seen = new Set<number>();
    function visit(cat: Category) {
        if (seen.has(cat.id)) return;
        seen.add(cat.id);
        const { children, ...rest } = cat;
        out.push(rest as Category);
        if (children?.length) {
            for (const child of children) {
                visit(child);
            }
        }
    }
    for (const c of categories) {
        visit(c);
    }
    return out;
}

export function buildCategoryTree(categories: Category[]) {
    const parentCategories = categories.filter((c) => !c.parent_id || c.parent_id === null);
    const childrenMap = new Map<string, Category[]>();

    categories.forEach((cat) => {
        if (cat.parent_id != null && cat.parent_id !== "") {
            const key = String(cat.parent_id);
            const bucket = childrenMap.get(key) || [];
            bucket.push(cat);
            childrenMap.set(key, bucket);
        }
    });

    return { parentCategories, childrenMap };
}

/** مسار من الجذر إلى الفئة (مثلاً لعرض الأعمدة عند category_id في الرابط) */
export function getCategoryPathFromLeaf(flat: Category[], leafId: number): number[] {
    const path: number[] = [];
    let cur: Category | undefined = flat.find((c) => c.id === leafId);
    if (!cur) return [];
    while (cur) {
        path.unshift(cur.id);
        if (cur.parent_id == null || cur.parent_id === "") break;
        const pid = parseInt(String(cur.parent_id), 10);
        if (Number.isNaN(pid)) break;
        cur = flat.find((c) => c.id === pid);
    }
    return path;
}
