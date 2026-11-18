# FARAST Work Item Issue-body format contract

**Version:** 1.0  
**Applies to:** every GitHub Issue labelled `agent:task` and parsed by `.github/workflows/farast-coordinator.yml`.

## Required section order

Use the exact heading text below. The Work Item JSON section must be the final section in the Issue body.

1. `## Objective`
2. `### Stable Work Item ID`
3. `### Parent Goal IDs`
4. `### Parent EXP IDs`
5. `### Priority (0-100; lower is higher)`
6. `### Write policy`
7. `### Priority source`
8. `### Target repository`
9. `### Resource keys`
10. `### Dependencies`
11. `### Operation scope` (required for versioned WRITE_ALLOWED tasks)
12. `### Ordered execution steps`
13. `### Acceptance criteria`
14. `### Deliverables`
15. `### Work Item specification JSON`

## JSON fence and extraction boundary

The live coordinator currently extracts the JSON section using this boundary:

```js
/(?:^|\\n)###\\s*Work item specification JSON\\s*\\n([\\s\\S]*?)(?=\\n###|$)/i
```

It trims the captured section, removes an optional ```json fence, parses JSON, then validates the object and cross-checks scalar/resource sections against the JSON.

Consequences:

- The heading must be exactly `### Work item specification JSON`.
- Use one fenced JSON object: ```json ... ```.
- Put the JSON section last. Do not append a `##` heading, explanatory text, PR handoff section, or any other content after the closing fence.
- If supporting prose or PR metadata is needed, place it before the JSON section.
- The parser stops at the next `###` heading; relying on that delimiter while adding a lower-level `##` heading after the JSON is invalid and produces trailing-character JSON errors.
- Never "fix" an extraction error by deleting or silently rewriting fields inside the Work Item JSON.

## Scalar and resource parity

The following human-readable sections must match their JSON counterparts exactly after the coordinator's normalization:

| Issue section | JSON field |
|---|---|
| Stable Work Item ID | `work_item_id` |
| Parent Goal IDs | `parent_goal_ids` |
| Parent EXP IDs | `parent_exp_ids` |
| Priority (0-100; lower is higher) | `priority` |
| Write policy | `write_policy` |
| Priority source | `priority_source` |
| Target repository | `target_repository` |
| Resource keys | `resource_keys` |

For resource keys, put one key per line. Bullets are accepted and stripped by the current coordinator, but the resulting normalized set must exactly equal JSON `resource_keys`. Use lowercase comparison semantics and forward-slash path normalization.

## Versioned operation scope

Every new `WRITE_ALLOWED` Work Item must include both:

```json
{
  "operation_scope_version": "1.0",
  "requested_operations": ["control_plane_write"]
}
```

Choose only the operation(s) actually authorized by the task. NON product implementation requires `product_implementation` and a valid `owner_approval_ref`; never broaden product or destructive permissions to make a claim pass.

## Pre-publication validation

Before opening or updating an Issue:

1. Parse the fenced JSON independently.
2. Run the exact extraction regex shown above against the complete Issue body.
3. Parse the captured text and run the live Work Item schema validator.
4. Compare the parsed JSON object with the intended object.
5. Compare every human-readable scalar/resource section with the JSON.
6. Confirm the JSON section is the final section.
7. Only then publish the Issue and attempt a claim.

A failed extraction, schema check, resource parity check, dependency gate, or claim is a hard stop. Do not bypass the coordinator or reuse a stale fencing token.
