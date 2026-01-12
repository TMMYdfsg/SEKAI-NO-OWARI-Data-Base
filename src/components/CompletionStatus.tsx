"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CompletionStatusProps {
    isComplete: boolean;
    missingFields?: string[];
}

export default function CompletionStatus({ isComplete, missingFields = [] }: CompletionStatusProps) {
    if (isComplete) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                <CheckCircle2 size={16} />
                <span>すべての必須情報が入力されています</span>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2 text-amber-400 mb-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium text-sm">未入力の項目があります</p>
                    {missingFields.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                            {missingFields.map((field) => (
                                <li key={field} className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                                    {field}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
