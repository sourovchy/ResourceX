"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, FileCheck2 } from "lucide-react";
import {
	ApprovalRequest,
	formatSubmittedAt,
	getCurrentApprovalRequest,
} from "@/lib/approvalRequests";

export default function PendingApprovalPage() {
	const [request, setRequest] = useState<ApprovalRequest | null>(null);

	useEffect(() => {
		setRequest(getCurrentApprovalRequest());
	}, []);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-warning opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-2xl">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl text-center">
					{/* Icon */}
					<div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-warningLight border border-warning/30">
						<Clock className="w-7 h-7 text-warning" />
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-textPrimary">
						Account Pending Approval
					</h1>

					{/* Description */}
					<p className="text-textSecondary mt-3 leading-relaxed">
						Your account has been created successfully, but it is currently
						under review.
						<br />
						Please wait until an admin approves your request.
					</p>

					{/* Info box */}
					<div className="mt-6 bg-surfaceVariant border border-border rounded-lg p-4 text-sm text-textSecondary shadow-lg">
						This usually takes a few hours. You will be notified once your
						account is approved.
					</div>

					{request && (
						<div className="mt-6 text-left bg-surfaceVariant/50 border border-borderLight rounded-2xl p-4">
							<div className="flex items-center gap-2 text-sm font-bold text-textPrimary mb-4">
								<FileCheck2 className="w-4 h-4 text-primary" />
								Submitted verification details
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-xs text-textTertiary">Name</div>
									<div className="font-medium text-textPrimary">
										{request.name}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">Student ID</div>
									<div className="font-medium text-textPrimary">
										{request.studentId}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">Email</div>
									<div className="font-medium text-textPrimary break-all">
										{request.email}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">Phone</div>
									<div className="font-medium text-textPrimary">
										{request.phone}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">University</div>
									<div className="font-medium text-textPrimary">
										{request.university}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">Department</div>
									<div className="font-medium text-textPrimary">
										{request.department}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">Submitted</div>
									<div className="font-medium text-textPrimary">
										{formatSubmittedAt(request.submittedAt)}
									</div>
								</div>
								<div>
									<div className="text-xs text-textTertiary">Document</div>
									<div className="font-medium text-textPrimary truncate">
										{request.idCardFileName}
									</div>
								</div>
							</div>

							<img
								src={request.idCardDataUrl}
								alt="Submitted student ID card"
								className="mt-4 max-h-72 w-full rounded-xl border border-borderLight object-contain bg-surface"
							/>
						</div>
					)}

					{/* Action */}
					<div className="mt-8">
						<Link
							href="/auth/login"
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-onPrimary font-medium hover:bg-primaryDark transition shadow-md">
							<ArrowLeft className="w-4 h-4" />
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
