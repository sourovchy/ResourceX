"use client";

import React from "react";
import { PageLoader } from "@/components/ui/PageLoader";

export default function Loading() {
	return <PageLoader message="Loading authentication portal..." fullScreen />;
}
