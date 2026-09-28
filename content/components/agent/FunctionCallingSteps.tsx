"use client";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCode {
    request?: string;
    response?: string;
}

interface FunctionCallingStep {
    step: number;
    label: string;
    title: string;
    code?: StepCode;
    defaultOpen?: boolean;
}

interface FunctionCallingStepsProps {
    steps: FunctionCallingStep[];
}

export function FunctionCallingSteps({ steps }: FunctionCallingStepsProps) {
    const [openSteps, setOpenSteps] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        steps.forEach((s) => {
            if (s.defaultOpen) initial[s.step] = true;
        });
        return initial;
    });

    const toggleStep = (step: number) => {
        setOpenSteps((prev) => ({ ...prev, [step]: !prev[step] }));
    };

    return (
        <div className="not-prose my-8 space-y-4">
            {steps.map((s) => (
                <StepCard
                    key={s.step}
                    step={s}
                    isOpen={!!openSteps[s.step]}
                    onToggle={() => toggleStep(s.step)}
                />
            ))}
        </div>
    );
}

function StepCard({
    step,
    isOpen,
    onToggle,
}: {
    step: FunctionCallingStep;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const [activeTab, setActiveTab] = useState<"request" | "response">("request");
    const hasCode = step.code && (step.code.request || step.code.response);
    const activeCode = activeTab === "request" ? step.code?.request : step.code?.response;

    return (
        <div className="rounded-xl border border-site-stone-300 bg-site-stone-50 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-sm">
                        <span className="text-site-stone-600">Step {step.step}</span>
                        <span className="text-site-stone-500">·</span>
                        <span className="font-medium text-site-stone-500">{step.label}</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug text-site-ink md:text-xl">
                        {step.title}
                    </h3>
                </div>
                {hasCode && (
                    <button
                        onClick={onToggle}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "收起代码" : "展开代码"}
                        className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-site-stone-300 bg-site-neutral-50 text-site-ink transition-colors hover:border-site-stone-500 hover:text-site-stone-500",
                            isOpen && "border-site-stone-500 text-site-stone-500"
                        )}
                    >
                        <Code2 size={18} strokeWidth={1.8} />
                    </button>
                )}
            </div>

            <div
                className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="mt-5 border-t border-site-stone-300 pt-4">
                        {step.code?.request && step.code?.response ? (
                            <div className="mb-3 flex gap-6 border-b border-site-stone-300">
                                <TabButton
                                    active={activeTab === "request"}
                                    onClick={() => setActiveTab("request")}
                                >
                                    Request
                                </TabButton>
                                <TabButton
                                    active={activeTab === "response"}
                                    onClick={() => setActiveTab("response")}
                                >
                                    Response
                                </TabButton>
                            </div>
                        ) : null}
                        {activeCode ? (
                            <pre className="overflow-x-auto rounded-lg bg-site-stone-200/60 p-4 font-mono text-sm text-site-ink">
                                <code>{activeCode}</code>
                            </pre>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative pb-2 text-sm font-medium transition-colors",
                active ? "text-site-stone-500" : "text-site-stone-600 hover:text-site-ink"
            )}
        >
            {children}
            {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-site-stone-500" />}
        </button>
    );
}
