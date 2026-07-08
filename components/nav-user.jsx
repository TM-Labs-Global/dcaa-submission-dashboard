"use client";

import { signOut, useSession } from "next-auth/react";
import {
	Avatar,
	AvatarFallback,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { firstNameFromEmail, initialFromEmail } from "@/lib/formatter";
import { ShieldIcon, LogOutIcon } from "lucide-react";

export function NavUser() {
	const { data: session } = useSession();
	const email = session?.user?.email;
	const isAdmin = session?.user?.role === "admin";

	if (!email) return null;

	return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" className="cursor-pointer rounded-full" />}><Avatar className="size-8">
						<AvatarFallback className="bg-accent text-accent-foreground font-semibold">
							{initialFromEmail(email)}
						</AvatarFallback>
					</Avatar></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
				<DropdownMenuLabel className="flex items-center gap-3 font-normal">
					<Avatar className="size-9">
						<AvatarFallback className="bg-accent text-accent-foreground font-semibold">
							{initialFromEmail(email)}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="font-medium text-foreground text-sm">
							{firstNameFromEmail(email)}
						</p>
						<p className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
							{email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{isAdmin && (
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => (window.location.href = "/admin/users")}>
							<ShieldIcon />
							Manage users
						</DropdownMenuItem>
					</DropdownMenuGroup>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
                        className="w-full cursor-pointer"
                        variant="destructive"
                        onClick={() => signOut({ callbackUrl: "/login" })}>
						<LogOutIcon />
						Sign out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
        </DropdownMenu>
    );
}
