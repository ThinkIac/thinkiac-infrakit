# InfraKit v1 — Task Map (Thin Slice)

> **Goal:** Deliver a production-safe thin slice for tenant provisioning using Portainer, with optional reverse proxy exposure.

---

## 0. Meta & Constraints (Context Task)

**TASK-00: Define Non-Goals**

* Document explicit non-goals for v1
* Confirm “no updates, no rollback, no UI”
* Freeze scope

**Deliverable:** `docs/scope.md`

---

## 1. Project Skeleton

**TASK-01: Initialize Project Structure**

* Create package structure
* Configure TypeScript
* Define build target (ESM or CJS)
* Setup linting (minimal)

**Deliverables:**

* `package.json`
* `tsconfig.json`
* Base folder structure

---

## 2. Core Domain Types

**TASK-02: Define Core Types**

* TenantId
* StackName
* ComposeSpec
* InfraKitConfig
* AddonConfig

**Deliverable:** `src/core/types.ts`

---

## 3. Error Model

**TASK-03: Define Error Taxonomy**

* TenantAlreadyExistsError
* TenantNotFoundError
* PortainerAuthError
* StackProvisionError
* AddonProvisionError
* InvalidConfigurationError

**Deliverable:** `src/core/errors.ts`

---

## 4. Portainer Integration

**TASK-04: Implement Portainer Client**

* Auth via `/api/auth`
* JWT cache
* Auth retry on 401
* Generic request wrapper

**Deliverable:** `src/core/PortainerClient.ts`

---

**TASK-05: Stack Service**

* Create stack
* Remove stack
* List stacks
* Find stack by name

**Deliverable:** `src/core/StackService.ts`

---

## 5. Compose Generation

**TASK-06: Compose Builder**

* Deterministic compose output
* Single-service stack
* Fixed internal port
* External proxy network support
* Env injection

**Deliverable:** `src/core/ComposeBuilder.ts`

---

**TASK-07: Compose Validation**

* Validate tenantId → stack name
* Ensure no forbidden fields
* Fail fast on invalid input

**Deliverable:** Integrated in `ComposeBuilder`

---

## 6. Tenant Lifecycle (Facade)

**TASK-08: InfraKit Core Class**

* Accept config
* Initialize core services
* Load addons conditionally

**Deliverable:** `src/core/InfraKit.ts`

---

**TASK-09: Tenant Creation Flow**

* Check if tenant exists
* Generate compose
* Create stack
* Invoke addons (post-provision)

**Deliverable:** `createTenant()` implementation

---

**TASK-10: Tenant Removal Flow**

* Validate existence
* Remove stack
* Skip addon teardown (v1)

**Deliverable:** `removeTenant()` implementation

---

**TASK-11: Tenant Existence Check**

* Implement `existsTenant()`

**Deliverable:** Method in `InfraKit`

---

## 7. Addon System

**TASK-12: Addon Contract**

* Define addon interface
* Lifecycle hooks (`onProvision`)
* Error isolation rules

**Deliverable:** `src/addons/Addon.ts`

---

---

## 8. Nginx Proxy Manager Addon (v1)

**TASK-13: NPM Client**

* Auth via `/api/tokens`
* Token cache
* Request wrapper

**Deliverable:** `src/addons/nginx-proxy-manager/NpmClient.ts`

---

**TASK-14: NPM Proxy Service**

* Create proxy host
* Map domain → container
* Enable SSL (optional)

**Deliverable:** `src/addons/nginx-proxy-manager/NpmService.ts`

---

**TASK-15: NPM Addon Integration**

* Translate tenant data → proxy config
* Handle failures explicitly

**Deliverable:** `src/addons/nginx-proxy-manager/index.ts`

---

## 9. Networking Assumptions

**TASK-16: Document Network Requirements**

* External proxy network
* Docker DNS usage
* No host port publishing

**Deliverable:** `docs/networking.md`

---

## 10. Public Entry Point

**TASK-17: Export Public API**

* Export InfraKit
* Export error classes
* Export types

**Deliverable:** `src/index.ts`

---

## 11. Documentation

**TASK-18: Write Official README**

* Thin slice philosophy
* Architecture
* Usage
* Addons
* Roadmap

**Deliverable:** `README.md`

---

## 12. Examples

**TASK-19: Minimal Usage Example**

* Simple provisioning example
* With and without addon

**Deliverable:** `examples/basic.ts`

---

## 13. Quality Gates

**TASK-20: Runtime Guards**

* Prevent proxy + hostPort combo
* Validate addon configuration
* Fail early on misconfiguration

**Deliverable:** Integrated guards

---

## 14. Release Prep

**TASK-21: Versioning & Metadata**

* Set version to `0.1.0`
* License (MIT)
* Keywords & description

**Deliverables:**

* `package.json`
* `LICENSE`

---

## 15. Final Validation

**TASK-22: Thin Slice Review**

* Confirm all non-goals still excluded
* Ensure no feature creep
* Validate end-to-end provisioning flow

**Deliverable:** Internal checklist