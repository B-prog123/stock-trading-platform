// Shim declarations for modules not directly resolvable from the api/ folder.
// These modules live in root or backend node_modules and are available at runtime.
// This file suppresses TypeScript "Cannot find module" errors in the api/ directory.

declare module 'express' {
  const express: any;
  export = express;
}
declare module 'cors' {
  const cors: any;
  export = cors;
}
declare module 'axios' {
  const axios: any;
  export = axios;
}
declare module 'dotenv' {
  const dotenv: any;
  export = dotenv;
}
declare module 'bcryptjs' {
  const bcrypt: any;
  export = bcrypt;
}
declare module 'jsonwebtoken' {
  const jwt: any;
  export = jwt;
}
declare module 'mongoose' {
  const mongoose: any;
  export = mongoose;
}
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
declare module 'yahoo-finance2' {
  const yahooFinance: any;
  export = yahooFinance;
}
