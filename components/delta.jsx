"use client";;
import { cn } from "@/lib/utils";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { MinusIcon, TrendingUpIcon, ArrowUpIcon, ChevronUpIcon, TrendingDownIcon, ArrowDownIcon, ChevronDownIcon } from "lucide-react";

const DeltaContext = React.createContext(null);

function useDeltaValue() {
	const context = React.useContext(DeltaContext);

	if (!context) {
		throw new Error("DeltaIcon and DeltaValue must be used inside a `Delta` component.");
	}

	return context.value;
}

function Delta({
    className,
    value,
    variant = "default",
    ...props
}) {
	return (
        <DeltaContext.Provider value={{ value }}>
            {variant === "badge" ? (
				<Badge
                    className={cn(
                        "gap-1 border-none tabular-nums [&_svg]:size-4 [&_svg]:shrink-0",
                        value > 0
							? "bg-[color-mix(in_oklch,var(--color-secondary),transparent_90%)] text-[color:var(--color-secondary-dark)]"
							: "bg-[color-mix(in_oklch,var(--color-error),transparent_90%)] text-[color:var(--color-error)]",
                        className
                    )}
                    data-slot="delta"
                    variant="secondary"
                    {...(props)} />
			) : (
				<div
                    className={cn(
                        "inline-flex items-center gap-1 text-muted-foreground tabular-nums",
                        "[&_svg]:size-3 [&_svg]:shrink-0",
                        value > 0 ? "text-[color:var(--color-secondary-dark)]" : "",
                        value < 0 ? "text-[color:var(--color-error)]" : "",
                        className
                    )}
                    data-slot="delta"
                    {...props} />
			)}
        </DeltaContext.Provider>
    );
}

function FilledShell({
    value,
    children
}) {
	return (
        <span
            className={cn(
                "inline-flex size-3 shrink-0 items-center justify-center rounded-full",
                "[&_svg]:size-2! [&_svg]:shrink-0 [&_svg]:stroke-3! [&_svg]:text-background",
                value > 0 && "bg-[color:var(--color-secondary)]",
                value < 0 && "bg-[color:var(--color-error)]",
                (!value || value === 0) && "bg-muted-foreground"
            )}
            data-slot="delta-icon">
            {children}
        </span>
    );
}

function DeltaIcon({
    variant = "default",
    filled = false,
    className,
    ...props
}) {
	const resolvedValue = useDeltaValue();

	const mergedClassName = cn(className);

	const shell = (node) =>
		filled ? <FilledShell value={resolvedValue}>{node}</FilledShell> : node;

	const slotProps = filled ? {} : { "data-slot": "delta-icon" };

	if (!resolvedValue || resolvedValue === 0) {
		return shell(<MinusIcon {...slotProps} className={mergedClassName} {...props} />);
	}

	if (resolvedValue > 0) {
		if (variant === "trend") {
			return shell(<TrendingUpIcon {...slotProps} className={mergedClassName} {...props} />);
		}

		if (variant === "arrow") {
			return shell(<ArrowUpIcon {...slotProps} className={mergedClassName} {...props} />);
		}

		return shell(<ChevronUpIcon {...slotProps} className={mergedClassName} {...props} />);
	}

	if (variant === "trend") {
		return shell(<TrendingDownIcon {...slotProps} className={mergedClassName} {...props} />);
	}

	if (variant === "arrow") {
		return shell(<ArrowDownIcon {...slotProps} className={mergedClassName} {...props} />);
	}

	return shell(<ChevronDownIcon {...slotProps} className={mergedClassName} {...props} />);
}

function DeltaValue({
    className,
    precision = 1,
    suffix = "%",
    absolute = true,
    ...props
}) {
	const resolvedValue = useDeltaValue();

	const formattedValue = (
		absolute ? Math.abs(resolvedValue) : resolvedValue
	).toFixed(precision);

	return (
        <span
            className={cn("tabular-nums", className)}
            data-slot="delta-value"
            {...props}>
            {formattedValue}
            {suffix}
        </span>
    );
}
export { Delta, DeltaIcon, DeltaValue };
