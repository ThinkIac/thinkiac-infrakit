export declare function buildCompose(input: {
    tenantId: string;
    image: string;
    env?: Record<string, string>;
}): string;
export declare function normalizeCompose(raw: string, tenantId: string): string;
export declare function getInternalPort(): number;
