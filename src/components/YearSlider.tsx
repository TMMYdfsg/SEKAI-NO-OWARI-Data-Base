"use client";

import { useState, useCallback, useRef } from "react";

interface YearSliderProps {
    minYear: number;
    maxYear: number;
    currentYear?: number;
    yearsWithData: number[];
    onYearSelect: (year: number) => void;
    step?: 1 | 5 | 10;
    bookmarkYears?: number[];
}

export default function YearSlider({
    minYear,
    maxYear,
    currentYear,
    yearsWithData,
    onYearSelect,
    step = 1,
    bookmarkYears = [],
}: YearSliderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewYear, setPreviewYear] = useState<number | null>(null);
    const [displayStep, setDisplayStep] = useState<1 | 5 | 10>(step);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Calculate year from position
    const getYearFromPosition = useCallback((clientX: number): number => {
        if (!sliderRef.current) return minYear;
        const rect = sliderRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawYear = minYear + percent * (maxYear - minYear);
        const snappedYear = Math.round(rawYear / displayStep) * displayStep;
        return Math.max(minYear, Math.min(maxYear, snappedYear));
    }, [minYear, maxYear, displayStep]);

    // Find nearest year with data
    const findNearestYearWithData = useCallback((year: number): number | null => {
        if (yearsWithData.length === 0) return null;
        if (yearsWithData.includes(year)) return year;
        let nearest = yearsWithData[0];
        let minDiff = Math.abs(year - nearest);
        for (const y of yearsWithData) {
            const diff = Math.abs(year - y);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = y;
            }
        }
        return nearest;
    }, [yearsWithData]);

    // Get position percent for a year
    const getPositionForYear = useCallback((year: number): number => {
        return ((year - minYear) / (maxYear - minYear)) * 100;
    }, [minYear, maxYear]);

    // Handle events
    const handleStart = useCallback((clientX: number) => {
        setIsDragging(true);
        setPreviewYear(getYearFromPosition(clientX));
    }, [getYearFromPosition]);

    const handleMove = useCallback((clientX: number) => {
        if (!isDragging) return;
        setPreviewYear(getYearFromPosition(clientX));
    }, [isDragging, getYearFromPosition]);

    const handleEnd = useCallback(() => {
        if (previewYear !== null) {
            const nearestWithData = findNearestYearWithData(previewYear);
            if (nearestWithData !== null) {
                onYearSelect(nearestWithData);
            }
        }
        setIsDragging(false);
        setPreviewYear(null);
    }, [previewYear, findNearestYearWithData, onYearSelect]);

    const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
    const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
    const handleMouseUp = () => handleEnd();
    const handleMouseLeave = () => { if (isDragging) handleEnd(); };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        handleStart(e.touches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => handleEnd();

    const handleClick = (e: React.MouseEvent) => {
        if (!isDragging) {
            const year = getYearFromPosition(e.clientX);
            const nearestWithData = findNearestYearWithData(year);
            if (nearestWithData !== null) {
                onYearSelect(nearestWithData);
            }
        }
    };

    const stepOptions: { value: 1 | 5 | 10; label: string }[] = [
        { value: 1, label: "1年" },
        { value: 5, label: "5年" },
        { value: 10, label: "10年" },
    ];

    const displayYear = previewYear ?? currentYear ?? minYear;
    const hasDataAtPreview = previewYear !== null && !yearsWithData.includes(previewYear);
    const nearestYear = previewYear !== null ? findNearestYearWithData(previewYear) : null;

    return (
        <div className="w-full bg-card/80 backdrop-blur-md rounded-lg border border-white/10 p-4 mb-4">
            {/* Header with year display and step selector */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary tabular-nums">
                        {displayYear}年
                    </span>
                    {isDragging && hasDataAtPreview && nearestYear && (
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                            → {nearestYear}年へ移動
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-1">刻み:</span>
                    {stepOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setDisplayStep(opt.value)}
                            className={`px-2 py-0.5 text-xs rounded transition-colors ${displayStep === opt.value
                                    ? "bg-primary/20 text-primary"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main slider track */}
            <div
                ref={sliderRef}
                className="relative h-6 cursor-pointer touch-none select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
            >
                {/* Background track */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/10 rounded-full" />

                {/* Year markers (data exists) */}
                {yearsWithData.map((year) => (
                    <div
                        key={year}
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-primary/40 rounded-full"
                        style={{ left: `${getPositionForYear(year)}%`, marginLeft: "-2px" }}
                    />
                ))}

                {/* Handle */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-transform ${isDragging
                            ? "bg-primary border-primary scale-125 shadow-lg shadow-primary/50"
                            : "bg-card border-primary/50 hover:scale-110"
                        }`}
                    style={{ left: `${getPositionForYear(displayYear)}%`, marginLeft: "-10px" }}
                />
            </div>

            {/* Year range labels */}
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>{minYear}</span>
                <span>{maxYear}</span>
            </div>

            {/* Bookmark buttons */}
            {bookmarkYears.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-muted-foreground mr-1">ブックマーク:</span>
                    {bookmarkYears.map((year) => (
                        <button
                            key={`bm-${year}`}
                            onClick={() => onYearSelect(year)}
                            className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 hover:bg-amber-500/40 transition-colors"
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
