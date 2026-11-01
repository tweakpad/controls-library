# Color roles: reference measurements

Measured on 2026-11-01 from reference screenshots the user supplied (they cannot be resent). They give the relationships between fill, border and text; values are derived from the library's own roles, not copied.

All measurements are approximate; these images can't be resent.

**Bordered status badges, dark** (images 31–33; page about `#181818`–`#1e1e1e`). Each has a tinted fill, a role border and role text; radius is md (31, 32) or sm (33).

| Badge | Fill | Border | Text |
| --- | --- | --- | --- |
| Success ("Grow", "Live", "Approved") | `#1e3a2b` | `#2e5c42` | `#4fc38a` (33: `#4fb57e`) |
| Warning ("Reduce", "Limited") | `#3e3212` | `#6b5418` | `#e6b31e` |
| Destructive ("Exit", "Declined") | `#3c1f1f` | `#6b3232` | `#e86a6a` |
| Info/primary ("In Review") | `#2a1f4a` | `#4a3480` | `#8b6cf0` |
| Neutral ("Hold") | `#1f1f1f` | `#3a3a3a` | `#f2f2f2` |
| Muted outline ("Open", dashed icon) | `#1c1c1c` | `#3d3d3d` | `#9a9a9a` |

The adjacent hint icon is `#e8b923`.

**Bordered alerts, dark** (image 34; page `#0a0a0a`, square corners). Every alert has a white title (`#f5f5f5`), a muted description (`#a3a3a3`) and a role-colored icon.

| Alert | Fill | Border | Icon |
| --- | --- | --- | --- |
| Info | `#0f0d1a` | `#3b2d8f` | `#8b5cf6` |
| Success | `#0c1a14` | `#1f5c3e` | `#34d399` |
| Warning | `#17140a` | `#5c4a12` | `#eab308` |
| Error | `#1a0f0f` | `#6b2a2a` | `#f87171` |

**Flat badges** (images 35 dark, 36 light; pill radius; no border except Outline).

| Badge | Dark (page `#0a0a0a`) | Light |
| --- | --- | --- |
| Default | fill `#e5e5e5`, text `#171717` (neutral inverse) | fill `#0a0a0a`, text `#ffffff` |
| Secondary | fill `#262626`, text `#fafafa` | fill `#f4f4f5`, text `#171717` |
| Destructive | fill `#3b1416` (red tint about 20%), text `#f87171` | fill `#fde8e8` (red tint about 10%), text `#dc2626` |
| Outline | border `#2e2e2e`, text `#fafafa` | border `#e5e5e5`, text `#171717` |
| Ghost | text `#fafafa` | text `#171717` |

**Relationships derived from these** (what we reproduce with our own palette):
- Bordered status fill: the role at about 18–22% over the background.
- Bordered status border: the role at about 35–45% over the background.
- Status text: a lighter role tone in dark (about 400 weight), a darker one in light (about 600).
- Alert fill: the role at about 5–7% over the background. Alert border: the role at about 35%.
- Alert title: the foreground; description: muted foreground; icon: the status text tone.
- Flat: the same fill and text, with a transparent border.
