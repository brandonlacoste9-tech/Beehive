# Hive Rituals Index

A centralized registry for operational rituals in the Beehive repository. Every contributor can reference this scroll for the latest templates and checklists.

---

## 🟡 Ritual Seal Template
- **File:** `.github/RITUAL-TEMPLATE.md`
- **Purpose:** Standardizes how every milestone or process seal is inscribed in `CHANGELOG.md` and `scrolls/registry.md`.

## 🟡 Pre-Merge Ritual Checklist
- **File:** `.github/MERGE-Ritual.md`
- **Purpose:** Ensures every pull request is clean, reviewed, and follows ceremonial standards before merging.

## 🟡 Post-Merge Checklist
- **File:** `.github/post-merge-checklist.md`
- **Purpose:** Guides verification of deployments, dashboard integrity, and documentation after every merge.

---

## 🟢 Netlify Ritual Automations (v1.5.0)
- **Function:** `/.netlify/functions/smoke-test`
- **Purpose:** Runs post-deploy smoke tests against preview URLs, logs to Supabase, and comments back on the PR.
- **UI Trigger:** Dashboard → Ritual Control Panel → “Run smoke tests”.

- **Function:** `/.netlify/functions/risk-score`
- **Purpose:** Scores the current patch via Gemini, highlighting risky files, heavy churn, and config changes.
- **UI Trigger:** Dashboard → Ritual Control Panel → “Score patch risk”.

- **Function:** `/.netlify/functions/label-pr`
- **Purpose:** Applies GitHub labels inferred from touched paths (infra, auth, routing, dependencies, scripts).
- **UI Trigger:** Dashboard → Ritual Control Panel → “Label PR”.

- **Function:** `/.netlify/functions/predict-todos`
- **Purpose:** Synthesizes immediate TODOs and follow-up work from the diff and posts them to the PR conversation.
- **UI Trigger:** Dashboard → Ritual Control Panel → “Predict TODOs”.

---

**How to use:**
- Review this index before every PR or milestone.
- Follow the linked rituals for consistent, audit-ready operations.
- Update this index when new ritual scrolls are added.

---

> The Hive’s lineage is protected by ritual. Every merge, every seal, every contributor follows the same path.