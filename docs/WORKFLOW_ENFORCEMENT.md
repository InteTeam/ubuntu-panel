# Workflow Enforcement Guide

**Purpose:** Prevent guideline violations by enforcing proper workflow sequence  
**Critical:** This document contains MANDATORY steps that CANNOT be skipped

---

## 🚨 CRITICAL: Pre-Flight Checklist

**BEFORE starting ANY feature planning, development, or documentation:**

```
[ ] 1. I have read .sop.md and understand the workflow
[ ] 2. I have read DEVELOPMENT_GUIDELINES.md
[ ] 3. I have read TESTING_GUIDELINES.md
[ ] 4. I have opened FEATURE_DESIGN_CHECKLIST.md as my template
[ ] 5. I understand this is compliance engineering, not creative writing
```

**If ANY box is unchecked → STOP and complete it first**

---

## Mandatory Reading Sequence

### For ANY Feature Work:

**Step 0: Read Guidelines FIRST (MANDATORY)**

```bash
# 1. Read SOP (ALWAYS)
Read: /.sop.md

# 2. Read development guidelines (ALWAYS)
Read: /docs/DEVELOPMENT_GUIDELINES.md

# 3. Read testing guidelines (ALWAYS)
Read: /docs/TESTING_GUIDELINES.md

# 4. Read feature checklist (ALWAYS)
Read: /docs/FEATURE_DESIGN_CHECKLIST.md

# 5. Read documentation standards (ALWAYS)
Read: /docs/DOCUMENTATION_STANDARDS.md
```

**⚠️ CRITICAL: You MUST read these files BEFORE writing ANY code or documentation**

**Verification:** After reading, you must be able to answer:
- What is the exact flash message format?
- What is the exact authorization pattern?
- What attribute goes on controllers?
- What attribute goes on models?
- What syntax for validation rules?
- What test framework and syntax?

**If you cannot answer these → READ AGAIN**

---

## Feature Planning Workflow

### Phase 1: Preparation (CANNOT SKIP)

```markdown
## MANDATORY CHECKLIST - Phase 1

[ ] Read ALL guideline files listed above
[ ] Opened FEATURE_DESIGN_CHECKLIST.md as template
[ ] Created feature directory: docs/features/{feature_name}/
[ ] Verified understanding of exact requirements
```

**STOP POINT:** If checklist incomplete → DO NOT PROCEED

### Phase 2: Component Inventory (CANNOT SKIP)

**Before planning ANY frontend components:**

```bash
# Check existing components from InteTeam CRM import
# Will be at: resources/js/components/

[ ] Listed existing ui/ components
[ ] Listed existing Atoms/
[ ] Listed existing Molecules/
[ ] Listed existing Organisms/
[ ] Documented which to REUSE vs CREATE
```

See `/docs/COMPONENT_REUSE_CHECKLIST.md` for full process.

### Phase 3: Documentation

```markdown
[ ] Feature README created with compliance checklist
[ ] Architecture documented
[ ] Database migrations documented (per-table)
[ ] Component tree documented (reuse vs create)
[ ] API endpoints documented
[ ] Test scenarios documented
```

### Phase 4: Implementation

```markdown
[ ] Tests written first (TDD)
[ ] Code follows DEVELOPMENT_GUIDELINES.md exactly
[ ] Feature-by-feature testing (not full suite)
[ ] PHPStan Level 9 passing
[ ] Pint formatting applied
```

---

## Common Mistakes and Prevention

### Mistake 1: "I read the guidelines generally"

**Problem:** Reading ≠ Understanding exact patterns  
**Prevention:** 
- Copy exact code examples from guidelines
- Don't paraphrase technical requirements

### Mistake 2: "I'll check compliance at the end"

**Problem:** Retrofitting compliance is harder than building it in  
**Prevention:**
- Check off items AS you document
- Review each section immediately

### Mistake 3: "That seems like the same thing"

**Problem:** Similar ≠ Identical in compliance  
**Examples:**
- `$this->authorize()` vs `auth()->user()->can()` → DIFFERENT
- `['required', 'string']` vs `'required|string'` → DIFFERENT

### Mistake 4: "I'll plan components from scratch"

**Problem:** Planning without checking existing violates DRY  
**Prevention:**
- ALWAYS check existing components first
- Document import paths for reused components

---

## Workflow Comparison

### ❌ WRONG Workflow

```
1. Start writing code
2. Read guidelines later
3. Find compliance issues
4. Rewrite everything
```

### ✅ CORRECT Workflow

```
1. Read ALL guidelines first
2. Use checklist as template
3. Check existing components
4. Write compliant code first time
5. No rework needed
```

---

## Enforcement for AI Agents

**MANDATORY: Start EVERY feature response with:**

```markdown
## Pre-Flight Verification

Before ANY work, I will:
1. [ ] Read DEVELOPMENT_GUIDELINES.md
2. [ ] Read TESTING_GUIDELINES.md
3. [ ] Read FEATURE_DESIGN_CHECKLIST.md
4. [ ] Check existing components

Key patterns identified:
- Flash format: "The [action] was [result]."
- Authorization: auth()->user()->can() with abort(403)
- Attributes: #[UsePolicy] on controllers and models
- Validation: Array-based rules
- Tests: Pest 4 functional syntax

Now proceeding with compliant work...
```

---

## Summary

**Core problems this prevents:**
1. Guidelines read AFTER writing instead of BEFORE
2. Components planned WITHOUT checking existing ones
3. Compliance checked at END instead of during

**Success criteria:**
- 100% compliance on first draft
- No rework needed
- All patterns match guidelines exactly
- Zero duplicate components planned
