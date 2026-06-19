import * as React from "react"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"

export function SideHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                    <NavLink to="home">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                            <img src="/logo.png" alt="logo" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">SaleSync</span>
                            <span className="truncate text-xs">Sync sales. Simplify billing.</span>
                        </div>
                    </NavLink>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}