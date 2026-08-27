# Multi-step forms and long-running sessions

A multi-step form is a workflow, not merely several hidden field groups. Define
step identity, entry and exit rules, save boundaries, back-navigation policy,
completion criteria, and ownership of transitions outside presentation code.

## Session model

Persist a workflow ID, schema version, revision token, completed steps, safe
draft values, actor, and expiry. The server owns the legal transition graph.
Clients may suggest the next step but must not authorize it.

Validate the current step for immediate feedback and revalidate the complete
business transaction at final submission. For sessions lasting longer than an
access token or permission grant, refresh identity and capabilities before
protected transitions.

## Concurrency and recovery

Use optimistic concurrency with a revision or ETag. A conflict response should
identify affected fields without disclosing another actor's protected data.
Provide resume, restart, and abandon paths, and specify what happens when a
schema version retires while a session remains open.
