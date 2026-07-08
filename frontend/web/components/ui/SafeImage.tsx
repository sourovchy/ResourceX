"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { getFileUrl } from "@/lib/api";

const PLACEHOLDER = "/img-placeholder.svg";

type SafeImageProps = Omit<ImageProps, "src" | "onError"> & {
	src?: ImageProps["src"] | null;
	fallbackSrc?: string;
};

/**
 * Wraps next/image with automatic fallback to a local placeholder
 * when the src URL is missing, external/unconfigured, or returns an error.
 */
export default function SafeImage({
	src,
	fallbackSrc = PLACEHOLDER,
	alt,
	...props
}: SafeImageProps) {
	const resolved = (typeof src === "string" && src.trim() !== "") ? getFileUrl(src) : (src || fallbackSrc);
	const [imgSrc, setImgSrc] = useState<ImageProps["src"]>(resolved);

	return (
		<Image
			{...props}
			src={imgSrc}
			alt={alt}
			onError={() => setImgSrc(fallbackSrc)}
		/>
	);
}
