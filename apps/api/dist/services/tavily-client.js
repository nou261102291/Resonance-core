import axios from 'axios';
import { config } from '../utils/config.js';
import { createChildLogger } from '../utils/logger.js';
import { ResearchContextSchema, TavilyResponseSchema } from '@resonance/shared/schemas';
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
            log.error({ status: error.response?.status }, 'Tavily request failed');
            return Promise.reject(error);
        });
        log.info('Tavily client initialized');
    }
    /**
     * Search for technical fixes related to a specific error
     */
    async search(query) {
        const normalizedQuery = this.validateQuery(query);
        const startTime = Date.now();
        log.debug({ searchDepth: config.tavily.searchDepth }, 'Searching Tavily');
        try {
            const response = await this.client.post('/search', {
                query: normalizedQuery,
                search_depth: config.tavily.searchDepth,
                max_results: config.tavily.maxResults,
                include_domains: config.tavily.includeDomains,
                exclude_domains: config.tavily.excludeDomains,
                include_answer: true,
                include_raw_content: false,
                include_images: false,
            });
            const searchTimeMs = Date.now() - startTime;
            const context = this.createResearchContext(normalizedQuery, response.data, searchTimeMs);
            log.info({
                resultsCount: context.snippets.length,
                searchTimeMs,
                topScore: context.snippets[0]?.confidence ?? 0,
            }, 'Tavily search completed');
            return context;
        }
        catch (error) {
            log.error({ status: axios.isAxiosError(error) ? error.response?.status : undefined }, 'Tavily search failed');
            throw new Error('Tavily search failed');
        }
    }
    /**
     * Search with fallback for when primary search fails
     */
    async searchWithFallback(query) {
        const normalizedQuery = this.validateQuery(query);
        try {
            return await this.search(normalizedQuery);
        }
        catch {
            log.warn('Primary Tavily search failed; trying basic search');
            // Try with basic search depth
            try {
                const response = await this.client.post('/search', {
                    query: normalizedQuery,
                    search_depth: 'basic',
                    max_results: 3,
                    include_answer: true,
                });
                return this.createResearchContext(normalizedQuery, response.data, 0, 0.8);
            }
            catch (error) {
                log.error({ status: axios.isAxiosError(error) ? error.response?.status : undefined }, 'Tavily fallback search failed');
                throw new Error('Tavily search and fallback failed');
            }
        }
    }
    validateQuery(query) {
        const normalizedQuery = query.trim();
        if (normalizedQuery.length === 0 || normalizedQuery.length > 1000) {
            throw new Error('Tavily query must contain between 1 and 1000 characters');
        }
        return normalizedQuery;
    }
    createResearchContext(query, responseData, searchTimeMs, confidenceMultiplier = 1) {
        const response = TavilyResponseSchema.safeParse(responseData);
        if (!response.success) {
            log.error({ issues: response.error.issues.map(({ code, path }) => ({ code, path })) }, 'Tavily response failed schema validation');
            throw new Error('Tavily returned an invalid response');
        }
        const results = response.data.results
            .filter((result) => this.isAllowedSource(result.url))
            .sort((left, right) => right.score - left.score)
            .slice(0, config.tavily.maxResults);
        const context = ResearchContextSchema.safeParse({
            query,
            snippets: results.map((result) => ({
                source: this.extractSource(result.url),
                title: result.title,
                url: result.url,
                relevant_content: result.content.slice(0, 5000),
                confidence: result.score * confidenceMultiplier,
            })),
            total_results: results.length,
            search_time_ms: Math.max(0, Math.floor(searchTimeMs)),
        });
        if (!context.success) {
            log.error({ issues: context.error.issues.map(({ code, path }) => ({ code, path })) }, 'Research context failed schema validation');
            throw new Error('Tavily research context validation failed');
        }
        return context.data;
    }
    isAllowedSource(url) {
        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.toLowerCase();
            if (parsed.protocol !== 'https:')
                return false;
            const matchesDomain = (domain) => hostname === domain || hostname.endsWith(`.${domain}`);
            if (config.tavily.excludeDomains.some(matchesDomain))
                return false;
            return config.tavily.includeDomains.length === 0 || config.tavily.includeDomains.some(matchesDomain);
        }
        catch {
            return false;
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