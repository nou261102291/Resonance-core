# Autonomy Policy

## Decision Order

The API applies these rules in order. Thresholds and path patterns come from the validated application configuration.

1. A path matching a Tier 1 required pattern is always Guardian.
2. A risk score at or above the Tier 1 threshold, or confidence at or below its Tier 1 threshold, is Guardian.
3. Autopilot is allowed only when the path matches the Tier 3 allowlist, risk is at or below the Tier 3 maximum, confidence is at or above the Tier 3 minimum, and estimated scope is `trivial`.
4. All other cases are Co-Pilot.

The path allowlist is mandatory for Tier 3. Low scores alone never grant Autopilot. A later verification gate is still required before promoting a generated change.

## Action Matrix

| Tier | Intended use | Current action | Human review |
| --- | --- | --- | --- |
| Guardian | Protected paths, high risk, or low confidence | Draft PR | Required |
| Co-Pilot | Moderate or non-allowlisted changes | Standard PR | Required |
| Autopilot | Low-risk, high-confidence, trivial changes on allowlisted paths | Create a branch; open a PR to `dev` when that branch exists | Policy-controlled; no verified auto-merge |

Tier 3 may not silently merge or deploy. The implementation does not currently provide a verified approval/merge gate, so production-facing promotion is out of scope.

## Policy Maintenance

- Keep the default behavior conservative: unmatched cases use Co-Pilot.
- Treat changes to thresholds, path patterns, action mapping, or merge behavior as security-sensitive and add routing tests.
- Do not add broad allowlist patterns without a documented risk review.
- `defaultTier` is configuration metadata; routing currently uses explicit thresholds and falls back to Co-Pilot.

## Validation Evidence

Unit tests cover protected-path overrides, allowlisted Autopilot, non-allowlisted fallback, Co-Pilot review requirements, and PR receipt composition. These tests do not validate behavior against a live GitHub repository.