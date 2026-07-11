import React from "react";

/**
 * Static, lightweight homepage background.
 *
 * Previously this surface mounted a full Three.js scene with thousands of
 * particles, ShaderMaterials, mouse-attraction logic, pulse events, and
 * transaction particles, all driven by a continuous render loop. That made
 * the landing page feel "alive" but consistently degraded scroll/jank
 * scores on average laptops and mobile, and pulled in a heavy WebGL stack
 * just for decoration.
 *
 * The background now consists of four CSS-only layers:
 *
 *   1. A calm radial-gradient wash using the brand colour tokens — the
 *      same colour palette, the same atmosphere, zero per-frame work.
 *   2. A small constellation of 15 ambient "dust" dots. Each dot uses a
 *      CSS keyframe animation (slow vertical drift + faint twinkle) and a
 *      fixed position chosen for visual balance. Three keyframe variants
 *      (`rxDustA/B/C`) with different durations, easings, and amplitudes
 *      so the dots never move in lockstep. Motion periods are tuned long
 *      (20–32s) so the drift is almost subconscious.
 *   3. An academic-identity wallpaper of 10 outline icons (calculator,
 *      laptop, notebook, ruler, backpack, graduation cap, microscope,
 *      flask, pencil, compass) anchored to page edges and corners so
 *      they never collide with hero copy, feature/FAQ cards, or the
 *      CTA. Each icon drifts on a 35–50s keyframe
 *      (`rxIconDriftA/B/C`) at 4–6% opacity with a unique delay. The
 *      opacity half-cycle dips only slightly below the per-icon
 *      baseline (0.9 → 0.75 of baseline) so the icons feel like
 *      breathing wallpaper, not a fade-in/fade-out animation. No
 *      rotation, no scaling, no mouse interaction — pure decoration.
 *   4. Two faint, blurred accent circles parked at opposite corners.
 *      They add soft depth without introducing any recognisable shape,
 *      animation, or interaction.
 *
 * All layers are `pointer-events: none`, idle when not animating, and
 * fully respect `prefers-reduced-motion` via the global rule in
 * `globals.css`. No JavaScript runs in the background.
 */

// Pre-computed dot positions (percentages). 15 dots — kept inside the
// 12–18 range requested by the polish pass — picked by hand for natural
// distribution across the viewport: no clumping, no grid pattern.
// Sizes vary 1.5–3px and opacities 0.45–0.75 so a few dots read more
// strongly than the rest, mimicking real particulate. A soft matching
// glow (`box-shadow`) keeps each dot readable on the cream surface
// without darkening the page.

// ── Academic icon wallpaper ────────────────────────────────────────────────

// 10 outline icons drawn as inline SVG. Sizes are decorative
// (64–100px depending on viewport — 15–20% smaller than the previous
// pass so they recede behind the foreground rather than compete
// with it). Positions are picked to keep icons near page edges,
// corners, and negative space so they never overlap hero copy,
// feature cards, FAQ body, or the CTA. Drift periods are the slowest
// in the page (35–50s) so the icons read as ambient wallpaper, not
// foreground animation. No rotation, no scaling, no mouse
// interaction.
//
// Opacities live in the 0.04–0.06 band (≈4–6%) so the dust remains
// the primary motion source. Each icon uses one of three keyframe
// variants (`a`/`b`/`c`) and a unique delay so no two icons are ever
// in phase. The keyframe itself dips only to ~0.75 of the per-icon
// baseline (0.9 → 0.75 → 0.9) for a faint breathing effect rather
// than a noticeable fade.
type AcademicIconKey =
    | "calculator"
    | "laptop"
    | "notebook"
    | "ruler"
    | "backpack"
    | "graduation"
    | "microscope"
    | "flask"
    | "pencil"
    | "compass";

const ACADEMIC_ICONS: ReadonlyArray<{
    key: AcademicIconKey;
    top: string;
    left: string;
    size: number;
    opacity: number;
    delay: string;
    variant: "a" | "b" | "c";
    hideBelow: "sm" | "md" | "lg" | "xl";
}> = [
    // Top-left cluster
    { key: "calculator", top: "7%", left: "4%", size: 78, opacity: 0.06, delay: "0s", variant: "a", hideBelow: "sm" },
    // Top-right cluster
    { key: "graduation", top: "9%", left: "88%", size: 96, opacity: 0.05, delay: "4.7s", variant: "b", hideBelow: "sm" },
    // Mid-left
    { key: "ruler", top: "38%", left: "3%", size: 72, opacity: 0.05, delay: "9.2s", variant: "c", hideBelow: "md" },
    // Mid-right
    { key: "laptop", top: "36%", left: "92%", size: 88, opacity: 0.06, delay: "2.1s", variant: "a", hideBelow: "sm" },
    // Bottom-left cluster
    { key: "backpack", top: "72%", left: "3%", size: 100, opacity: 0.06, delay: "6.5s", variant: "a", hideBelow: "sm" },
    { key: "flask", top: "90%", left: "86%", size: 68, opacity: 0.05, delay: "8.0s", variant: "a", hideBelow: "md" },
    // Bottom-right cluster
    { key: "microscope", top: "60%", left: "94%", size: 82, opacity: 0.05, delay: "11.0s", variant: "c", hideBelow: "sm" },
    { key: "pencil", top: "56%", left: "5%", size: 64, opacity: 0.04, delay: "7.4s", variant: "b", hideBelow: "md" },
    { key: "compass", top: "74%", left: "96%", size: 70, opacity: 0.04, delay: "13.6s", variant: "b", hideBelow: "md" },
    { key: "notebook", top: "88%", left: "10%", size: 74, opacity: 0.06, delay: "3.4s", variant: "b", hideBelow: "md" },
];

// Inline outline SVGs. All use strokeWidth 1.5 and `currentColor` so
// the icons inherit the per-icon opacity from `--rx-icon-opacity`.
// Stroke is `none` on inner fills — these are wireframe silhouettes,
// not filled glyphs.
const AcademicIcon = ({ kind }: { kind: AcademicIconKey }) => {
    switch (kind) {
        case "calculator":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <rect x="7" y="6" width="10" height="3" rx="0.5" />
                    <line x1="8" y1="13" x2="8" y2="13" />
                    <line x1="12" y1="13" x2="12" y2="13" />
                    <line x1="16" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="8" y2="17" />
                    <line x1="12" y1="17" x2="12" y2="17" />
                    <line x1="16" y1="17" x2="16" y2="17" />
                    <circle cx="8" cy="13" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="13" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="16" cy="13" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="8" cy="17" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="16" cy="17" r="0.6" fill="currentColor" stroke="none" />
                </svg>
            );
        case "laptop":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="11" rx="1.5" />
                    <path d="M2 19h20" />
                    <path d="M9 19l1-2h4l1 2" />
                </svg>
            );
        case "notebook":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z" />
                    <path d="M4 16h14" />
                    <path d="M8 8h6" />
                    <path d="M8 11h4" />
                </svg>
            );
        case "ruler":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="8" width="20" height="8" rx="1" transform="rotate(-12 12 12)" />
                    <line x1="6" y1="9" x2="6" y2="11" transform="rotate(-12 6 10)" />
                    <line x1="10" y1="9" x2="10" y2="12" transform="rotate(-12 10 10.5)" />
                    <line x1="14" y1="9" x2="14" y2="11" transform="rotate(-12 14 10)" />
                    <line x1="18" y1="9" x2="18" y2="12" transform="rotate(-12 18 10.5)" />
                </svg>
            );
        case "backpack":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4" />
                    <rect x="4" y="8" width="16" height="13" rx="2" />
                    <path d="M9 13h6" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="12" r="0.8" fill="currentColor" stroke="none" />
                </svg>
            );
        case "graduation":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 9l10-4 10 4-10 4L2 9z" />
                    <path d="M6 11v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" />
                    <path d="M22 9v5" />
                </svg>
            );
        case "microscope":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 3h4l1 4h-6l1-4z" />
                    <path d="M11 7v6" />
                    <circle cx="11" cy="16" r="3" />
                    <path d="M8 21h10" />
                    <path d="M14 16h4" />
                </svg>
            );
        case "flask":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 3h6" />
                    <path d="M10 3v6L5 19a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-10V3" />
                    <path d="M7.5 14h9" />
                </svg>
            );
        case "pencil":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" />
                    <path d="M14 5l3 3" />
                    <path d="M4 20l4-1" />
                </svg>
            );
        case "compass":
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
                </svg>
            );
        default:
            return null;
    }
};

type IconBreakpoint = "sm" | "md" | "lg" | "xl";

const ICON_HIDE_CLASSES: Record<IconBreakpoint, string> = {
    sm: "",
    md: "hidden md:block",
    lg: "hidden lg:block",
    xl: "hidden xl:block",
};

const DUST: ReadonlyArray<{
    top: string;
    left: string;
    size: number;
    opacity: number;
    delay: string;
    variant: "a" | "b" | "c";
}> = [
    { top: "8%", left: "12%", size: 2.5, opacity: 0.7, delay: "0s", variant: "a" },
    { top: "14%", left: "62%", size: 1.5, opacity: 0.55, delay: "3.7s", variant: "b" },
    { top: "20%", left: "84%", size: 2, opacity: 0.65, delay: "1.4s", variant: "c" },
    { top: "28%", left: "6%", size: 3, opacity: 0.75, delay: "5.2s", variant: "a" },
    { top: "36%", left: "44%", size: 1.5, opacity: 0.5, delay: "2.1s", variant: "b" },
    { top: "44%", left: "78%", size: 2, opacity: 0.6, delay: "4.0s", variant: "c" },
    { top: "52%", left: "18%", size: 2.5, opacity: 0.7, delay: "1.0s", variant: "a" },
    { top: "58%", left: "56%", size: 1.5, opacity: 0.45, delay: "6.4s", variant: "b" },
    { top: "64%", left: "90%", size: 2, opacity: 0.65, delay: "2.8s", variant: "c" },
    { top: "72%", left: "30%", size: 2.5, opacity: 0.7, delay: "0.6s", variant: "a" },
    { top: "78%", left: "70%", size: 2, opacity: 0.6, delay: "3.3s", variant: "b" },
    { top: "84%", left: "12%", size: 1.5, opacity: 0.55, delay: "5.0s", variant: "c" },
    { top: "32%", left: "28%", size: 2, opacity: 0.5, delay: "1.7s", variant: "a" },
    { top: "68%", left: "48%", size: 2.5, opacity: 0.65, delay: "4.5s", variant: "b" },
    { top: "90%", left: "82%", size: 1.5, opacity: 0.45, delay: "2.4s", variant: "c" },
];

const variantClass: Record<"a" | "b" | "c", string> = {
    a: "animate-rx-dust-a",
    b: "animate-rx-dust-b",
    c: "animate-rx-dust-c",
};

const iconVariantClass: Record<"a" | "b" | "c", string> = {
    a: "animate-rx-icon-a",
    b: "animate-rx-icon-b",
    c: "animate-rx-icon-c",
};

export function Background() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
            {/* Layer 1 — radial-gradient wash (unchanged). */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 18% 20%, rgb(var(--color-primary) / 0.06) 0%, transparent 55%),
                        radial-gradient(circle at 82% 80%, rgb(var(--color-secondary) / 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgb(var(--color-success) / 0.025) 0%, transparent 60%)
                    `,
                }}
            />

            {/* Layer 2 — ambient dust dots. Each dot is a tiny
                GPU-composited element that animates via CSS only.
                A faint matching glow keeps each dot readable on the
                light cream surface; `--rx-dust-opacity` is the per-dot
                baseline the keyframes dip/twinkle around. */}
            <div className="absolute inset-0 z-[1]">
                {DUST.map((dot, i) => (
                    <span
                        key={i}
                        className={`absolute rounded-full bg-primary ${variantClass[dot.variant]}`}
                        style={{
                            top: dot.top,
                            left: dot.left,
                            width: `${dot.size}px`,
                            height: `${dot.size}px`,
                            // Per-dot baseline opacity exposed to keyframes.
                            ["--rx-dust-opacity" as string]: String(dot.opacity),
                            // Soft halo lets the dot read on cream surfaces
                            // without darkening the page.
                            boxShadow: `0 0 ${dot.size * 2.5}px rgb(var(--color-primary) / ${dot.opacity * 0.5})`,
                            animationDelay: dot.delay,
                        }}
                    />
                ))}
            </div>

            {/* Layer 3 — academic identity wallpaper. 10 outline icons
                positioned near the page edges and corners so they
                never sit on top of hero copy, feature cards, FAQ
                body, or the CTA. Each icon drifts on a 35–50s
                keyframe (`rxIconDriftA/B/C`) with a unique delay so
                no two icons are ever in phase. Opacity is set
                per-icon via `--rx-icon-opacity` so the 4–6% band is
                preserved end-to-end (the keyframe itself dips only
                ~0.75 of that baseline for a faint breathing effect).
                No rotation, no scaling, no mouse interaction — pure
                ambient. On small viewports the densest pair hide
                themselves so the silhouette set never crowds the
                page. */}
            <div className="absolute inset-0 z-[2]">
                {ACADEMIC_ICONS.map((icon) => (
                    <span
                        key={icon.key}
                        className={`pointer-events-none absolute text-textSecondary ${iconVariantClass[icon.variant]} ${ICON_HIDE_CLASSES[icon.hideBelow]}`}
                        style={{
                            top: icon.top,
                            left: icon.left,
                            width: `${icon.size}px`,
                            height: `${icon.size}px`,
                            // Per-icon baseline opacity exposed to keyframes.
                            ["--rx-icon-opacity" as string]: String(icon.opacity),
                            animationDelay: icon.delay,
                        }}
                    >
                        <AcademicIcon kind={icon.key} />
                    </span>
                ))}
            </div>

            {/* Layer 4 — soft ambient corner glows. Pure CSS, blurred
                radial gradients sitting at opposite edges. They add
                depth without introducing recognisable shapes or
                animation. Layered on top of the wash but below the
                dust so the dust still reads on top. */}
            <div
                className="absolute inset-0 z-[3]"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 0% 100%, rgb(var(--color-primary) / 0.05) 0%, transparent 35%),
                        radial-gradient(circle at 100% 0%, rgb(var(--color-secondary) / 0.04) 0%, transparent 35%)
                    `,
                    filter: "blur(40px)",
                }}
            />
        </div>
    );
}

export default Background;
