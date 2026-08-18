import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const AdminTableShell = ({
  title,
  children,
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No records found.",
}: {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}) => (
  <Card className="overflow-hidden rounded-[8px] border-brand-border bg-brand-surface shadow-brand-card">
    <CardHeader className="border-b border-brand-border/70 px-4 py-3">
      <CardTitle className="text-base font-semibold text-brand-ink">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      {isLoading && <AdminLoadingState />}
      {isError && !isLoading && <AdminErrorState />}
      {isEmpty && !isLoading && !isError && (
        <div className="px-4 py-10 text-center text-sm text-brand-muted">
          {emptyMessage}
        </div>
      )}
      {!isLoading && !isError && !isEmpty && children}
    </CardContent>
  </Card>
);

export const AdminTable = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow className="border-brand-divider bg-[#FAFBFC] hover:bg-[#FAFBFC]">
          {children}
        </TableRow>
      </TableHeader>
    </Table>
  </div>
);

export const AdminTableHead = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <TableHead className={cn("h-10 px-4 text-xs font-semibold text-brand-muted", className)}>
    {children}
  </TableHead>
);

export const AdminTableBody = ({ children }: { children: ReactNode }) => (
  <TableBody>{children}</TableBody>
);

export const AdminTableCell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <TableCell className={cn("px-4 py-3 text-sm text-brand-ink", className)}>
    {children}
  </TableCell>
);

export const AdminStatusBadge = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) => {
  const toneClass = {
    success: "border-brand-success/20 bg-brand-success-soft text-brand-success",
    warning: "border-brand-warning/20 bg-brand-warning-soft text-brand-warning",
    danger: "border-brand-danger/20 bg-brand-danger-soft text-brand-danger",
    info: "border-brand-info/20 bg-brand-info-soft text-brand-info",
    neutral: "border-brand-border bg-brand-paper text-brand-muted",
  }[tone];

  return (
    <Badge variant="outline" className={cn("rounded-[4px] font-medium", toneClass)}>
      {children}
    </Badge>
  );
};

export const AdminMetric = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Card className="rounded-[8px] border-brand-border bg-brand-surface shadow-brand-card">
    <CardContent className="p-4">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-brand-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-brand-ink">{value}</p>
    </CardContent>
  </Card>
);

export const formatAdminDate = (value?: string | null) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const AdminLoadingState = () => (
  <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-brand-muted">
    <Loader2 className="h-4 w-4 animate-spin" />
    Loading records...
  </div>
);

const AdminErrorState = () => (
  <div className="m-4 rounded-[8px] border border-brand-danger/20 bg-brand-danger-soft px-4 py-3 text-sm text-brand-danger">
    We could not load these records. Check the Supabase policy for this table.
  </div>
);
