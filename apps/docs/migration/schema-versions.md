# Migrating schema versions

Schema versioning is an application governance contract. Dynamic Forms does not
silently make an unknown backend schema version safe.

## Procedure

1. Keep an explicit version beside each persisted or remotely delivered schema.
2. Validate the source schema before migration.
3. Apply deterministic, ordered transforms one version step at a time.
4. Validate the transformed schema and test its default and submitted values.
5. Preserve the original for audit and rollback where policy permits.
6. Reject unknown future versions at the authoritative server boundary.

```ts
type VersionedSchema = { schemaVersion: number; schema: unknown };
declare function migrateV1ToV2(input: VersionedSchema): VersionedSchema;

export function migrate(input: VersionedSchema): VersionedSchema {
  let current = structuredClone(input);
  while (current.schemaVersion < 2) {
    if (current.schemaVersion === 1) current = migrateV1ToV2(current);
    else throw new Error(`Unsupported schema version: ${current.schemaVersion}`);
  }
  if (current.schemaVersion !== 2) {
    throw new Error(`Unsupported schema version: ${current.schemaVersion}`);
  }
  return current;
}
```

The example assumes an application-owned `migrateV1ToV2`; it is not a package
export. See [schema versioning](../schema/versioning) for the governance model.
