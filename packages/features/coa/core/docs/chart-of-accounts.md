# Domain Specification: Chart of Accounts (CoA)

This document establishes the normative framework for the Chart of Accounts (CoA) module.

> The key words "**MUST**", "**MUST NOT**", "**REQUIRED**", "**SHALL**", "**SHALL NOT**", "SHOULD", "**SHOULD NOT**", "**RECOMMENDED**",  "**MAY**", and "**OPTIONAL**" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/info/rfc2119/).

---
## 1. Domain Glossary

The following terms define the **Ubiquitous Language** for the CoA domain:

* **Account Class:** The primary financial categorization determining the nature of the account (e.g., Asset, Liability, Equity, Revenue, Expense).
* **Contra Account:** An account that maintains a balance nature opposite to its assigned Account Class.
* **Local Index:** A sequential integer identifying a node uniquely relative to its sibling nodes under a shared parent.
* **Parent Account:** The node in the hierarchy that serves as the direct ancestor of another node.
* **Posting Account:** A terminal node (leaf) in the hierarchy and the sole entity type permitted to hold ledger entries.
* **Root Account:** The apex node in the hierarchy for a given `Account Class`, serving as the foundational parent for all subsequent accounts within that class.
* **Structural Code:** A unique, deterministic identifier representing the absolute position of an account within the hierarchy, composed exclusively of integer segments delimited by periods and derived recursively from its ancestral lineage (e.g., `1.1.2`).
* **Summary Account:** A non-terminal node in the hierarchy used exclusively for balance aggregation.

---
## 2. Entity Definition: `Account` 

The `Account` entity is the fundamental unit of the `Chart of Accounts`.

| Attribute           | Type                | Requirement                    | Mutability            |
| :------------------ | :------------------ | :----------------------------- | :-------------------- |
| **Name**            | String              | Mandatory                      | Mutable               |
| **Description**     | String              | Optional                       | Mutable               |
| **Parent Account**  | Reference (Account) | Optional (Root only)           | Immutable             |
| **Local Index**     | Integer             | Mandatory                      | Immutable             |
| **Structural Code** | String              | Unique Identifier (Calculated) | Immutable             |
| **Account Class**   | Enum                | Mandatory                      | Immutable             |
| **Is Contra**       | Boolean             | Mandatory                      | Mutable (Conditional) |
| **Is Summary**      | Boolean             | Mandatory                      | Immutable             |
| **Is Active**       | Boolean             | Mandatory                      | Mutable               |

---

## 3. Domain Invariants

### 3.1. Hierarchical Tree Integrity (HTI)

* **HTI-01 (Root Uniqueness):** There **MUST** be exactly one `Root Account` per `Account Class`. Multiple roots for a single class are prohibited.
* **HTI-02 (Parental Integrity):** Every account, except for `Root Accounts`, **MUST** be associated with exactly one `Parent Account`.
* **HTI-03 (Self-Reference Prohibition):** An account **MUST NOT** be its own `Parent Account`.
* **HTI-04 (Leaf Node Constraint):** A `Posting Account` (`Is Summary = false`) **MUST NOT** possess child nodes.
* **HTI-05 (Structural Immutability):** The parent-child relationship **MUST NOT** be modified post-persistence. 
* **HTI-06 (Identifier Uniqueness):** The `Structural Code` **MUST** be unique across the entire domain.
* **HTI-07 (Status Cascade):** If an account is marked inactive (`Is Active = false`), all descendant nodes **MUST** be inactive. An active node **MUST NOT** exist under an inactive parent.
* **HTI-08 (Local Index Uniqueness):** Sibling accounts sharing the same immediate parent node **MUST NOT** share the same `Local Index`.
* **HTI-09 (Numeric Canonical Form):** The `Structural Code` **MUST** be evaluated in its canonical numeric form. Zero-padded segments (e.g., `1.02`) **MUST NOT** evaluate as distinct from their standardized counterparts (e.g., `1.2`) for uniqueness validation purposes.
* **HTI-10 (Derivation Rule):** The `Structural Code` **MUST** be programmatically derived by appending the account's `Local Index` to the `Structural Code` of its parent node.
 
### 3.2. Chart Of Accounts Logic (COA)

* **COA-01 (Class Consistency):** An account **MUST** inherit the `Account Class` of its `Parent Account`.
* **COA-02 (Contra Propagation):** If a `Summary Account` is designated as a `Contra Account` (`Is Contra = true`), all descendants **MUST** inherit this status. A standard account **MUST NOT** reside within a `Contra Account` subtree.
* **COA-03 (Transaction Restriction):** `Summary Accounts` **MUST NOT** be targeted for ledger entries. Financial transactions are restricted to Posting Accounts.


### 3.3. Audit (AUD) 

* **AUD-01 (Non-Destructive Deletion):** Accounts **MUST NOT** be physically deleted. Data retention is mandatory for financial integrity.
* **AUD-02 (Traceability):** All state transitions **MUST** be logged with a high-precision and timezone-aware `Timestamp` and the `User ID` of the initiating actor.

---

## 4. Mutation Matrix

| Operation                              | Permitted | Constraint / Reference                               |
| :------------------------------------- | :-------- | :--------------------------------------------------- |
| **Modify Metadata (Name/Description)** | **Yes**   | No domain-level constraints.                         |
| **Update Contra Status**               | **Yes**   | **MUST** enforce **COA-02** (cascade to descendants). |
| **Update Activation Status**           | **Yes**   | **MUST** enforce **HTI-07**.                          |
| **Convert Summary/Posting Type**       | **No**    | Prohibited post-creation.                            |
| **Parent Reassignment**                | **No**    | Violates **HTI-05**.                                  |
| **Physical Hard Delete**               | **No**    | Violates **AUD-01**.                                  |
