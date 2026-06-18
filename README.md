# InfraKit

> **A thin, reliable provisioning layer for multi-tenant Docker environments.**

InfraKit is a **thin slice infrastructure toolkit** designed to provision **isolated Docker environments per tenant** using **Portainer**, with **optional exposure via reverse proxies** through a clean addon system.

InfraKit focuses on **determinism, reliability, and leverage**, not flexibility or abstraction density.

---

## Why InfraKit exists

Provisioning infrastructure per customer often becomes complex too early:

* Port collisions
* Manual reverse proxy configuration
* Over-engineered platforms
* Tight coupling between infra and application logic

InfraKit deliberately avoids that.

> **InfraKit v1 delivers the highest leverage path:**
> one tenant → one stack → optionally exposed → done.

---

## Core Principles

InfraKit v1 is built on the following principles:

* **Thin Slice First**
  Deliver the smallest production-safe surface that creates real value.

* **Determinism over Flexibility**
  Same input always produces the same infrastructure.

* **Isolation by Default**
  Each tenant is provisioned as its own Docker stack.

* **Stateless Core**
  No global state, no hidden registries, no magic.

* **Explicit Addons**
  Everything non-essential is opt-in and isolated.

* **Fail Fast, Fail Loud**
  Errors are explicit and never silently ignored.

---

## What InfraKit v1 Does

### Core Capabilities

* Authenticate with Portainer API
* Provision one Docker stack per tenant
* Generate deterministic Docker Compose files
* Remove tenant stacks cleanly
* Verify tenant existence

### Optional Capabilities (Addons)

* Expose tenant services via reverse proxy
* Automatic SSL via Let’s Encrypt (through supported providers)

---

## What InfraKit v1 Does NOT Do

This is intentional.

* ❌ No UI
* ❌ No CLI
* ❌ No stack updates
* ❌ No rollbacks
* ❌ No health checks
* ❌ No metrics
* ❌ No multi-endpoint orchestration
* ❌ No template engines
* ❌ No plugin marketplace

> If it does not directly help **provision, isolate, or expose a tenant**, it is not part of v1.

---

## Architecture Overview

```text
InfraKit
├── Core
│   ├── Portainer Client
│   ├── Stack Service
│   ├── Compose Builder
│   └── Tenant Lifecycle
│
└── Addons (Optional)
    └── Reverse Proxy Providers
```

---

## Tenant Model

InfraKit follows a simple and strict model:

```
1 Tenant = 1 Docker Stack = 1 Primary Service
```

Each tenant:

* Runs in its own isolated stack
* Uses a fixed internal port (e.g. 3000)
* Shares infrastructure only through controlled networks

---

## Public API (v1)

```ts
import { InfraKit } from "infrakit"

const infrakit = new InfraKit({
  portainer: {
    url: "http://localhost:9000",
    username: "admin",
    password: "secret"
  },
  addons: {
    nginxProxyManager: {
      url: "http://localhost:81",
      email: "admin@example.com",
      password: "secret"
    }
  }
})

await infrakit.createTenant({
  tenantId: "acme",
  image: "my-api:latest",
  env: {
    NODE_ENV: "production"
  },
  expose: {
    domain: "acme.example.com",
    ssl: true
  }
})
```

---

## Docker Networking Strategy

InfraKit avoids port collisions by design.

* No host port publishing per tenant
* All services use the same internal port
* Reverse proxy routes traffic by hostname
* Communication happens through shared Docker networks

This allows:

* Unlimited tenants
* Zero port conflicts
* Clean separation of concerns

---

## Addon System

Addons extend InfraKit without contaminating the core.

### Addon Characteristics

* Fully optional
* Explicit configuration
* No shared state with the core
* Failure does not corrupt tenant provisioning

---

### Built-in Addons (v1)

#### Nginx Proxy Manager

* Create proxy hosts
* Bind domain → container
* Automatic Let’s Encrypt SSL
* Uses Docker DNS (no IP coupling)

---

## Error Handling

InfraKit exposes explicit domain errors:

* `TenantAlreadyExistsError`
* `TenantNotFoundError`
* `PortainerAuthError`
* `StackProvisionError`
* `AddonProvisionError`

This makes integration with APIs (Express, Fastify, NestJS) predictable and safe.

---

## When InfraKit is the Right Tool

InfraKit is ideal if you:

* Need one isolated environment per customer
* Want to automate infra provisioning
* Already use Docker and Portainer
* Prefer clarity over flexibility
* Want to grow infrastructure capabilities incrementally

---

## When InfraKit is NOT the Right Tool

InfraKit is not intended to be:

* A full PaaS
* A Kubernetes replacement
* A deployment pipeline
* A monitoring platform

---

## Roadmap – Integrable Addons

InfraKit evolves horizontally, not vertically.

### v1 (Current – Thin Slice)

* Portainer provisioning
* Docker Compose generation
* Nginx Proxy Manager addon

---

### v1.x (Safe Extensions)

* Stack update support
* Domain update support
* HTTP → HTTPS redirects
* Custom headers in proxy addon

---

### v2 (Operational Maturity)

* Health checks per tenant
* Provisioning rollback
* Secrets management
* Multi-service stacks
* Port allocation addon (when required)

---

### v3 (Platform-Level Integrations)

* Traefik provider addon
* Caddy provider addon
* Observability hooks
* Multi-endpoint orchestration
* Audit logs

---

## Design Philosophy (Short Version)

> InfraKit does not try to solve infrastructure.
>
> It solves **one high-leverage problem extremely well**.

---

## License

MIT
