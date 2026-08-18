import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TableShellTab = {
  label: string;
  value: string;
};

export type TableShellSummary = {
  label: string;
  value: string;
};

type TableInstanceShellProps = {
  title?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  tabs?: TableShellTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  filterButtons?: string[];
  rowInfo?: string;
  summaries?: TableShellSummary[];
  pagination?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const TableInstanceShell = ({
  title,
  searchPlaceholder = "Search records",
  searchValue,
  onSearchChange,
  tabs = [],
  activeTab,
  onTabChange,
  filterButtons = [],
  rowInfo,
  summaries = [],
  pagination,
  children,
  className,
}: TableInstanceShellProps) => (
  <section
    className={cn(
      "rounded-[8px] border border-brand-border bg-brand-surface p-4 shadow-brand-card",
      className
    )}
  >
    {(title || rowInfo) && (
      <div className="mb-4 flex items-center justify-between border-b border-brand-divider pb-3">
        {title ? (
          <p className="text-sm font-semibold text-brand-ink">{title}</p>
        ) : (
          <div />
        )}
        {rowInfo ? (
          <p className="text-xs font-medium text-brand-muted">{rowInfo}</p>
        ) : null}
      </div>
    )}

    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      {typeof searchValue === "string" && onSearchChange ? (
        <div className="relative w-full xl:max-w-[560px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 rounded-[6px] border-brand-border bg-brand-surface pl-10 text-sm text-brand-ink placeholder:text-brand-neutral"
          />
        </div>
      ) : (
        <div />
      )}

      {tabs.length ? (
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              type="button"
              size="sm"
              variant={activeTab === tab.value ? "default" : "outline"}
              className={
                activeTab === tab.value
                  ? "h-9 rounded-[6px] bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                  : "h-9 rounded-[6px] border-brand-border bg-brand-surface px-4 text-sm font-medium text-brand-muted hover:bg-brand-light hover:text-brand-ink"
              }
              onClick={() => onTabChange?.(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>

    {filterButtons.length ? (
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter}
              type="button"
              variant="outline"
              className="h-8 rounded-[6px] border-brand-border bg-brand-surface px-3 text-xs font-medium text-brand-muted hover:bg-brand-light hover:text-brand-ink"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
    ) : null}

    <div className="mt-4 overflow-hidden rounded-[6px] border border-brand-border">
      {children}
    </div>

    {(summaries.length || pagination) ? (
      <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {summaries.length ? (
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            {summaries.map((summary) => (
              <div
                key={summary.label}
                className="rounded-[6px] border border-brand-border bg-brand-paper-soft px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase text-brand-muted">
                  {summary.label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-brand-ink">
                  {summary.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div />
        )}
        {pagination}
      </div>
    ) : null}
  </section>
);
