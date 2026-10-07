import axios from 'axios';
import { config } from '../utils/config.js';
import { createChildLogger } from '../utils/logger.js';
const log = createChildLogger({ component: 'tavily-client' });
/**
 * Tavily Search API client for version-specific technical research
 */
export class TavilyClient {
    client;
    constructor() {
        this.client = axios.create({
            baseURL: config.tavily.baseUrl,
            timeout: config.tavily.timeoutMs,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.tavily.apiKey}`,
            },
        });
        // Response interceptor for logging
        this.client.interceptors.response.use((response) => {
            log.debug({
                status: response.status,
                resultsCount: response.data.results?.length ?? 0
            }, 'Tavily response received');
            return response;
        }, (error) => {
            log.error({
                err: error,
                status: error.response?.status,
                data: error.response?.data
            }, 'Tavily request failed');
            return Promise.reject(error);
        });
        log.info('Tavily client initialized');
    }
    /**
     * Search for technical fixes related to a specific error
     */
    async search(query) {
        const startTime = Date.now();
        log.debug({ query, searchDepth: config.tavily.searchDepth }, 'Searching Tavily');
        try {
            const response = await this.client.post('/search', {
                query,
                search_depth: config.tavily.searchDepth,
                max_results: config.tavily.maxResults,
                include_domains: config.tavily.includeDomains,
                exclude_domains: config.tavily.excludeDomains,
                include_answer: true,
                include_raw_content: false,
                include_images: false,
            });
            const data = response.data;
            const searchTimeMs = Date.now() - startTime;
            // Transform results to our schema
            const snippets = (data.results ?? []).map((result) => ({
                source: this.extractSource(result.url),
                title: result.title,
                url: result.url,
                relevant_content: result.content,
                confidence: result.score,
            }));
            const context = {
                query,
                snippets,
                total_results: data.results?.length ?? 0,
                search_time_ms: searchTimeMs,
            };
            log.info({
                query,
                resultsCount: snippets.length,
                searchTimeMs,
                topScore: snippets[0]?.confidence ?? 0,
            }, 'Tavily search completed');
            return context;
        }
        catch (error) {
            log.error({ err: error, query }, 'Tavily search failed');
            throw new Error(`Tavily search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Search with fallback for when primary search fails
     */
    async searchWithFallback(query) {
        try {
            return await this.search(query);
        }
        catch (primaryError) {
            log.warn({ err: primaryError, query }, 'Primary search failed, trying fallback');
            // Try with basic search depth
            try {
                const response = await this.client.post('/search', {
                    query,
                    search_depth: 'basic',
                    max_results: 3,
                    include_answer: true,
                });
                const snippets = (response.data.results ?? []).map((result) => ({
                    source: this.extractSource(result.url),
                    title: result.title,
                    url: result.url,
                    relevant_content: result.content,
                    confidence: result.score * 0.8, // Lower confidence for fallback
                }));
                return {
                    query,
                    snippets,
                    total_results: snippets.length,
                    search_time_ms: 0,
                };
            }
            catch (fallbackError) {
                log.error({ err: fallbackError, query }, 'Fallback search also failed');
                // Return empty context rather than failing completely
                return {
                    query,
                    snippets: [],
                    total_results: 0,
                    search_time_ms: 0,
                };
            }
        }
    }
    /**
     * Extract source domain from URL
     */
    extractSource(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace('www.', '');
        }
        catch {
            return 'unknown';
        }
    }
    /**
     * Health check for Tavily API
     */
    async healthCheck() {
        try {
            await this.client.post('/search', {
                query: 'test',
                max_results: 1,
                search_depth: 'basic',
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
// Export singleton instance
export const tavilyClient = new TavilyClient();
//# sourceMappingURL=tavily-client.js.map