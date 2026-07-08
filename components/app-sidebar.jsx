"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutGridIcon, ShieldIcon } from "lucide-react";
import { LogoIcon } from "@/components/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FORMS } from "@/config/sites";

// Sidebar-only label override: shortens this form's display name in the
// nav; the detail view, breadcrumb, and export filename still use the full
// "Creator Report Downloads" from config/sites.js.
const sidebarLabelOverrides = {
	"website-a-form-1": "Creator Report",
};

// Per-website sidebar icon, keyed by websiteName. Each icon keeps its own
// real aspect ratio (forcing a square size on a non-square source distorts
// it and triggers Next.js's Image aspect-ratio warning).
const websiteIcons = {
	"Nigeria Creator Report": { src: "/pictures/Favicon@4x.png", width: 13, height: 16 },
	"Africa Creator Report": { src: "/pictures/africa-creator-report-Icon.svg", width: 14, height: 17 },
};

const websiteGroups = FORMS.reduce((groups, form) => {
	const group = groups.find((g) => g.websiteName === form.websiteName);
	if (group) {
		group.forms.push(form);
	} else {
		groups.push({ websiteName: form.websiteName, forms: [form] });
	}
	return groups;
}, []);

// selectedForm/onSelectForm are optional — on /admin/users there's no
// dashboard form-selection state, so this sidebar is used purely for
// navigation there (isAdminPage highlights "Manage users" instead).
export function AppSidebar({ selectedForm = null, onSelectForm, isAdminPage = false }) {
	const router = useRouter();
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";

	function goToDashboard(formId) {
		if (onSelectForm) {
			onSelectForm(formId);
		} else {
			router.push("/dashboard");
		}
	}

	return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton
                    className="cursor-default text-sidebar-foreground hover:bg-transparent active:bg-transparent"
                    onClick={() => goToDashboard(null)}>
					<LogoIcon className="text-sidebar-foreground" />
					<span className="font-heading font-semibold">Creator Reports</span>
				</SidebarMenuButton>
			</SidebarHeader>
            <SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
                                    isActive={!isAdminPage && selectedForm === null}
                                    onClick={() => goToDashboard(null)}
                                    tooltip="Overview">
									<LayoutGridIcon />
									<span>Overview</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{websiteGroups.map((group) => {
					const icon = websiteIcons[group.websiteName];
					return (
						<SidebarGroup key={group.websiteName}>
							<SidebarGroupLabel>{group.websiteName}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{group.forms.map((form) => (
										<SidebarMenuItem key={form.id}>
											<SidebarMenuButton
                                                isActive={!isAdminPage && selectedForm === form.id}
                                                onClick={() => goToDashboard(form.id)}
                                                tooltip={form.formName}>
												{icon && (
													<Image
                                                        src={icon.src}
                                                        alt=""
                                                        width={icon.width}
                                                        height={icon.height}
                                                        className="shrink-0" />
												)}
												<span>{sidebarLabelOverrides[form.id] ?? form.formName}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					);
				})}

				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel>ADMIN</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
                                        isActive={isAdminPage}
                                        onClick={() => router.push("/admin/users")}
                                        tooltip="Manage users">
										<ShieldIcon />
										<span>Manage users</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
        </Sidebar>
    );
}
