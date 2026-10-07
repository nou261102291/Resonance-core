import { z } from "zod";
/**
 * GitHub Actions workflow_run webhook payload
 * See: https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run
 */
export declare const GitHubWorkflowRunPayloadSchema: z.ZodObject<{
    action: z.ZodLiteral<"completed">;
    workflow_run: z.ZodObject<{
        id: z.ZodNumber;
        workflow_id: z.ZodNumber;
        name: z.ZodString;
        head_branch: z.ZodString;
        head_sha: z.ZodString;
        conclusion: z.ZodEnum<["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]>;
        status: z.ZodEnum<["completed", "in_progress", "queued", "waiting"]>;
        repository: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            full_name: z.ZodString;
            owner: z.ZodObject<{
                login: z.ZodString;
                id: z.ZodNumber;
                type: z.ZodEnum<["User", "Organization"]>;
            }, "strip", z.ZodTypeAny, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }>;
            private: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }>;
        head_repository: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            full_name: z.ZodString;
            owner: z.ZodObject<{
                login: z.ZodString;
                id: z.ZodNumber;
                type: z.ZodEnum<["User", "Organization"]>;
            }, "strip", z.ZodTypeAny, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }>;
            private: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        run_number: z.ZodNumber;
        run_attempt: z.ZodNumber;
        event: z.ZodString;
        jobs_url: z.ZodString;
        logs_url: z.ZodString;
        check_suite_url: z.ZodString;
        artifacts_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    }, {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    }>;
    repository: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        full_name: z.ZodString;
        owner: z.ZodObject<{
            login: z.ZodString;
            id: z.ZodNumber;
            type: z.ZodEnum<["User", "Organization"]>;
        }, "strip", z.ZodTypeAny, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }>;
        private: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }>;
    sender: z.ZodObject<{
        login: z.ZodString;
        id: z.ZodNumber;
        type: z.ZodEnum<["User", "Bot"]>;
    }, "strip", z.ZodTypeAny, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }>;
    installation: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    action: "completed";
    workflow_run: {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    };
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    installation?: z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    action: "completed";
    workflow_run: {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    };
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    installation?: z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export type GitHubWorkflowRunPayload = z.infer<typeof GitHubWorkflowRunPayloadSchema>;
/**
 * GitHub check_run webhook payload (alternative trigger)
 * See: https://docs.github.com/en/webhooks/webhook-events-and-payloads#check_run
 */
export declare const GitHubCheckRunPayloadSchema: z.ZodObject<{
    action: z.ZodEnum<["completed", "rerequested", "requested_action"]>;
    check_run: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        status: z.ZodEnum<["completed", "in_progress", "queued"]>;
        conclusion: z.ZodNullable<z.ZodEnum<["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]>>;
        head_sha: z.ZodString;
        repository: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            full_name: z.ZodString;
            owner: z.ZodObject<{
                login: z.ZodString;
                id: z.ZodNumber;
                type: z.ZodEnum<["User", "Organization"]>;
            }, "strip", z.ZodTypeAny, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }>;
            private: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }>;
        details_url: z.ZodNullable<z.ZodString>;
        html_url: z.ZodString;
        external_id: z.ZodNullable<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        }, {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    }, {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    }>;
    repository: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        full_name: z.ZodString;
        owner: z.ZodObject<{
            login: z.ZodString;
            id: z.ZodNumber;
            type: z.ZodEnum<["User", "Organization"]>;
        }, "strip", z.ZodTypeAny, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }>;
        private: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }>;
    sender: z.ZodObject<{
        login: z.ZodString;
        id: z.ZodNumber;
        type: z.ZodEnum<["User", "Bot"]>;
    }, "strip", z.ZodTypeAny, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }>;
    installation: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    action: "completed" | "rerequested" | "requested_action";
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    check_run: {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    };
    installation?: z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    action: "completed" | "rerequested" | "requested_action";
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    check_run: {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    };
    installation?: z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export type GitHubCheckRunPayload = z.infer<typeof GitHubCheckRunPayloadSchema>;
/**
 * Union of supported webhook payloads
 */
export declare const GitHubWebhookPayloadSchema: z.ZodUnion<[z.ZodObject<{
    action: z.ZodLiteral<"completed">;
    workflow_run: z.ZodObject<{
        id: z.ZodNumber;
        workflow_id: z.ZodNumber;
        name: z.ZodString;
        head_branch: z.ZodString;
        head_sha: z.ZodString;
        conclusion: z.ZodEnum<["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]>;
        status: z.ZodEnum<["completed", "in_progress", "queued", "waiting"]>;
        repository: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            full_name: z.ZodString;
            owner: z.ZodObject<{
                login: z.ZodString;
                id: z.ZodNumber;
                type: z.ZodEnum<["User", "Organization"]>;
            }, "strip", z.ZodTypeAny, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }>;
            private: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }>;
        head_repository: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            full_name: z.ZodString;
            owner: z.ZodObject<{
                login: z.ZodString;
                id: z.ZodNumber;
                type: z.ZodEnum<["User", "Organization"]>;
            }, "strip", z.ZodTypeAny, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }>;
            private: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }>;
        created_at: z.ZodString;
        updated_at: z.ZodString;
        run_number: z.ZodNumber;
        run_attempt: z.ZodNumber;
        event: z.ZodString;
        jobs_url: z.ZodString;
        logs_url: z.ZodString;
        check_suite_url: z.ZodString;
        artifacts_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    }, {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    }>;
    repository: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        full_name: z.ZodString;
        owner: z.ZodObject<{
            login: z.ZodString;
            id: z.ZodNumber;
            type: z.ZodEnum<["User", "Organization"]>;
        }, "strip", z.ZodTypeAny, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }>;
        private: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }>;
    sender: z.ZodObject<{
        login: z.ZodString;
        id: z.ZodNumber;
        type: z.ZodEnum<["User", "Bot"]>;
    }, "strip", z.ZodTypeAny, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }>;
    installation: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    action: "completed";
    workflow_run: {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    };
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    installation?: z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    action: "completed";
    workflow_run: {
        status: "completed" | "in_progress" | "queued" | "waiting";
        id: number;
        workflow_id: number;
        name: string;
        head_branch: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required";
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        head_repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        created_at: string;
        updated_at: string;
        run_number: number;
        run_attempt: number;
        event: string;
        jobs_url: string;
        logs_url: string;
        check_suite_url: string;
        artifacts_url: string;
    };
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    installation?: z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>, z.ZodObject<{
    action: z.ZodEnum<["completed", "rerequested", "requested_action"]>;
    check_run: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        status: z.ZodEnum<["completed", "in_progress", "queued"]>;
        conclusion: z.ZodNullable<z.ZodEnum<["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]>>;
        head_sha: z.ZodString;
        repository: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            full_name: z.ZodString;
            owner: z.ZodObject<{
                login: z.ZodString;
                id: z.ZodNumber;
                type: z.ZodEnum<["User", "Organization"]>;
            }, "strip", z.ZodTypeAny, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }, {
                type: "User" | "Organization";
                id: number;
                login: string;
            }>;
            private: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }, {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        }>;
        details_url: z.ZodNullable<z.ZodString>;
        html_url: z.ZodString;
        external_id: z.ZodNullable<z.ZodString>;
        output: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        }, {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    }, {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    }>;
    repository: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        full_name: z.ZodString;
        owner: z.ZodObject<{
            login: z.ZodString;
            id: z.ZodNumber;
            type: z.ZodEnum<["User", "Organization"]>;
        }, "strip", z.ZodTypeAny, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }, {
            type: "User" | "Organization";
            id: number;
            login: string;
        }>;
        private: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }, {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    }>;
    sender: z.ZodObject<{
        login: z.ZodString;
        id: z.ZodNumber;
        type: z.ZodEnum<["User", "Bot"]>;
    }, "strip", z.ZodTypeAny, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }, {
        type: "User" | "Bot";
        id: number;
        login: string;
    }>;
    installation: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    action: "completed" | "rerequested" | "requested_action";
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    check_run: {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    };
    installation?: z.objectOutputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    action: "completed" | "rerequested" | "requested_action";
    repository: {
        id: number;
        name: string;
        full_name: string;
        owner: {
            type: "User" | "Organization";
            id: number;
            login: string;
        };
        private: boolean;
    };
    sender: {
        type: "User" | "Bot";
        id: number;
        login: string;
    };
    check_run: {
        status: "completed" | "in_progress" | "queued";
        id: number;
        name: string;
        head_sha: string;
        conclusion: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required" | null;
        repository: {
            id: number;
            name: string;
            full_name: string;
            owner: {
                type: "User" | "Organization";
                id: number;
                login: string;
            };
            private: boolean;
        };
        details_url: string | null;
        html_url: string;
        external_id: string | null;
        output?: {
            title?: string | null | undefined;
            summary?: string | null | undefined;
            text?: string | null | undefined;
        } | null | undefined;
    };
    installation?: z.objectInputType<{
        id: z.ZodNumber;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>]>;
export type GitHubWebhookPayload = z.infer<typeof GitHubWebhookPayloadSchema>;
/**
 * Extracted failure context from webhook
 */
export declare const FailureContextSchema: z.ZodObject<{
    repository: z.ZodObject<{
        owner: z.ZodString;
        name: z.ZodString;
        fullName: z.ZodString;
        installationId: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        owner: string;
        fullName: string;
        installationId?: number | undefined;
    }, {
        name: string;
        owner: string;
        fullName: string;
        installationId?: number | undefined;
    }>;
    workflow: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        runNumber: z.ZodNumber;
        runAttempt: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        runNumber: number;
        runAttempt: number;
    }, {
        id: number;
        name: string;
        runNumber: number;
        runAttempt: number;
    }>;
    commit: z.ZodObject<{
        sha: z.ZodString;
        branch: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sha: string;
        branch: string;
    }, {
        sha: string;
        branch: string;
    }>;
    failure: z.ZodObject<{
        jobName: z.ZodString;
        conclusion: z.ZodString;
        logsUrl: z.ZodString;
        errorLog: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        conclusion: string;
        jobName: string;
        logsUrl: string;
        errorLog: string;
    }, {
        conclusion: string;
        jobName: string;
        logsUrl: string;
        errorLog: string;
    }>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    failure: {
        conclusion: string;
        jobName: string;
        logsUrl: string;
        errorLog: string;
    };
    repository: {
        name: string;
        owner: string;
        fullName: string;
        installationId?: number | undefined;
    };
    workflow: {
        id: number;
        name: string;
        runNumber: number;
        runAttempt: number;
    };
    commit: {
        sha: string;
        branch: string;
    };
    timestamp: string;
}, {
    failure: {
        conclusion: string;
        jobName: string;
        logsUrl: string;
        errorLog: string;
    };
    repository: {
        name: string;
        owner: string;
        fullName: string;
        installationId?: number | undefined;
    };
    workflow: {
        id: number;
        name: string;
        runNumber: number;
        runAttempt: number;
    };
    commit: {
        sha: string;
        branch: string;
    };
    timestamp: string;
}>;
export type FailureContext = z.infer<typeof FailureContextSchema>;
//# sourceMappingURL=webhook.d.ts.map