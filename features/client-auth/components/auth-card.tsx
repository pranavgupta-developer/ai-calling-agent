import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  footer?: React.ReactNode;
}

export function AuthCard({
  title,
  description,
  footer,
  className,
  children,
  ...props
}: AuthCardProps) {
  return (
    <Card className={cn("border-none shadow-none md:border md:shadow-sm w-full max-w-md mx-auto bg-card text-card-foreground", className)} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="flex justify-center text-sm text-muted-foreground pt-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
