// Shim declarations for modules that might still have resolution issues.
// Many modules are now resolved via api/tsconfig.json pointing to parent node_modules.

declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options: any);
    [key: string]: any;
  }
}

declare module 'mongodb-memory-server' {
  export class MongoMemoryServer {
    static create(): Promise<MongoMemoryServer>;
    getUri(): string;
    stop(): Promise<void>;
    [key: string]: any;
  }
}

// Yahoo-finance2 sometimes has issues with its internal types depending on the environment
declare module 'yahoo-finance2' {
  const yahooFinance: any;
  export = yahooFinance;
}
