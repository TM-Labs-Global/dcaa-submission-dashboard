"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldIcon, LayoutGridIcon, X } from "lucide-react";
import { 
  PenNib, 
  Megaphone, 
  VideoCamera, 
  Scissors, 
  Robot, 
  MaskHappy 
} from "@phosphor-icons/react";
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
    useSidebar,
} from "@/components/ui/sidebar";

const STREAMS = [
  { id: "Stream 1 (Scriptwriting)", name: "Stream 1 (Scriptwriting)", icon: PenNib },
  { id: "Stream 2 (Directing)", name: "Stream 2 (Directing)", icon: Megaphone },
  { id: "Stream 3 (Production)", name: "Stream 3 (Production)", icon: VideoCamera },
  { id: "Stream 4 (Editing)", name: "Stream 4 (Editing)", icon: Scissors },
  { id: "Stream 5 (AI Filmmaking)", name: "Stream 5 (AI Filmmaking)", icon: Robot },
  { id: "Stream 6 (Acting)", name: "Stream 6 (Acting)", icon: MaskHappy },
];

export function AppSidebar({ isAdminPage = false }) {
	const router = useRouter();
    const searchParams = useSearchParams();
	const { data: session } = useSession();
	const isAdmin = session?.user?.role === "admin";
    const { setOpenMobile, isMobile } = useSidebar();
    
    // Determine selected stream from URL
    const selectedStream = searchParams.get("stream") || "all";

	function goToStream(streamId) {
        if (streamId === "all") {
            router.push("/dashboard");
        } else {
            router.push(`/dashboard?stream=${encodeURIComponent(streamId)}`);
        }
        if (isMobile) setOpenMobile(false);
	}

	return (
        <Sidebar collapsible="icon" variant="floating" style={{ backgroundColor: "#02070D", "--sidebar": "#02070D", "--sidebar-background": "#02070D", "--sidebar-foreground": "#ffffff" }}>
            <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4">
				<SidebarMenuButton
                    className="cursor-default text-white hover:bg-transparent active:bg-transparent w-auto px-0"
                    onClick={() => goToStream("all")}>
					<Image src="/pictures/dcaa-logo-transparent.png" alt="DCAA Logo" width={32} height={32} className="shrink-0 w-auto h-auto" style={{ width: 'auto', height: 'auto' }} />
					<span className="font-heading font-semibold text-white">DCAA Application</span>
				</SidebarMenuButton>
                {isMobile && (
                    <button 
                        onClick={() => setOpenMobile(false)}
                        className="text-white/70 hover:text-white p-1 ml-2"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                )}
			</SidebarHeader>
            <SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
                                    isActive={!isAdminPage && selectedStream === "all"}
                                    onClick={() => goToStream("all")}
                                    tooltip="All Streams"
                                    className="text-white/80 hover:text-white hover:bg-white/10"
                                >
									<LayoutGridIcon />
									<span>All Streams</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-white/50 mt-4">STREAMS</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {STREAMS.map((stream) => {
                                const Icon = stream.icon;
                                return (
                                    <SidebarMenuItem key={stream.id}>
                                        <SidebarMenuButton
                                            isActive={!isAdminPage && selectedStream === stream.id}
                                            onClick={() => goToStream(stream.id)}
                                            tooltip={stream.name}
                                            className="text-white/80 hover:text-white hover:bg-white/10"
                                        >
                                            <Icon weight="fill" />
                                            <span>{stream.name}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel className="text-white/50">ADMIN</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
                                        isActive={isAdminPage}
                                        onClick={() => {
                                            router.push("/admin/users");
                                            if (isMobile) setOpenMobile(false);
                                        }}
                                        tooltip="Manage users"
                                        className="text-white/80 hover:text-white hover:bg-white/10"
                                    >
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
