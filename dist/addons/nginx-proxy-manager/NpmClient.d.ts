export declare class NpmClient {
    private config;
    private token?;
    constructor(config: {
        url: string;
        email: string;
        password: string;
    });
    authenticate(): Promise<void>;
    request(path: string, options?: any): Promise<any>;
}
