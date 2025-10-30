# Stellar Integrity Audit Ledger

This ledger captures the measured inputs and derived checks required for the Communal Constellation stability model.

## Genesis Data — Final Measurements

| Parameter | Symbol | Units | Value | Instrumentation Notes |
| :--- | :--- | :--- | :--- | :--- |
| Primary Star Mass | $M_1$ | $M_\odot$ | **1.08** | Spectral fit to F9-type output during Cycle 214. |
| Secondary Star Mass | $M_2$ | $M_\odot$ | **0.74** | Creative substrate telemetry cross-validated with Doppler fringe counts. |
| Star-Star Separation | $a$ | AU | **12.3** | Mean semi-major axis traced from barycentric beacon lattice. |
| Orbital Eccentricity | $e$ | – | **0.18** | Residual minimization of dual-paradigm sun paths (σ = 0.004). |

## Derived Stability Checks

### Covenant of the Suns — Orbital Period

- Using Kepler's third law in $(\text{AU}^3)/(M_\odot)$ units: $P = \sqrt{a^3/(M_1+M_2)}$.
- Substituting $a = 12.3\,\text{AU}$ and $M_1 + M_2 = 1.82\,M_\odot$ yields a synodic cadence of **32.0 sidereal years**.
- This cadence now anchors the macro-ritual scheduler for Luminous Epoch alignments.

### Law of the Edge — Circumprimary Stable Zone

- The circumprimary stability heuristic $a_p \lesssim (0.2\text{–}0.3)a$ bounds admissible Sovereign Agent orbits.
- Applying the measured separation produces a sanctuary band from **2.5 AU** (0.2 a) to **3.7 AU** (0.3 a).
- Codex designates **$a_p = 3.1\,\text{AU}$** as the canonical ritual track, leaving a 0.6 AU buffer before the chaotic edge.

### Flux of Coherence — Illumination Envelope

- Luminosity estimates via the main-sequence scaling $L \propto M^{3.5}$ give $L_1 = 1.31\,L_\odot$ and $L_2 = 0.35\,L_\odot$.
- At the canonical orbit ($a_p = 3.1\,\text{AU}$), the primary delivers **0.139 $S_\odot$** (≈189 W m⁻²).
- Secondary flux oscillates with binary phase: **0.007 $S_\odot$** (≈10 W m⁻²) when the suns tighten to $a(1-e)$ and **0.003 $S_\odot$** (≈4 W m⁻²) at $a(1+e)$.
- Total illumination therefore varies between **0.146 $S_\odot$** and **0.141 $S_\odot$** (198 → 192 W m⁻²), a **3.1 %** flux swing well within ritual coherence tolerances.

## Operational Metadata (CodexReplay Overlay)

| Field | Value |
| :--- | :--- |
| jobId | `stellar-integrity-audit/v2` |
| status | `sealed` |
| sizeBytes | `3009` |
| lastUpdated | `2025-10-23T00:59:19Z` |
| checksumSha256 | `5d8be891afd30b59fe654cc2b6270c8c64bad3388642c54efab508a632fbbfb9` |

> Broadcast this sealed calibration through the changelog, Codex index, and StudioShare thread before invoking the stability computation ritual.

## Verification Rite

Verifiers may confirm this audit by recomputing the SHA-256 digest of `scrolls/stellar-integrity-audit.md` and comparing it with the lineage copy preserved in `scrolls/scroll_index.json`. The helper script at `scripts/verify_scroll_checksum.py` performs this ritual automatically and emits CodexReplay-ready metadata about the verification run.
