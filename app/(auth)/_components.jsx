"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-white to-pink-100 p-4">
            <div className="absolute -left-24 top-[-6rem] h-64 w-64 rounded-full bg-rose-200/50 blur-3xl" />
            <div className="absolute -bottom-28 right-[-5rem] h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
            <Card className="relative w-full max-w-md border-white/70 bg-white/85 shadow-xl backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    {subtitle ? (
                        <CardDescription>{subtitle}</CardDescription>
                    ) : null}
                </CardHeader>
                <CardContent>{children}</CardContent>
                {footer ? (
                    <CardFooter className="text-sm text-muted-foreground">
                        {footer}
                    </CardFooter>
                ) : null}
            </Card>
        </div>
    );
}

export function InlineError({ text }) {
    if (!text) return null;
    return (
        <p className="mt-1 text-xs text-destructive" role="alert">
            {text}
        </p>
    );
}
