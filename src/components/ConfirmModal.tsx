"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "warning" | "default";
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "確認",
    cancelText = "キャンセル",
    onConfirm,
    onCancel,
    variant = "default",
}: ConfirmModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const variantStyles = {
        danger: {
            icon: "text-red-500",
            button: "bg-red-500 hover:bg-red-600 text-white",
            border: "border-red-500/30",
        },
        warning: {
            icon: "text-yellow-500",
            button: "bg-yellow-500 hover:bg-yellow-600 text-black",
            border: "border-yellow-500/30",
        },
        default: {
            icon: "text-primary",
            button: "bg-primary hover:bg-primary/80 text-white",
            border: "border-primary/30",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div
                className={`relative bg-neutral-900 border ${styles.border} rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-neutral-800 ${styles.icon}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for easier usage
export function useConfirmModal() {
    const [state, setState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "danger" | "warning" | "default";
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        message: "",
        variant: "default",
        onConfirm: () => { },
    });

    const confirm = (options: {
        title: string;
        message: string;
        variant?: "danger" | "warning" | "default";
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                title: options.title,
                message: options.message,
                variant: options.variant || "default",
                onConfirm: () => {
                    resolve(true);
                    setState((prev) => ({ ...prev, isOpen: false }));
                },
            });
        });
    };

    const handleCancel = () => {
        setState((prev) => ({ ...prev, isOpen: false }));
    };

    const ModalComponent = () => (
        <ConfirmModal
            isOpen={state.isOpen}
            title={state.title}
            message={state.message}
            variant={state.variant}
            onConfirm={state.onConfirm}
            onCancel={handleCancel}
            confirmText="削除"
            cancelText="キャンセル"
        />
    );

    return { confirm, ModalComponent, handleCancel };
}
