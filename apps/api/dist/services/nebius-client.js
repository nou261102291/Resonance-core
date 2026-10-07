import OpenAI from 'openai';
import { config } from '../utils/config.js';
import { createChildLogger } from '../utils/logger.js';
import { TriageOutputSchema } from '@resonance/shared/schemas';
import { SynthesisOutputSchema } from '@resonance/shared/schemas';
const log = createChildLogger({ component: 'nebius-client' });
/**
 * Nebius AI Studio client for Nemotron models
 * Uses OpenAI-compatible API
 */
export class NebiusClient {
    client;
    triageModel;
    synthesisModel;
    constructor() {
        this.client = new OpenAI({
            apiKey: config.nebius.apiKey,
            baseURL: config.nebius.baseUrl,
            timeout: config.nebius.timeoutMs,
            maxRetries: config.nebius.maxRetries,
        });
        this.triageModel = config.nebius.models.triage;
        this.synthesisModel = config.nebius.models.synthesis;
        log.info({ triageModel: this.triageModel, synthesisModel: this.synthesisModel }, 'Nebius client initialized');
    }
    /**
     * Run triage with Nemotron Nano
     * Returns structured JSON with error classification and risk assessment
     */
    async runTriage(errorLog, repositoryContext) {
        const systemPrompt = this.buildTriageSystemPrompt();
        const userPrompt = this.buildTriageUserPrompt(errorLog, repositoryContext);
        log.debug({ errorLogLength: errorLog.length }, 'Running Nemotron Nano triage');
        const response = await this.client.chat.completions.create({
            model: this.triageModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
        });
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from Nemotron Nano');
        }
        // Parse and validate JSON
        let parsed;
        try {
            parsed = JSON.parse(content);
        }
        catch (error) {
            log.error({ content, err: error }, 'Failed to parse Nano JSON response');
            throw new Error('Nemotron Nano returned invalid JSON');
        }
        // Validate against schema
        const result = TriageOutputSchema.safeParse(parsed);
        if (!result.success) {
            log.error({ errors: result.error.flatten(), content }, 'Nano output failed schema validation');
            throw new Error(`Nemotron Nano output validation failed: ${result.error.message}`);
        }
        log.info({
            riskScore: result.data.risk_score,
            confidence: result.data.confidence_score,
            tier: result.data.recommended_tier,
            tokens: response.usage?.total_tokens,
        }, 'Triage completed');
        return {
            ...result.data,
            _tokenUsage: {
                prompt_tokens: response.usage?.prompt_tokens ?? 0,
                completion_tokens: response.usage?.completion_tokens ?? 0,
                total_tokens: response.usage?.total_tokens ?? 0,
            },
        };
    }
    /**
     * Run synthesis with Nemotron 3 Ultra
     * Generates a unified diff patch from error context and research
     */
    async runSynthesis(errorLog, triageData, researchSnippets, originalFileContent) {
        const systemPrompt = this.buildSynthesisSystemPrompt();
        const userPrompt = this.buildSynthesisUserPrompt(errorLog, triageData, researchSnippets, originalFileContent);
        log.debug({
            errorLogLength: errorLog.length,
            snippetsCount: researchSnippets.length,
            hasOriginalFile: !!originalFileContent,
        }, 'Running Nemotron 3 Ultra synthesis');
        const response = await this.client.chat.completions.create({
            model: this.synthesisModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.2,
            max_tokens: 4096,
        });
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('Empty response from Nemotron 3 Ultra');
        }
        // Parse the response - expect markdown with diff and explanation
        const parsed = this.parseSynthesisResponse(content);
        // Validate against schema
        const result = SynthesisOutputSchema.safeParse({
            ...parsed,
            token_usage: {
                prompt_tokens: response.usage?.prompt_tokens ?? 0,
                completion_tokens: response.usage?.completion_tokens ?? 0,
                total_tokens: response.usage?.total_tokens ?? 0,
            },
        });
        if (!result.success) {
            log.error({ errors: result.error.flatten(), content }, 'Ultra output failed schema validation');
            throw new Error(`Nemotron 3 Ultra output validation failed: ${result.error.message}`);
        }
        log.info({
            filesChanged: result.data.files_changed.length,
            linesChanged: result.data.lines_changed,
            fixConfidence: result.data.fix_confidence,
            tokens: response.usage?.total_tokens,
        }, 'Synthesis completed');
        return result.data;
    }
    /**
     * Build system prompt for Nemotron Nano triage
     */
    buildTriageSystemPrompt() {
        return `You are a CI/CD triage agent. Analyze build failure logs and output ONLY valid JSON matching this exact schema:

{
  "error_signature": "string - concise error signature (e.g., 'TypeError: Cannot read properties of undefined')",
  "affected_file": "string - relative path to the file containing the error",
  "library_version": "string - library name and version if identifiable (e.g., 'next-auth@4.22.1')",
  "risk_score": "number (1-10) - risk level: 1=trivial, 10=critical production risk",
  "confidence_score": "number (1-10) - confidence in assessment: 1=guessing, 10=certain",
  "change_scope_estimate": "enum: trivial|minor|moderate|major - estimated lines of code to fix",
  "recommended_tier": "enum: 'Tier 1: Guardian'|'Tier 2: Co-Pilot'|'Tier 3: Autopilot'",
  "tavily_query": "string - optimized search query for Tavily API",
  "error_type": "enum: type_error|reference_error|syntax_error|build_error|test_failure|dependency_error|config_error|unknown",
  "suggested_fix_category": "enum: optional_chaining|type_annotation|import_fix|version_bump|config_change|test_update|migration|refactor|other",
  "reasoning": "string - brief reasoning for risk/confidence scores"
}

Rules:
- Output ONLY valid JSON, no markdown, no extra text
- error_signature must be concise and specific
- affected_file must be a relative path from repo root
- risk_score: 1-3=low, 4-6=medium, 7-10=high
- confidence_score: 1-3=low, 4-6=medium, 7-10=high
- recommended_tier based on: risk_score>=7 OR confidence<=6 → Tier 1; risk<=3 AND confidence>=9 → Tier 3; else Tier 2
- tavily_query must be specific and version-aware for best search results`;
    }
    /**
     * Build user prompt for triage
     */
    buildTriageUserPrompt(errorLog, repositoryContext) {
        let prompt = `Analyze this CI/CD failure log:\n\n\`\`\`\n${errorLog}\n\`\`\``;
        if (repositoryContext) {
            if (repositoryContext.primaryLanguage) {
                prompt += `\n\nPrimary language: ${repositoryContext.primaryLanguage}`;
            }
            if (repositoryContext.packageJson) {
                prompt += `\n\npackage.json:\n${repositoryContext.packageJson}`;
            }
            if (repositoryContext.tsconfig) {
                prompt += `\n\ntsconfig.json:\n${repositoryContext.tsconfig}`;
            }
        }
        return prompt;
    }
    /**
     * Build system prompt for Nemotron 3 Ultra synthesis
     */
    buildSynthesisSystemPrompt() {
        return `You are an elite Staff Engineer specializing in CI/CD failure remediation. Generate a minimal, precise unified diff patch to fix the build failure.

Output format (markdown):
## Root Cause Analysis
<2-3 sentences explaining the root cause>

## Fix Explanation
<What the patch does and why it works>

## Patch
\`\`\`diff
<unified diff format - ONLY the diff, no extra text>
\`\`\`

## Fix Confidence
<number 1-10>

## Files Changed
<comma-separated list of file paths>

## Lines Changed
<number>

## Warnings (optional)
<array of strings>

Rules:
- Generate ONLY a unified diff (git diff format)
- Make minimal changes - fix only the specific error
- Preserve existing code style and patterns
- Do NOT refactor unrelated code
- Include context lines in diff for clarity
- If multiple files need changes, include all in single diff
- Fix confidence: 1-10 scale`;
    }
    /**
     * Build user prompt for synthesis
     */
    buildSynthesisUserPrompt(errorLog, triageData, researchSnippets, originalFileContent) {
        let prompt = `## Failure Context
\`\`\`
${errorLog}
\`\`\`

## Triage Data
- Error: ${triageData.error_signature}
- File: ${triageData.affected_file}
- Library: ${triageData.library_version ?? 'Unknown'}
- Risk: ${triageData.risk_score}/10
- Confidence: ${triageData.confidence_score}/10
- Scope: ${triageData.change_scope_estimate}

## Research Context (from Tavily)
`;
        researchSnippets.forEach((snippet, i) => {
            prompt += `### Source ${i + 1}: ${snippet.source} (confidence: ${snippet.confidence})
**${snippet.title}** - ${snippet.url}
${snippet.relevant_content}

`;
        });
        if (originalFileContent) {
            prompt += `## Original File Content (${triageData.affected_file})
\`\`\`typescript
${originalFileContent}
\`\`\`
`;
        }
        prompt += `Generate the fix following the output format exactly.`;
        return prompt;
    }
    /**
     * Parse synthesis response from markdown
     */
    parseSynthesisResponse(content) {
        // Extract sections from markdown
        const rootCauseMatch = content.match(/## Root Cause Analysis\s*\n([\s\S]*?)(?=\n## |\n$)/);
        const fixExplanationMatch = content.match(/## Fix Explanation\s*\n([\s\S]*?)(?=\n## |\n$)/);
        const patchMatch = content.match(/## Patch\s*\n```diff\s*\n([\s\S]*?)\n```/);
        const confidenceMatch = content.match(/## Fix Confidence\s*\n(\d+)/);
        const filesChangedMatch = content.match(/## Files Changed\s*\n([\s\S]*?)(?=\n## |\n$)/);
        const linesChangedMatch = content.match(/## Lines Changed\s*\n(\d+)/);
        const warningsMatch = content.match(/## Warnings\s*\n([\s\S]*?)(?=\n## |\n$)/);
        const patch = patchMatch?.[1]?.trim() ?? '';
        const filesChanged = filesChangedMatch?.[1]?.split(',').map(f => f.trim()).filter(Boolean) ?? [];
        const linesChanged = parseInt(linesChangedMatch?.[1] ?? '0', 10);
        const fixConfidence = parseInt(confidenceMatch?.[1] ?? '5', 10);
        let warnings = [];
        const warningContent = warningsMatch?.[1];
        if (warningContent) {
            try {
                warnings = JSON.parse(warningContent.trim());
            }
            catch {
                warnings = warningContent.split('\n').map(w => w.trim()).filter(Boolean);
            }
        }
        return {
            root_cause: rootCauseMatch?.[1]?.trim() ?? 'Root cause analysis not provided',
            patch,
            fix_explanation: fixExplanationMatch?.[1]?.trim() ?? 'Fix explanation not provided',
            fix_confidence: Math.max(1, Math.min(10, fixConfidence)),
            files_changed: filesChanged.length > 0 ? filesChanged : ['unknown'],
            lines_changed: linesChanged,
            alternatives_considered: [],
            warnings,
        };
    }
    /**
     * Calculate cost for a model call
     */
    calculateCost(promptTokens, completionTokens, model) {
        const rate = model === 'triage'
            ? config.costTracking.rates.nemotronNano
            : config.costTracking.rates.nemotronUltra;
        const totalTokens = promptTokens + completionTokens;
        return (totalTokens / 1000) * rate;
    }
}
// Export singleton instance
export const nebiusClient = new NebiusClient();
//# sourceMappingURL=nebius-client.js.map