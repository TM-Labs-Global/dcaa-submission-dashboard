"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { NavUser } from "@/components/nav-user";
import { DateRangeFilter } from "@/components/DateRangeFilter";

export function AppHeader({
	pageTitle,
	activePreset,
	onPresetSelect,
	dateFrom,
	dateTo,
	onCustomRange,
	showDateFilter = true,
	hideDateFilterOnMobile = false,
	mobileActions,
}) {
	return (
        <header
            className={cn("mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:px-2")}>
            <div className="flex items-center justify-between gap-3 md:justify-start">
				<div className="flex items-center gap-3">
					<CustomSidebarTrigger />
					<Separator
                        className="mr-2 h-4 data-[orientation=vertical]:self-center"
                        orientation="vertical" />
					<AppBreadcrumbs page={{ title: pageTitle }} />
				</div>
				<div className="flex items-center gap-2 md:hidden">
					{mobileActions}
					<Separator
                        className="h-4 data-[orientation=vertical]:self-center"
                        orientation="vertical" />
					<NavUser />
				</div>
			</div>
            <div className="flex flex-wrap items-center gap-2">
				{showDateFilter && (
					<div className={cn(hideDateFilterOnMobile && "hidden md:block")}>
						<DateRangeFilter
                            activePreset={activePreset}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onCustomRange={onCustomRange}
                            onPresetSelect={onPresetSelect} />
					</div>
				)}
				<Separator
                    className="hidden h-4 data-[orientation=vertical]:self-center md:block"
                    orientation="vertical" />
				<div className="hidden md:block">
					<NavUser />
				</div>
			</div>
        </header>
    );
}
