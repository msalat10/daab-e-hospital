import type { CSSProperties, ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileDown,
  Home,
  Mail,
  Pill,
  Search,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const previewTokens = {
  "--background": "#F7F9FA",
  "--foreground": "#1B1F24",
  "--card": "#FFFFFF",
  "--card-foreground": "#1B1F24",
  "--primary": "#2C727B",
  "--primary-hover": "#245F67",
  "--primary-foreground": "#FFFFFF",
  "--primary-soft": "#DCEEEF",
  "--primary-soft-foreground": "#245F67",
  "--secondary": "#EEF1F4",
  "--secondary-foreground": "#59636E",
  "--muted": "#EEF1F4",
  "--muted-foreground": "#88919A",
  "--border": "#E7EAEE",
  "--divider": "#EEF1F4",
  "--input": "#E7EAEE",
  "--ring": "#2C727B",
  "--success": "#2E8B57",
  "--success-soft": "#E8F5ED",
  "--warning": "#D97706",
  "--warning-soft": "#FFF4DF",
  "--destructive": "#DC2626",
  "--destructive-soft": "#FDECEC",
  "--info": "#3B82F6",
  "--info-soft": "#EAF2FF",
} as CSSProperties;

const navItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Appointments", icon: CalendarDays },
  { label: "Medical Records", icon: ClipboardList },
  { label: "Messages", icon: Mail },
  { label: "Profile", icon: UserRound },
];

const records = [
  {
    visit: "General consultation",
    clinic: "Hagadera Clinic",
    date: "20 Jul 2026",
    status: "Confirmed",
    tone: "success",
  },
  {
    visit: "Lab review",
    clinic: "Ifo Health Post",
    date: "18 Jul 2026",
    status: "Pending",
    tone: "warning",
  },
  {
    visit: "Prescription renewal",
    clinic: "Dhagahley Clinic",
    date: "11 Jul 2026",
    status: "Completed",
    tone: "success",
  },
];

export const PatientColorPreviewDashboard = () => (
  <div
    style={previewTokens}
    className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)]"
  >
    <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] shadow-[0_2px_10px_rgba(0,0,0,.04)] lg:grid-cols-[240px_1fr_320px]">
      <PatientPreviewSidebar />
      <main className="min-w-0 border-x border-[var(--border)] bg-[var(--background)]">
        <PatientPreviewHeader />
        <div className="space-y-4 p-4">
          <UpcomingAppointmentPreview />
          <PatientQuickActions />
          <MedicalRecordsPreviewTable />
        </div>
      </main>
      <PatientContextPreviewPanel />
    </div>
  </div>
);

export const PatientPreviewSidebar = () => (
  <aside className="bg-[var(--card)] p-4">
    <div className="flex items-center border-b border-[var(--divider)] pb-4">
      <img
        src="/assets/daab-logo-mark.svg"
        alt="daab"
        className="h-14 w-24 object-contain"
      />
    </div>

    <nav className="mt-5 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            type="button"
            className={`flex h-9 w-full items-center gap-3 rounded-[6px] px-3 text-sm ${
              item.active
                ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary-soft-foreground)]"
                : "text-[var(--secondary-foreground)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-soft-foreground)]"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                item.active
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  </aside>
);

export const PatientPreviewHeader = () => (
  <header className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--card)] px-5 py-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
        Patient dashboard
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
        My care workspace
      </h1>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative w-full min-w-[240px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          className="h-9 rounded-[6px] border-[var(--input)] bg-[var(--card)] pl-9 text-sm"
          placeholder="Search records"
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-[6px] border-[var(--border)] bg-[var(--card)]"
      >
        <Bell className="h-4 w-4 text-[var(--secondary-foreground)]" />
      </Button>
    </div>
  </header>
);

export const UpcomingAppointmentPreview = () => (
  <section className="rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_2px_10px_rgba(0,0,0,.04)]">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
          Upcoming appointment
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--card-foreground)]">
          General consultation
        </h2>
        <p className="mt-1 text-sm text-[var(--secondary-foreground)]">
          Hagadera Clinic · Today at 10:30 AM
        </p>
      </div>
      <StatusBadge tone="success">Confirmed</StatusBadge>
    </div>

    <div className="mt-4 grid gap-0 overflow-hidden rounded-[6px] border border-[var(--border)] md:grid-cols-4">
      <AppointmentFact label="Reference" value="DAD-260720-A42" />
      <AppointmentFact label="Clinic" value="Hagadera" />
      <AppointmentFact label="Queue" value="A-014" />
      <AppointmentFact label="Doctor" value="Dr. Amina" />
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <PreviewPrimaryButton>View details</PreviewPrimaryButton>
      <PreviewSecondaryButton>Reschedule</PreviewSecondaryButton>
      <PreviewSecondaryButton>Contact clinic</PreviewSecondaryButton>
    </div>
  </section>
);

export const PatientQuickActions = () => (
  <section className="grid gap-3 md:grid-cols-3">
    <ActionCard
      icon={<CalendarDays className="h-4 w-4" />}
      title="Book appointment"
      description="Choose clinic and available time."
    />
    <ActionCard
      icon={<FileDown className="h-4 w-4" />}
      title="Download report"
      description="Get confirmed visit documents."
    />
    <ActionCard
      icon={<Pill className="h-4 w-4" />}
      title="Request refill"
      description="Ask clinic to review medication."
    />
  </section>
);

export const MedicalRecordsPreviewTable = () => (
  <section className="rounded-[8px] border border-[var(--border)] bg-[var(--card)] shadow-[0_2px_10px_rgba(0,0,0,.04)]">
    <div className="flex items-center justify-between border-b border-[var(--divider)] px-4 py-3">
      <div>
        <h2 className="text-base font-semibold text-[var(--card-foreground)]">
          Medical records
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Recent visits and care updates
        </p>
      </div>
      <button className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">
        View all
      </button>
    </div>
    <Table>
      <TableHeader>
        <TableRow className="bg-[var(--muted)] hover:bg-[var(--muted)]">
          <TableHead className="h-9 px-4 text-xs font-semibold text-[var(--secondary-foreground)]">
            Visit
          </TableHead>
          <TableHead className="h-9 px-4 text-xs font-semibold text-[var(--secondary-foreground)]">
            Clinic
          </TableHead>
          <TableHead className="h-9 px-4 text-xs font-semibold text-[var(--secondary-foreground)]">
            Date
          </TableHead>
          <TableHead className="h-9 px-4 text-xs font-semibold text-[var(--secondary-foreground)]">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow
            key={`${record.visit}-${record.date}`}
            className="border-[var(--divider)] bg-[var(--card)] hover:bg-[var(--primary-soft)]"
          >
            <TableCell className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
              {record.visit}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-[var(--secondary-foreground)]">
              {record.clinic}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-[var(--secondary-foreground)]">
              {record.date}
            </TableCell>
            <TableCell className="px-4 py-3">
              <StatusBadge tone={record.tone}>{record.status}</StatusBadge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </section>
);

export const PatientContextPreviewPanel = () => (
  <aside className="bg-[var(--card)] p-4">
    <section className="border-b border-[var(--divider)] pb-4">
      <h2 className="text-base font-semibold text-[var(--foreground)]">
        Patient profile
      </h2>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[var(--primary-soft)] text-[var(--primary)]">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Mohamed Salat
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Refugee ID: DDB-28491
          </p>
        </div>
      </div>
    </section>

    <ContextSection title="Health summary">
      <ContextRow label="Active visits" value="1" />
      <ContextRow label="Completed" value="8" />
      <ContextRow label="Allergies" value="None recorded" />
    </ContextSection>

    <ContextSection title="Messages">
      <SoftNotice tone="info">
        Clinic sent appointment instructions for today's visit.
      </SoftNotice>
    </ContextSection>

    <ContextSection title="Billing">
      <p className="text-sm text-[var(--muted-foreground)]">
        No open billing items.
      </p>
    </ContextSection>
  </aside>
);

const AppointmentFact = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-r border-[var(--border)] px-3 py-3 md:border-b-0">
    <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted-foreground)]">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
      {value}
    </p>
  </div>
);

const ActionCard = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <button
    type="button"
    className="group flex items-start gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[0_2px_10px_rgba(0,0,0,.04)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[var(--secondary)] text-[var(--primary)] group-hover:bg-[var(--card)]">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-[var(--foreground)]">
        {title}
      </span>
      <span className="mt-1 block text-sm text-[var(--secondary-foreground)]">
        {description}
      </span>
    </span>
    <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
  </button>
);

const StatusBadge = ({
  tone,
  children,
}: {
  tone: string;
  children: ReactNode;
}) => {
  const classes: Record<string, string> = {
    success: "border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]",
    warning: "border-[var(--warning-soft)] bg-[var(--warning-soft)] text-[var(--warning)]",
    destructive:
      "border-[var(--destructive-soft)] bg-[var(--destructive-soft)] text-[var(--destructive)]",
    info: "border-[var(--info-soft)] bg-[var(--info-soft)] text-[var(--info)]",
  };

  return (
    <span
      className={`inline-flex h-7 items-center rounded-[999px] border px-2.5 text-xs font-semibold ${
        classes[tone] ?? classes.info
      }`}
    >
      {children}
    </span>
  );
};

const PreviewPrimaryButton = ({ children }: { children: ReactNode }) => (
  <Button className="h-9 rounded-[6px] bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
    {children}
  </Button>
);

const PreviewSecondaryButton = ({ children }: { children: ReactNode }) => (
  <Button
    variant="outline"
    className="h-9 rounded-[6px] border-[var(--border)] bg-[var(--card)] text-[var(--secondary-foreground)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-soft-foreground)]"
  >
    {children}
  </Button>
);

const ContextSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="border-b border-[var(--divider)] py-4">
    <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
    <div className="mt-3 space-y-2">{children}</div>
  </section>
);

const ContextRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-[var(--muted-foreground)]">{label}</span>
    <span className="font-medium text-[var(--foreground)]">{value}</span>
  </div>
);

const SoftNotice = ({
  tone,
  children,
}: {
  tone: "info" | "warning";
  children: ReactNode;
}) => (
  <div
    className={
      tone === "info"
        ? "rounded-[6px] border border-[var(--info-soft)] bg-[var(--info-soft)] p-3 text-sm leading-6 text-[var(--info)]"
        : "rounded-[6px] border border-[var(--warning-soft)] bg-[var(--warning-soft)] p-3 text-sm leading-6 text-[var(--warning)]"
    }
  >
    {children}
  </div>
);
