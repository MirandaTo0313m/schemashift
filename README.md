# schemashift

> A diff and migration generator for JSON Schema changes across API versions.

---

## Installation

```bash
npm install schemashift
```

---

## Usage

```typescript
import { diffSchemas, generateMigration } from "schemashift";

const v1 = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
};

const v2 = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string", format: "email" },
  },
  required: ["email"],
};

// Generate a diff between two schema versions
const diff = diffSchemas(v1, v2);
console.log(diff);
// => { added: ["email"], removed: [], modified: [], breaking: true }

// Generate a migration script
const migration = generateMigration(v1, v2);
migration.apply(data);
```

---

## API

| Function            | Description                                      |
| ------------------- | ------------------------------------------------ |
| `diffSchemas`       | Returns a structured diff between two schemas    |
| `generateMigration` | Produces a migration object to transform payloads|

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

---

## License

[MIT](./LICENSE)