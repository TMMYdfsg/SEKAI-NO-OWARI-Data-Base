"use client";

import { useState, useCallback } from "react";

interface UseOneTapDeleteOptions {
    onDelete: () => void | Promise<void>; // The actual delete action
    itemName?: string; // For toast message
}

export function useOneTapDelete({ onDelete, itemName = "項目" }: UseOneTapDeleteOptions) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const handleDelete = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDeleting) return;

        setIsDeleting(true);

        try {
            // Optimistic UI update or simple wait?
            // Requirement: "Immediate deletion... No confirmation dialog"
            // We perform the action immediately.

            await onDelete();
            setIsDeleted(true);

            // Show Toast (Undo) - Mock implementation for now
            // Ideally we would integrate with a Toast system that supports Action (Undo).
            // For now, we just assume it's gone.

            // To prevent double submission/spam
            // setIsDeleting remains true or we reset? 
            // If component unmounts (because deleted), it's fine.

        } catch (error) {
            console.error("Delete failed", error);
            setIsDeleting(false);
            alert("削除に失敗しました");
        }
    }, [onDelete, isDeleting]);

    return {
        handleDelete,
        isDeleting,
        isDeleted
    };
}
