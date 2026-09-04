"use client";
import { LoginForm } from "@/app/(front)/components/login-form";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleGuestContinue = () => {
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/aeroatlas?${params.toString()}`);
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm onGuestContinue={handleGuestContinue} />
            </div>
        </div>
    );
}