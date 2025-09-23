import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {SvgLogo} from "@/components/logo";

export function Announcement() {
    return (
        // the link tag needs to be changes to a log in page
        <Link
            href="/docs/tailwind-v4"
            className="group mb-2 inline-flex items-center gap-2 px-0.5 text-sm font-medium"
        >
            <SvgLogo className="h-10 w-10" />
            <span className="underline-offset-4 group-hover:underline">
        Get Started with Aero Atlas
      </span>
            <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
    )
}
