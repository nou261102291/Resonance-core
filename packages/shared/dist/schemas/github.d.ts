import { z } from "zod";
/**
 * Autonomy tier enum
 */
export declare const AutonomyTierSchema: z.ZodEnum<["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]>;
export type AutonomyTier = z.infer<typeof AutonomyTierSchema>;
/**
 * Cost receipt for PR body
 */
export declare const CostReceiptSchema: z.ZodObject<{
    triage: z.ZodObject<{
        model: z.ZodString;
        prompt_tokens: z.ZodNumber;
        completion_tokens: z.ZodNumber;
        cost_usd: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    }, {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    }>;
    synthesis: z.ZodObject<{
        model: z.ZodString;
        prompt_tokens: z.ZodNumber;
        completion_tokens: z.ZodNumber;
        cost_usd: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    }, {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    }>;
    total_cost_usd: z.ZodNumber;
    estimated_human_minutes_saved: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    triage: {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    };
    synthesis: {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    };
    total_cost_usd: number;
    estimated_human_minutes_saved: number;
}, {
    triage: {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    };
    synthesis: {
        prompt_tokens: number;
        completion_tokens: number;
        model: string;
        cost_usd: number;
    };
    total_cost_usd: number;
    estimated_human_minutes_saved: number;
}>;
export type CostReceipt = z.infer<typeof CostReceiptSchema>;
/**
 * PR creation input
 */
export declare const CreatePROptionsSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    base_branch: z.ZodDefault<z.ZodString>;
    head_branch: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    draft: z.ZodDefault<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    head_branch: string;
    owner: string;
    title: string;
    repo: string;
    base_branch: string;
    body: string;
    draft: boolean;
    labels?: string[] | undefined;
    assignees?: string[] | undefined;
}, {
    head_branch: string;
    owner: string;
    title: string;
    repo: string;
    body: string;
    base_branch?: string | undefined;
    draft?: boolean | undefined;
    labels?: string[] | undefined;
    assignees?: string[] | undefined;
}>;
export type CreatePROptions = z.infer<typeof CreatePROptionsSchema>;
/**
 * PR creation result
 */
export declare const PRResultSchema: z.ZodObject<{
    number: z.ZodNumber;
    url: z.ZodString;
    html_url: z.ZodString;
    state: z.ZodEnum<["open", "closed", "merged"]>;
    draft: z.ZodBoolean;
    head_branch: z.ZodString;
    base_branch: z.ZodString;
}, "strip", z.ZodTypeAny, {
    number: number;
    head_branch: string;
    html_url: string;
    url: string;
    base_branch: string;
    draft: boolean;
    state: "open" | "closed" | "merged";
}, {
    number: number;
    head_branch: string;
    html_url: string;
    url: string;
    base_branch: string;
    draft: boolean;
    state: "open" | "closed" | "merged";
}>;
export type PRResult = z.infer<typeof PRResultSchema>;
/**
 * Branch creation options
 */
export declare const CreateBranchOptionsSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    branch_name: z.ZodString;
    base_sha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    owner: string;
    repo: string;
    branch_name: string;
    base_sha: string;
}, {
    owner: string;
    repo: string;
    branch_name: string;
    base_sha: string;
}>;
export type CreateBranchOptions = z.infer<typeof CreateBranchOptionsSchema>;
/**
 * Commit creation options
 */
export declare const CreateCommitOptionsSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    branch: z.ZodString;
    message: z.ZodString;
    tree_sha: z.ZodString;
    parents: z.ZodArray<z.ZodString, "many">;
    author: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
    }, {
        name: string;
        email: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    owner: string;
    branch: string;
    repo: string;
    tree_sha: string;
    parents: string[];
    author?: {
        name: string;
        email: string;
    } | undefined;
}, {
    message: string;
    owner: string;
    branch: string;
    repo: string;
    tree_sha: string;
    parents: string[];
    author?: {
        name: string;
        email: string;
    } | undefined;
}>;
export type CreateCommitOptions = z.infer<typeof CreateCommitOptionsSchema>;
/**
 * Tree creation for commit
 */
export declare const TreeItemSchema: z.ZodObject<{
    path: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["100644", "100755", "040000", "160000", "120000"]>>;
    type: z.ZodDefault<z.ZodEnum<["blob", "tree", "commit"]>>;
    content: z.ZodOptional<z.ZodString>;
    sha: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "commit" | "blob" | "tree";
    mode: "100644" | "100755" | "040000" | "160000" | "120000";
    sha?: string | undefined;
    content?: string | undefined;
}, {
    path: string;
    type?: "commit" | "blob" | "tree" | undefined;
    sha?: string | undefined;
    content?: string | undefined;
    mode?: "100644" | "100755" | "040000" | "160000" | "120000" | undefined;
}>;
export type TreeItem = z.infer<typeof TreeItemSchema>;
export declare const CreateTreeOptionsSchema: z.ZodObject<{
    owner: z.ZodString;
    repo: z.ZodString;
    tree: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        mode: z.ZodDefault<z.ZodEnum<["100644", "100755", "040000", "160000", "120000"]>>;
        type: z.ZodDefault<z.ZodEnum<["blob", "tree", "commit"]>>;
        content: z.ZodOptional<z.ZodString>;
        sha: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        type: "commit" | "blob" | "tree";
        mode: "100644" | "100755" | "040000" | "160000" | "120000";
        sha?: string | undefined;
        content?: string | undefined;
    }, {
        path: string;
        type?: "commit" | "blob" | "tree" | undefined;
        sha?: string | undefined;
        content?: string | undefined;
        mode?: "100644" | "100755" | "040000" | "160000" | "120000" | undefined;
    }>, "many">;
    base_tree: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    owner: string;
    repo: string;
    tree: {
        path: string;
        type: "commit" | "blob" | "tree";
        mode: "100644" | "100755" | "040000" | "160000" | "120000";
        sha?: string | undefined;
        content?: string | undefined;
    }[];
    base_tree?: string | undefined;
}, {
    owner: string;
    repo: string;
    tree: {
        path: string;
        type?: "commit" | "blob" | "tree" | undefined;
        sha?: string | undefined;
        content?: string | undefined;
        mode?: "100644" | "100755" | "040000" | "160000" | "120000" | undefined;
    }[];
    base_tree?: string | undefined;
}>;
export type CreateTreeOptions = z.infer<typeof CreateTreeOptionsSchema>;
/**
 * GitHub App installation token
 */
export declare const InstallationTokenSchema: z.ZodObject<{
    token: z.ZodString;
    expires_at: z.ZodString;
    repository_selection: z.ZodEnum<["all", "selected"]>;
    permissions: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token: string;
    expires_at: string;
    repository_selection: "all" | "selected";
    permissions: Record<string, string>;
}, {
    token: string;
    expires_at: string;
    repository_selection: "all" | "selected";
    permissions: Record<string, string>;
}>;
export type InstallationToken = z.infer<typeof InstallationTokenSchema>;
/**
 * GitHub App configuration
 */
export declare const GitHubAppConfigSchema: z.ZodObject<{
    app_id: z.ZodString;
    private_key: z.ZodString;
    webhook_secret: z.ZodString;
    client_id: z.ZodOptional<z.ZodString>;
    client_secret: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    app_id: string;
    private_key: string;
    webhook_secret: string;
    client_id?: string | undefined;
    client_secret?: string | undefined;
}, {
    app_id: string;
    private_key: string;
    webhook_secret: string;
    client_id?: string | undefined;
    client_secret?: string | undefined;
}>;
export type GitHubAppConfig = z.infer<typeof GitHubAppConfigSchema>;
/**
 * Autonomy routing decision
 */
export declare const AutonomyDecisionSchema: z.ZodObject<{
    tier: z.ZodEnum<["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]>;
    reasoning: z.ZodString;
    risk_score: z.ZodNumber;
    confidence_score: z.ZodNumber;
    action: z.ZodEnum<["create_draft_pr", "create_pr", "push_to_dev", "auto_merge"]>;
    requires_human_review: z.ZodBoolean;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    action: "create_draft_pr" | "create_pr" | "push_to_dev" | "auto_merge";
    risk_score: number;
    confidence_score: number;
    reasoning: string;
    tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
    requires_human_review: boolean;
    labels?: string[] | undefined;
}, {
    action: "create_draft_pr" | "create_pr" | "push_to_dev" | "auto_merge";
    risk_score: number;
    confidence_score: number;
    reasoning: string;
    tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
    requires_human_review: boolean;
    labels?: string[] | undefined;
}>;
export type AutonomyDecision = z.infer<typeof AutonomyDecisionSchema>;
/**
 * Complete fix package ready for Git action
 */
export declare const FixPackageSchema: z.ZodObject<{
    repository: z.ZodObject<{
        owner: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        owner: string;
    }, {
        name: string;
        owner: string;
    }>;
    commit: z.ZodObject<{
        sha: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sha: string;
    }, {
        sha: string;
    }>;
    triage: z.ZodObject<{
        error_signature: z.ZodString;
        affected_file: z.ZodString;
        library_version: z.ZodOptional<z.ZodString>;
        risk_score: z.ZodNumber;
        confidence_score: z.ZodNumber;
        change_scope_estimate: z.ZodEnum<["trivial", "minor", "moderate", "major"]>;
        recommended_tier: z.ZodEnum<["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]>;
        tavily_query: z.ZodString;
        error_type: z.ZodOptional<z.ZodEnum<["type_error", "reference_error", "syntax_error", "build_error", "test_failure", "dependency_error", "config_error", "unknown"]>>;
        suggested_fix_category: z.ZodOptional<z.ZodEnum<["optional_chaining", "type_annotation", "import_fix", "version_bump", "config_change", "test_update", "migration", "refactor", "other"]>>;
        reasoning: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        recommended_tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        tavily_query: string;
        library_version?: string | undefined;
        error_type?: "unknown" | "type_error" | "reference_error" | "syntax_error" | "build_error" | "test_failure" | "dependency_error" | "config_error" | undefined;
        suggested_fix_category?: "optional_chaining" | "type_annotation" | "import_fix" | "version_bump" | "config_change" | "test_update" | "migration" | "refactor" | "other" | undefined;
        reasoning?: string | undefined;
    }, {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        recommended_tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        tavily_query: string;
        library_version?: string | undefined;
        error_type?: "unknown" | "type_error" | "reference_error" | "syntax_error" | "build_error" | "test_failure" | "dependency_error" | "config_error" | undefined;
        suggested_fix_category?: "optional_chaining" | "type_annotation" | "import_fix" | "version_bump" | "config_change" | "test_update" | "migration" | "refactor" | "other" | undefined;
        reasoning?: string | undefined;
    }>;
    synthesis: z.ZodObject<{
        root_cause: z.ZodString;
        patch: z.ZodString;
        fix_explanation: z.ZodString;
        fix_confidence: z.ZodNumber;
        files_changed: z.ZodArray<z.ZodString, "many">;
        lines_changed: z.ZodNumber;
        token_usage: z.ZodObject<{
            prompt_tokens: z.ZodNumber;
            completion_tokens: z.ZodNumber;
            total_tokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        }, {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        }>;
        alternatives_considered: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        root_cause: string;
        patch: string;
        fix_explanation: string;
        fix_confidence: number;
        files_changed: string[];
        lines_changed: number;
        token_usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        alternatives_considered?: string[] | undefined;
        warnings?: string[] | undefined;
    }, {
        root_cause: string;
        patch: string;
        fix_explanation: string;
        fix_confidence: number;
        files_changed: string[];
        lines_changed: number;
        token_usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        alternatives_considered?: string[] | undefined;
        warnings?: string[] | undefined;
    }>;
    autonomy_decision: z.ZodObject<{
        tier: z.ZodEnum<["Tier 1: Guardian", "Tier 2: Co-Pilot", "Tier 3: Autopilot"]>;
        reasoning: z.ZodString;
        risk_score: z.ZodNumber;
        confidence_score: z.ZodNumber;
        action: z.ZodEnum<["create_draft_pr", "create_pr", "push_to_dev", "auto_merge"]>;
        requires_human_review: z.ZodBoolean;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        action: "create_draft_pr" | "create_pr" | "push_to_dev" | "auto_merge";
        risk_score: number;
        confidence_score: number;
        reasoning: string;
        tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        requires_human_review: boolean;
        labels?: string[] | undefined;
    }, {
        action: "create_draft_pr" | "create_pr" | "push_to_dev" | "auto_merge";
        risk_score: number;
        confidence_score: number;
        reasoning: string;
        tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        requires_human_review: boolean;
        labels?: string[] | undefined;
    }>;
    cost_receipt: z.ZodObject<{
        triage: z.ZodObject<{
            model: z.ZodString;
            prompt_tokens: z.ZodNumber;
            completion_tokens: z.ZodNumber;
            cost_usd: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        }, {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        }>;
        synthesis: z.ZodObject<{
            model: z.ZodString;
            prompt_tokens: z.ZodNumber;
            completion_tokens: z.ZodNumber;
            cost_usd: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        }, {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        }>;
        total_cost_usd: z.ZodNumber;
        estimated_human_minutes_saved: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        triage: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        synthesis: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        total_cost_usd: number;
        estimated_human_minutes_saved: number;
    }, {
        triage: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        synthesis: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        total_cost_usd: number;
        estimated_human_minutes_saved: number;
    }>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    repository: {
        name: string;
        owner: string;
    };
    commit: {
        sha: string;
    };
    timestamp: string;
    triage: {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        recommended_tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        tavily_query: string;
        library_version?: string | undefined;
        error_type?: "unknown" | "type_error" | "reference_error" | "syntax_error" | "build_error" | "test_failure" | "dependency_error" | "config_error" | undefined;
        suggested_fix_category?: "optional_chaining" | "type_annotation" | "import_fix" | "version_bump" | "config_change" | "test_update" | "migration" | "refactor" | "other" | undefined;
        reasoning?: string | undefined;
    };
    synthesis: {
        root_cause: string;
        patch: string;
        fix_explanation: string;
        fix_confidence: number;
        files_changed: string[];
        lines_changed: number;
        token_usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        alternatives_considered?: string[] | undefined;
        warnings?: string[] | undefined;
    };
    autonomy_decision: {
        action: "create_draft_pr" | "create_pr" | "push_to_dev" | "auto_merge";
        risk_score: number;
        confidence_score: number;
        reasoning: string;
        tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        requires_human_review: boolean;
        labels?: string[] | undefined;
    };
    cost_receipt: {
        triage: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        synthesis: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        total_cost_usd: number;
        estimated_human_minutes_saved: number;
    };
}, {
    repository: {
        name: string;
        owner: string;
    };
    commit: {
        sha: string;
    };
    timestamp: string;
    triage: {
        error_signature: string;
        affected_file: string;
        risk_score: number;
        confidence_score: number;
        change_scope_estimate: "trivial" | "minor" | "moderate" | "major";
        recommended_tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        tavily_query: string;
        library_version?: string | undefined;
        error_type?: "unknown" | "type_error" | "reference_error" | "syntax_error" | "build_error" | "test_failure" | "dependency_error" | "config_error" | undefined;
        suggested_fix_category?: "optional_chaining" | "type_annotation" | "import_fix" | "version_bump" | "config_change" | "test_update" | "migration" | "refactor" | "other" | undefined;
        reasoning?: string | undefined;
    };
    synthesis: {
        root_cause: string;
        patch: string;
        fix_explanation: string;
        fix_confidence: number;
        files_changed: string[];
        lines_changed: number;
        token_usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        alternatives_considered?: string[] | undefined;
        warnings?: string[] | undefined;
    };
    autonomy_decision: {
        action: "create_draft_pr" | "create_pr" | "push_to_dev" | "auto_merge";
        risk_score: number;
        confidence_score: number;
        reasoning: string;
        tier: "Tier 1: Guardian" | "Tier 2: Co-Pilot" | "Tier 3: Autopilot";
        requires_human_review: boolean;
        labels?: string[] | undefined;
    };
    cost_receipt: {
        triage: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        synthesis: {
            prompt_tokens: number;
            completion_tokens: number;
            model: string;
            cost_usd: number;
        };
        total_cost_usd: number;
        estimated_human_minutes_saved: number;
    };
}>;
export type FixPackage = z.infer<typeof FixPackageSchema>;
//# sourceMappingURL=github.d.ts.map