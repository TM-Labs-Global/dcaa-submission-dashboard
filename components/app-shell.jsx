import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({
    sidebar,
    children
}) {
	return (
        <SidebarProvider>
            {sidebar}
            <SidebarInset className="p-4 md:p-6">
				<div className="flex flex-1 flex-col gap-4">{children}</div>
			</SidebarInset>
        </SidebarProvider>
    );
}
