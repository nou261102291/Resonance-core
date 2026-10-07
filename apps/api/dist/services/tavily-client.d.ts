import { type ResearchContext } from '@resonance/shared/schemas';
/**
 * Tavily Search API client for version-specific technical research
 */
export declare class TavilyClient {
    private client;
    constructor();
    /**
     * Search for technical fixes related to a specific error
     */
    search(query: string): Promise<ResearchContext>;
    /**
     * Search with fallback for when primary search fails
     */
    searchWithFallback(query: string): Promise<ResearchContext>;
    private validateQuery;
    private createResearchContext;
    private isAllowedSource;
    /**
     * Extract source domain from URL
     */
    private extractSource;
    /**
     * Health check for Tavily API
     */
    healthCheck(): Promise<boolean>;
}
export declare const tavilyClient: TavilyClient;
//# sourceMappingURL=tavily-client.d.ts.map