import react from 'react';
import { Button } from "@/components/ui/Hero/button"
import {
    PageActions,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
} from "@/components/ui/Hero/page-header"

import {Announcement} from "@/components/ui/Hero/announcement"

import Link from "next/link";

import { cn } from "@/lib/utils"

export default function Hero() {
    return (
        <div className= "relative container py-10 px-8">
            <PageHeader>
                <Announcement />
                <PageHeaderHeading>Build your component library</PageHeaderHeading>
                <PageHeaderDescription>
                    A set of beautifully-designed, accessible components and a code
                    distribution platform. Works with your favorite frameworks. Open
                    Source. Open Code.
                </PageHeaderDescription>
                <PageActions>
                    <Button asChild size="sm">
                        <Link href="/docs">Get Started</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                        <Link href="/blocks">Browse Blocks</Link>
                    </Button>
                </PageActions>
            </PageHeader>

        </div>
    )
}