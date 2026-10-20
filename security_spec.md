# Security Specification — Veterinary Clinic «Лапа Помощи»

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched in `firestore.rules` are unconditionally denied (`allow read, write: if false;`).
2. **Path Variable Hardening (`isValidId`)**: Every single-document operation (`get`, `create`, `update`, `delete`) enforces `isValidId(docId)` matching `^[a-zA-Z0-9_\-]+$` with length `1..128`.
3. **Strict Schema & Key Validation (`isValid[Entity]`)**: Every `create` and `update` operation validates exact required keys (`hasAll`) and allowed keys (`hasOnly`), field types (`string`, `number`, `bool`, `list`), string length bounds (`.size() <= MAX`), numeric bounds, and enum values (`status`, `category`, `role`).
4. **Role Escalation Prevention**: Client account documents in `/users/{userId}` strictly enforce `role == 'user'`. Self-assigned `'admin'` role writes are rejected.
5. **Action-Based Updates (`affectedKeys().hasOnly(...)`)**: Every `update` block wraps logic in `isValid[Entity](incoming())` and restricts mutable fields while keeping immutable identifiers (`id`, `uid`, `createdAt`) unchanged.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on Appointment**: Adding `"isAdmin": true` to `/appointments/LP-101` — rejected by `data.keys().hasOnly(...)`.
2. **Oversized ID Poisoning**: Creating `/appointments/` with a 500-character document ID — rejected by `isValidId(appointmentId)`.
3. **Invalid Appointment Status Enum**: Setting `status: "Hacked"` on `/appointments/LP-101` — rejected by `data.status in ['Новая', 'Подтверждена', 'Завершена', 'Отменена']`.
4. **Negative Price Injection**: Creating a service or appointment with `priceFrom: -5000` — rejected by `data.priceFrom >= 0`.
5. **Privilege Escalation in Users Collection**: Registering `/users/u1` with `role: "admin"` — rejected by `data.role == 'user'`.
6. **Immutable ID Mutation on Update**: Updating `/appointments/LP-101` with `id: "LP-999"` — rejected by `incoming().id == existing().id`.
7. **Immutable CreatedAt Mutation**: Updating `/appointments/LP-101` with a modified `createdAt` — rejected by `incoming().createdAt == existing().createdAt`.
8. **Unbounded Array Exhaustion on Service**: Creating `/services/s1` with 100 items in `included` — rejected by `data.included.size() <= 20`.
9. **Rating Out-of-Bounds on Review**: Creating `/reviews/r1` with `rating: 99` — rejected by `data.rating >= 1 && data.rating <= 5`.
10. **Oversized Notes Payload**: Sending a 50KB string in `notes` on `/appointments/LP-101` — rejected by `data.notes.size() <= 2000`.
11. **Invalid Category on Service**: Creating `/services/s1` with `category: "unknown"` — rejected by `data.category in ['diagnostics', 'treatment', 'care']`.
12. **Unmatched Collection Write**: Writing to `/secret_collection/doc1` — rejected by global catch-all `match /{document=**} { allow read, write: if false; }`.
