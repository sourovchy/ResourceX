import React from "react";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** @deprecated Tilt was replaced by a CSS hover-lift. Accepted for API compatibility but ignored. */
    maxTilt?: number;
    /** @deprecated No longer used; the lift is a fixed, GPU-composited translate. */
    hoverScale?: number;
    /** @deprecated The glare overlay was removed with the tilt effect. */
    glare?: boolean;
    /** @deprecated The cursor-reactive depth shadow was replaced by a static hover shadow. */
    depth?: boolean;
}

/**
 * A subtle, accessible hover-lift card.
 *
 * Previously this rendered a JS-driven 3D tilt that called `setState` on every
 * `mousemove` — with this component mounted ~150 times across the app, that was
 * a significant re-render / INP cost, and the moving transform shifted click
 * targets (buttons inside the card) under the cursor.
 *
 * It is now a pure-CSS hover-lift: a small upward translate + soft brand shadow,
 * fully GPU-composited (no React re-renders, no layout work) and disabled under
 * `prefers-reduced-motion`. The original tilt props are accepted but ignored so
 * existing call sites keep working without edits.
 */
export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
    (
        {
            // Tilt-era props are intentionally destructured out so they are not
            // spread onto the DOM node (which would warn about unknown attrs).
            maxTilt: _maxTilt,
            hoverScale: _hoverScale,
            glare: _glare,
            depth: _depth,
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`rx-lift transform-gpu transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none hover:-translate-y-1 ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

TiltCard.displayName = "TiltCard";

export default TiltCard;
