"use client";
import { SignupForm } from "@/app/(front)/components/signup-form";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Updated to preserve existing params:
    const handleGuestContinue = () => {
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/aeroatlas?${params.toString()}`);
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <SignupForm onGuestContinue={handleGuestContinue} />
            </div>
        </div>
    );
}