"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginImage from "@/app/(front)/examples/login-image.jpg";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export function SignupForm({
                               className,
                               onGuestContinue,
                               ...props
                           }: React.ComponentProps<"div"> & { onGuestContinue?: () => void }) {
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!email || !password || password !== confirmPassword || !displayName) {
            setError("Please fill in all required fields and ensure passwords match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    },
                },
            });

            if (signupError) {
                setError(signupError.message);
            } else {
                setSuccessMessage("Check your email to verify your account before logging in.");
                // Preserve URL params from plan page
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/aeroatlas?${params.toString()}`);
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
        }
    };

    const handleGuestLogin = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: "aeroatlas.guest@gmail.com",
                password: "Password",
            });

            if (loginError) {
                setError(loginError.message);
            } else {
                // Use the onGuestContinue prop if provided, else default
                if (onGuestContinue) {
                    onGuestContinue();
                } else {
                    // Preserve URL params for guest access
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("guest", "true");
                    router.push(`/aeroatlas?${params.toString()}`);
                }
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Welcome!</h1>
                                <p className="text-balance text-muted-foreground">
                                    Sign up for an Aero Atlas account
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="displayName">Username / Display Name*</Label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => {
                                        setDisplayName(e.target.value);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email*</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Set your password (Must be at least 6 characters)*</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm your password*</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError(null);
                                        setSuccessMessage(null);
                                    }}
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm" aria-live="assertive">
                                    {error}
                                </p>
                            )}
                            {successMessage && (
                                <p className="text-green-500 text-sm" aria-live="assertive">
                                    {successMessage}
                                </p>
                            )}

                            <Button type="submit" className="w-full">
                                Signup
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGuestLogin}
                            >
                                Continue as Guest
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Log in!
                                </Link>
                            </div>

                            <div className="text-center text-xs text-muted-foreground mt-4">
                                By signing up, you agree to our{" "}
                                <Link href="/terms" className="font-medium text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="font-medium text-primary hover:underline">
                                    Privacy Policy
                                </Link>.
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <Image
                            src={LoginImage}
                            alt="Login Image"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}