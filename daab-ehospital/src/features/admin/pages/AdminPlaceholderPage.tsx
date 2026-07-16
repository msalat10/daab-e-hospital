import { Card, CardContent } from "@/components/ui/card";

export const AdminPlaceholderPage = () => (
  <div className="min-h-full rounded-[16px] bg-brand-paper-soft p-3 md:p-5">
    <Card className="rounded-[18px] border-0 bg-white shadow-brand-card">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-brand-muted">Admin portal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-ink">
          Admin dashboard coming next
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          Admin accounts are recognized by the role system. We will use this
          area later for managing clinics, services, doctors, and reports.
        </p>
      </CardContent>
    </Card>
  </div>
);
