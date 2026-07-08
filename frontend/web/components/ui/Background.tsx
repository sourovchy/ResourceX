"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the WebGL Canvas background with SSR disabled to prevent Node.js window errors during server rendering.
const BackgroundClient = dynamic(() => import("./BackgroundClient"), {
  ssr: false,
  loading: () => <div className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-transparent" />
});

export function Background() {
  return <BackgroundClient />;
}

export default Background;
