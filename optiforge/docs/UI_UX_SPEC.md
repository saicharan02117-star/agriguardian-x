# Evaluation website UI/UX specification

## Product structure
1. **Diagnose** — image upload, field identity, optional geolocation, AI result and safe next action.
2. **Crop library** — filter by crop and affected part; show symptoms, confirmation, action and source.
3. **Treatment guide** — calculate quantity only from the treated area and a verified label or expert rate.
4. **Field records** — plant-level history, coordinates and revisit status.
5. **Evidence** — model scope, data provenance, security, SDGs and limitations.

Hardware camera, LED and soil-controller controls are excluded from this evaluation website. They belong in the rover operator interface.

## Interaction rules
- The first screen starts the diagnosis task; there is no marketing gate.
- The AI class, confidence, severity and image quality are visually distinct.
- Low confidence triggers an abstention and recapture instructions.
- AI results and symptom-guide results use different labels.
- No destructive treatment action is automatic; farmer approval remains explicit.
- Main body text is at least 16 px and the layout remains usable at 200% zoom.
- Mobile navigation stays reachable at the bottom; desktop navigation stays at the top.

## Treatment and quantity rules
The prototype calculator shows arithmetic only when area, a confirmed condition, a verified per-acre rate and its label/expert reference are supplied. Before application, the farmer must also confirm crop, growth stage, formulation/active ingredient, local registration, protective equipment and weather. Otherwise the interface shows confirmation and prevention steps plus “consult local guidance.” This prevents a visually similar symptom from causing an unsafe dose recommendation.
