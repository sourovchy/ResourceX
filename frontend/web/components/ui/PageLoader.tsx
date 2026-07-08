import React from "react";
import { LogoIcon } from "./Logo";
import Background from "./Background";

const styles = `
	@keyframes loader-spin-slow {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	@keyframes loader-spin-reverse {
		0% { transform: rotate(360deg); }
		100% { transform: rotate(0deg); }
	}
	@keyframes loader-orbit-1 {
		0% { transform: rotate(0deg) translateX(36px) rotate(0deg); }
		100% { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
	}
	@keyframes loader-orbit-2 {
		0% { transform: rotate(180deg) translateX(36px) rotate(-180deg); }
		100% { transform: rotate(540deg) translateX(36px) rotate(-540deg); }
	}
	@keyframes loader-glow-pulse {
		0%, 100% { opacity: 0.25; transform: scale(0.9); }
		50% { opacity: 0.6; transform: scale(1.1); }
	}
	@keyframes loader-logo-float {
		0%, 100% { transform: translateY(0) scale(1); }
		50% { transform: translateY(-3px) scale(1.05); }
	}
	@keyframes loader-text-shimmer {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}
	.animate-spin-slow {
		animation: loader-spin-slow 6s linear infinite;
	}
	.animate-spin-reverse {
		animation: loader-spin-reverse 3s linear infinite;
	}
	.animate-orbit-1 {
		animation: loader-orbit-1 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}
	.animate-orbit-2 {
		animation: loader-orbit-2 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}
	.animate-glow-pulse {
		animation: loader-glow-pulse 2s ease-in-out infinite;
	}
	.animate-logo-float {
		animation: loader-logo-float 2s ease-in-out infinite;
	}
	.animate-text-shimmer {
		background-size: 200% auto;
		animation: loader-text-shimmer 3s linear infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-spin-slow,
		.animate-spin-reverse,
		.animate-orbit-1,
		.animate-orbit-2,
		.animate-glow-pulse,
		.animate-logo-float {
			animation: none !important;
			transform: none !important;
		}
		.animate-glow-pulse {
			opacity: 0.4 !important;
		}
	}
`;

export function PageLoader({
	message = "Loading...",
	fullScreen = false,
}: {
	message?: string;
	fullScreen?: boolean;
}) {
	const loaderContent = (
		<div className="relative flex flex-col items-center gap-6 rounded-3xl border border-borderLight/60 bg-card/65 p-8 sm:p-12 shadow-xl backdrop-blur-md max-w-sm w-full overflow-hidden">
			{/* Background Glow */}
			<div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
			<div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

			{/* Branded loading animation */}
			<div className="relative h-24 w-24 flex items-center justify-center">
				{/* Glowing center aura */}
				<div className="absolute h-14 w-14 rounded-full bg-primary/15 blur-xl animate-glow-pulse pointer-events-none" />

				{/* Outer dashed track ring */}
				<div className="absolute h-20 w-20 rounded-full border border-dashed border-primary/25 animate-spin-slow" />

				{/* Middle active progress ring (spinning reverse) */}
				<div className="absolute h-16 w-16 rounded-full border-2 border-transparent border-t-primary border-b-primary/30 animate-spin-reverse" />

				{/* Orbiting particle 1 */}
				<div className="absolute h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgb(var(--color-primary)/0.6)] animate-orbit-1" />

				{/* Orbiting particle 2 */}
				<div className="absolute h-1.5 w-1.5 rounded-full bg-primaryMuted/60 animate-orbit-2" />

				{/* Pulsing/floating brand logo in the center */}
				<div className="absolute animate-logo-float z-10 flex items-center justify-center bg-card rounded-full p-2 border border-borderLight shadow-sm">
					<LogoIcon size={32} />
				</div>
			</div>

			{/* Loading Message */}
			<div className="flex flex-col gap-1.5 relative z-10">
				<span className="bg-gradient-to-r from-textPrimary via-primary to-textPrimary bg-clip-text text-transparent text-sm font-extrabold sm:text-base tracking-wider leading-relaxed break-words animate-text-shimmer">
					{message}
				</span>
				<span className="text-[10px] font-bold font-mono tracking-widest text-textTertiary uppercase">
					Please wait
				</span>
			</div>
		</div>
	);

	if (fullScreen) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4">
				<Background />
				<style dangerouslySetInnerHTML={{ __html: styles }} />
				{loaderContent}
			</div>
		);
	}

	return (
		<div className="flex min-h-[70dvh] w-full items-center justify-center px-4 py-12 text-center">
			<style dangerouslySetInnerHTML={{ __html: styles }} />
			{loaderContent}
		</div>
	);
}
