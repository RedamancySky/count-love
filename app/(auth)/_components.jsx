"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 via-white to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer ? <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter> : null}
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

