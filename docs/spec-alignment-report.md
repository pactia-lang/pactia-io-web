# Pactia Website — Spec Alignment Report

**Date:** 2026-07-02  
**Scope:** `pactia-io-web/` vs `spec/` (Pactia 1.2)  
**Method:** Line-by-line comparison of website content (landing page, overview, docs index) against the normative spec documents (language-spec.md, overview.md, packages.md, compilation.md, platform.md, grammar-reference.md, CHANGELOG.md, spec-v1.md).

---

## Summary

The website is broadly aligned with the Pactia 1.2 specification. The prose, philosophy, three-altitude model, intent line, package model, and toolchain descriptions are accurate. Five issues were found — one significant syntax error in the hero code snippet, one import-source misalignment, and three minor omissions.

---

## Issues Found

### 1. (Significant) Hero snippet — `@api` / `@auth` at product scope without `service` wrapper

**File:** `pactia-io-web/index.html` (lines 58–88 in the hero `<pre>` block)  
**Spec reference:** [language-spec.md — Placement (`in`)](spec/docs/language-spec.md#placement-in); [macros.md — `def` table](spec/docs/macros.md); [compilation.md — Tag lowering](spec/docs/compilation.md#tag-lowering)

The hero code snippet on the landing page renders the following structure:

```pactia
product Fleet {
  > Vehicle rental platform. ...
  context agent_rules { ... }

  #rust-stack
  #list
  #paginated

  @auth { roles: [Customer, Admin] }
  #owner
  @api list_bookings {
    method: GET,
    path: "/api/v1/bookings",
  }
}
```

**Problem:** `@auth`, `@api`, `#owner`, `#list`, and `#paginated` are all registered with `in service` placement in the kernel and rust-stack packages. The snippet places them directly inside `product { }` with no wrapping `service` or `module` block. This would emit `PLACEMENT_VIOLATION` at compile time.

**Fix:** Either wrap the tags in `module fleet { service FleetService { ... } }` (matching the fleet-management-mini fixture), or replace them with product-scope tags only (e.g. `@topology`, `@guide`, `#rust-stack`).

---

### 2. (Moderate) Import source — `#list`, `#paginated`, `#owner` imported from `@pactia/kernel`

**File:** `pactia-io-web/index.html` (hero snippet import lines)  
**Spec reference:** [spec-v1.md — Implemented packages table](spec/spec-v1.md#implemented-packages); [platform.md — Platform package authoring](spec/docs/platform.md#platform-package-authoring)

The hero snippet imports:

```pactia
import { @api, @auth, #list, #paginated, #owner } from @pactia/kernel;
import { #rust-stack } from @pactia/rust-stack;
```

**Problem (two layers):**

*Layer A — website vs spec:* Per [spec-v1.md — Implemented packages table](spec/spec-v1.md#implemented-packages), `#list` and `#paginated` are defined in `@pactia/rust-stack`, not in `@pactia/kernel`. The kernel exports `@entity`, `@api`, `@auth`, `@enum`, `@test`, `@@output`, `@@pk`, `#create`, `#database`. The rust-stack exports `#rust-stack`, `#list`, `#paginated`. The origin of `#owner` is not explicitly documented in the spec. The import source for `#list` and `#paginated` is wrong per the spec.

*Layer B — spec vs implementation:* The actual `pactia-io/kernel/index.pactia` does **not** export `#create` or `#database` (contrary to the spec's implemented-packages table). The actual `pactia-io/rust-stack/index.pactia` only exports `#rust-stack` — it does **not** export `#list` or `#paginated`. So these macros are referenced in spec examples and the website but are not yet implemented in either package's `index.pactia`.

**Fix:** Move `#list`, `#paginated`, and `#owner` to the `@pactia/rust-stack` import line (to match the spec). Additionally, the spec's implemented-packages table should be updated to reflect the actual exports in each package, or the packages should be updated to export the macros the spec claims they export:

```pactia
import { @api, @auth } from @pactia/kernel;
import { #rust-stack, #list, #paginated, #owner } from @pactia/rust-stack;
```

---

### 3. (Minor) Spec version not prominently stated on landing page

**File:** `pactia-io-web/index.html`  
**Spec reference:** [spec/README.md](spec/README.md) (badge: `spec-1.2-blue`); [CHANGELOG.md](spec/CHANGELOG.md) ("Current version: 1.2")

The spec README prominently displays "Current version: 1.2" and a badge. The landing page only mentions "Pactia 1.2" once, inside the "The stack" section as a repo description ("spec — Pactia 1.2 — grammar, tags, packages, attach rules"). The overview.html page never mentions the spec version at all.

**Recommendation:** Add a small version indicator near the top of the landing page or hero section (e.g. "Spec v1.2 — source files declare `pactia 1.0`").

---

### 4. (Minor) overview.html omits "Language version" section

**File:** `pactia-io-web/docs/overview.html`  
**Spec reference:** [spec/docs/overview.md — Language version](spec/docs/overview.md#language-version)

The spec overview.md includes a dedicated "Language version" section explaining that "Spec 1.2" and "source files declare `pactia 1.0`" are distinct concepts. The website overview.html does not include this section.

**Recommendation:** Add a short paragraph explaining the spec-version vs source-version distinction.

---

### 5. (Minor) Docs index missing several spec pages

**File:** `pactia-io-web/docs/index.html`  
**Spec reference:** [spec/docs/README.md](spec/docs/README.md) (full document index)

The website docs index lists: Overview, Language spec, Registry, Packages, Platform, Compilation, Grammar reference.

The spec repo also contains these pages not linked from the website:
- **macros.md** — Unified `def` for tags and macros
- **editor-support.md** — VS Code / Cursor highlighting rules
- **normative-reference.md** — One-page implementer cheat sheet

The website footer acknowledges: "Additional normative pages will be listed here as they ship — until then, they link to the GitHub spec repository." The macros page is particularly important since the spec discusses `def`, `in`, and macro expansion mechanics that are central to the language.

**Recommendation:** Add links to macros.md and editor-support.md (either hosted or with GitHub badge), or include them in the shipment roadmap.

---

## Verified Alignments

The following aspects were verified as correct and consistent between the website and the spec:

### Version line & syntax

| Concern | Website | Spec | Status |
|---------|---------|------|--------|
| Version line in examples | `pactia 1.0` | `pactia 1.0` | ✓ |
| Macro syntax | `#name` (hash) | `#name` (bracket deprecated) | ✓ |
| Modifier syntax | `@@output`, `@@pk`, `@@nullable` | `@@name` | ✓ |
| Host tag block syntax | `@tag { field: value }` | Same | ✓ |
| Host tag shorthand | `@auth Customer` | Valid when `modifier,` in def | ✓ |
| Prose syntax | `> single`, `>> multi >>` | Same | ✓ |
| Context keyword | `context name { path: "..." }` | Same | ✓ |
| Import syntax | `import @scope/name;` / partial | Same | ✓ |

### Keywords

| Keyword | Website usage | Spec definition | Status |
|---------|--------------|-----------------|--------|
| `product` | Used correctly | Root block | ✓ |
| `module` | Used correctly | Capability group | ✓ |
| `service` | Used correctly | Deployable API unit | ✓ |
| `model` | Used correctly | Data shapes | ✓ |
| `import` | Used correctly | Package/file import | ✓ |
| `export` | Not shown (package authoring) | Export defs | — |
| `def` | Not shown | Register tags/macros | — |
| `in` | Not shown | Placement on def | — |
| `context` | Used correctly | Attach external files | ✓ |

### Three altitudes

| Altitude | Website description | Spec description | Status |
|----------|--------------------|--------------------|--------|
| Altitude 0 | Prose only in `product { }` | Same | ✓ |
| Altitude 1 | Light `@tag` usage | Same | ✓ |
| Altitude 2 | Full tag + macro surface | Same (relay.pactia) | ✓ |
| Prose is not a placeholder | Stated | Stated | ✓ |
| Tags are opt-in | Stated | Stated | ✓ |

### Packages & toolchain

| Concern | Website | Spec | Status |
|---------|---------|------|--------|
| Crate model | `pactia.toml` + `index.pactia` | Same | ✓ |
| Distribution | Git repos + semver tags (Go-style) | Same | ✓ |
| Lockfile | `pactia.lock` (TOML) | Same | ✓ |
| Commands | `init`, `add`, `install`, `update`, `build` | Same | ✓ |
| Coordinates | `@pactia/kernel`, `@github.com/org/repo` | Same | ✓ |
| Stack binding | `#rust-stack` at product level | Same (1.2) | ✓ |
| No `[stack]` in TOML | Not shown (correct implicit) | Stated | ✓ |
| No `kind` field in TOML | Not shown (correct implicit) | Stated | ✓ |

### Intent line & provenance

| Concern | Website | Spec | Status |
|---------|---------|------|--------|
| Above the line | Entities, APIs, roles, policy, stack, prose, tags, packages, provenance | Same | ✓ |
| Below the line | Logic, indexes, edge cases, tuning, copy | Same | ✓ |
| Conformance gate | Shown | Same | ✓ |
| NOT_DERIVABLE | Mentioned | Documented | ✓ |
| Provenance labels | Pactia, MACRO, PACKAGE, GUIDANCE | Same | ✓ |

### Toolchain descriptions

| Tool | Website | Spec | Status |
|------|---------|------|--------|
| pactiac | Deterministic compile to AI-neutral IR | Same | ✓ |
| pactia | Package manager (init, add, build) | Same | ✓ |
| vscode-pactia | Syntax highlighting | Same | ✓ |
| BSC | Render + optional LLM expand | Same | ✓ |
| No LLM in pactiac | Stated | Stated | ✓ |
| Model-agnostic | Stated | Stated | ✓ |

### Repo links

| Link text | Target | Valid per spec | Status |
|-----------|--------|---------------|--------|
| "spec" repo | `github.com/pactia-lang/spec` | Correct | ✓ |
| "pactiac" repo | `github.com/pactia-lang/pactiac` | Correct | ✓ |
| "pactia" repo | `github.com/pactia-lang/pactia` | Correct | ✓ |
| "vscode-pactia" repo | `github.com/pactia-lang/vscode-pactia` | Correct | ✓ |
| GitHub org | `github.com/pactia-lang` | Correct | ✓ |
| fleet-management-mini fixture | `.github/profile/examples/fleet-management-mini.pactia` | Correct | ✓ |
| fleet-management-prose fixture | `.github/profile/examples/fleet-management-prose.pactia` | Correct | ✓ |
| relay.pactia fixture | `pactiac/test/fixtures/kernel/relay.pactia` | Correct | ✓ |
| marketplace example | `examples/tree/main/marketplace` | Correct | ✓ |
| Language spec link | `spec/docs/language-spec.md` | Correct | ✓ |

### Example code patterns

| Pattern | Website usage | Spec | Status |
|---------|--------------|------|--------|
| `@entity` with `@@pk` on fields | Correct | `@@pk` modifier on field line | ✓ |
| `@@output Type` before `@api` | Correct | modifier binds to next host | ✓ |
| `#list` / `#paginated` inside service | Correct (in fixtures) | `in service` placement | ✓ |
| `@test` with `name`/`when`/`then` | Correct | Package-defined tag | ✓ |
| `context` at product scope | Correct | Valid in product/module/service/model | ✓ |
| `${name}` interpolation in prose | Correct | Module constants or imported constants | ✓ |
| `@actor` shorthand | Correct | `modifier,` in def | ✓ |
| `@rule` with prose | Correct | Package-defined tag | ✓ |
| `@topology { mode: microservices }` | Correct | Package-defined product-scope tag | ✓ |

---

## Recommendations

### Must fix

1. **Hero snippet placement** — Add a `module fleet { service FleetService { ... } }` wrapper around `@auth`, `#owner`, and `@api list_bookings` in the landing page hero code snippet. The current snippet is syntactically invalid per the spec.

2. **Import source** — Move `#list` and `#paginated` to the `@pactia/rust-stack` import line in the hero snippet (or verify actual kernel exports and correct accordingly).

### Should fix

3. **Spec version visibility** — Add a brief version statement near the top of the landing page and overview page indicating "Spec v1.2 — source files declare `pactia 1.0`".

4. **Docs index completeness** — Add links to macros.md and editor-support.md on the docs index page (even if they point to GitHub).

### Nice to have

5. **overview.html language version section** — Add the missing "Language version" section explaining the spec-version vs source-version distinction.

6. **Install script URL verification** — Confirm that `https://raw.githubusercontent.com/pactia-lang/pactia/main/scripts/install-pactia.sh` resolves correctly.

---

## Items Intentionally Not Aligned (acceptable deviations)

- The website is an introductory/marketing surface; it does not need to cover topology packages (1.3), file-local imports (1.4), multi-file packages (1.4), or detailed `def` semantics. These are appropriate for the full language spec.
- The website overview.html condenses the spec overview.md significantly. Omitted content (BSC architecture coverage, decision checklist, product concern matrix) is reasonable for an introductory page.
- Fictional package names (`@acme/agent-standards`, `@pactia/kyc-compliance`) used in examples are acceptable illustrations.
- The website does not host all spec pages locally; linking to GitHub for most normative documents is an explicit, documented choice.

---

## Conclusion

The Pactia website is well-aligned with the spec for its role as an introductory and orientation surface. The two code errors in the hero snippet (placement violation and import source) should be corrected to avoid misleading visitors about valid Pactia syntax. All other content — philosophy, three altitudes, intent line, package model, toolchain descriptions, links, and terminology — is consistent with the Pactia 1.2 specification.