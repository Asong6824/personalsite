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
        <div className="rounded-xl border border-[#D8D0C3] bg-[#F5F3EE] p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-sm">
                        <span className="text-[#68645d]">Step {step.step}</span>
                        <span className="text-[#a18072]">·</span>
                        <span className="font-medium text-[#a18072]">{step.label}</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug text-[#141413] md:text-xl">
                        {step.title}
                    </h3>
                </div>
                {hasCode && (
                    <button
                        onClick={onToggle}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "收起代码" : "展开代码"}
                        className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#D8D0C3] bg-white text-[#141413] transition-colors hover:border-[#a18072] hover:text-[#a18072]",
                            isOpen && "border-[#a18072] text-[#a18072]"
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
                    <div className="mt-5 border-t border-[#D8D0C3] pt-4">
                        {step.code?.request && step.code?.response ? (
                            <div className="mb-3 flex gap-6 border-b border-[#D8D0C3]">
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
                            <pre className="overflow-x-auto rounded-lg bg-[#E2DBCE]/60 p-4 font-mono text-sm text-[#141413]">
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
                active ? "text-[#a18072]" : "text-[#68645d] hover:text-[#141413]"
            )}
        >
            {children}
            {active && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#a18072]" />}
        </button>
    );
}
