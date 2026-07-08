"use client";

import React, { useRef, useState, MouseEvent } from "react";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Maximum tilt angle in degrees. Defaults to 6. */
    maxTilt?: number;
    /** Scale factor on hover. Defaults to 1.02. */
    hoverScale?: number;
    /** Enables glare reflection overlay. Defaults to true. */
    glare?: boolean;
    /** Enables the tilt-reactive depth shadow (the card "lifts" toward the cursor). Defaults to true. */
    depth?: boolean;
}

export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
    (
        {
            maxTilt = 6,
            hoverScale = 1.02,
            glare = true,
            depth = true,
            className = "",
            children,
            style,
            ...props
        },
        ref
    ) => {
        const localRef = useRef<HTMLDivElement>(null);
        const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
        const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
            opacity: 0,
        });

        // Combined ref utility
        const setRefs = (node: HTMLDivElement | null) => {
            (localRef as any).current = node;
            if (ref) {
                if (typeof ref === "function") {
                    ref(node);
                } else {
                    (ref as any).current = node;
                }
            }
        };

        const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
            const card = localRef.current;
            if (!card) return;

            // Check if user prefers reduced motion or device doesn't support hover (mobile)
            const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const supportsHover = window.matchMedia("(hover: hover)").matches;
            if (prefersReduced || !supportsHover) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // cursor x relative to card
            const y = e.clientY - rect.top;  // cursor y relative to card

            const xc = rect.width / 2;
            const yc = rect.height / 2;

            // Calculate rotation angles (-maxTilt to +maxTilt)
            const angleX = -((y - yc) / yc) * maxTilt;
            const angleY = ((x - xc) / xc) * maxTilt;

            // Depth shadow lifts the card toward the cursor: offset opposite the tilt,
            // tinted with the forest-green brand for a cohesive, premium feel.
            const nextStyle: React.CSSProperties = {
                transform: `perspective(900px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`,
                transition: "none",
            };
            if (depth) {
                const ox = (-angleY / maxTilt) * 18;
                const oy = (angleX / maxTilt) * 18 + 10;
                nextStyle.boxShadow = `${ox.toFixed(1)}px ${oy.toFixed(1)}px 34px -12px rgba(31, 71, 54, 0.28), 0 6px 14px -8px rgba(17, 24, 39, 0.18)`;
            }
            setTiltStyle(nextStyle);

            if (glare) {
                const px = (x / rect.width) * 100;
                const py = (y / rect.height) * 100;

                setGlareStyle({
                    opacity: 1,
                    background: `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 60%)`,
                });
            }
        };

        const handleMouseLeave = () => {
            setTiltStyle({
                transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
                transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                boxShadow: undefined,
            });

            if (glare) {
                setGlareStyle({
                    opacity: 0,
                    transition: "opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
                });
            }
        };

        return (
            <div
                ref={setRefs}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: "preserve-3d", ...style, ...tiltStyle }}
                className={`relative transform-gpu will-change-transform ${className}`}
                {...props}
            >
                {children}
                {glare && (
                    <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 rounded-[inherit] overflow-hidden z-[5]"
                        style={glareStyle}
                    />
                )}
            </div>
        );
    }
);

TiltCard.displayName = "TiltCard";

export default TiltCard;
