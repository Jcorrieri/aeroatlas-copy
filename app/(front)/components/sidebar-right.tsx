"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Calendars } from "@/app/(front)/components/calendars";
import { DatePickerWithRange } from "@/app/(front)/components/date-range-picker";
import { NavUser } from "@/app/(front)/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";

const useCurrentUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data?.user) {
                console.error("Supabase auth error:", error?.message);
                setUser(null);
            } else {
                setUser({
                    ...data.user,
                    isGuest: false,
                });
            }

            setLoading(false);
        };

        fetchUser();
    }, []);

    return { user, loading };
};

export function SidebarRight({
                                 ...props
                             }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading } = useCurrentUser();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>User not authenticated</div>;
    }

    const userData = {
        name: user?.user_metadata?.display_name || "User",
        avatar: user?.user_metadata?.avatar_url || "/avatars/guest_white.png",
        email: user.email,
    };

    return (
        <Sidebar
            collapsible="none"
            className="sticky hidden lg:flex top-0 h-svh border-l"
            {...props}
        >
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser user={userData} />
            </SidebarHeader>

            <SidebarContent>
                <DatePickerWithRange />
                <SidebarSeparator className="mx-0" />
                <Calendars
                    calendars={[{ name: "My Calendars", items: ["Personal", "Work", "Family"] }]}
                />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Plus />
                            <span>New Calendar</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}