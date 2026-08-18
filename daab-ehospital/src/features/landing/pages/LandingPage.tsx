import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock3,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Make an Appointment",
    description: "Choose your camp clinic and request a visit before you arrive.",
    icon: CalendarCheck,
    highlighted: true,
  },
  {
    title: "Check Your Visit",
    description: "See whether your appointment is pending, confirmed, or complete.",
    icon: Clock3,
  },
  {
    title: "Find Care",
    description: "See available clinic services and the next visit window.",
    icon: Stethoscope,
  },
];

const posts = [
  {
    name: "Hagadera Main Hospital",
    role: "Main outpatient and referral post",
    location: "Hagadera Camp",
    availability: "Open for appointment requests",
  },
  {
    name: "Health Post E6",
    role: "Community health post",
    location: "Hagadera Camp",
    availability: "Open for appointment requests",
  },
  {
    name: "Health Post L6",
    role: "Community health post",
    location: "Hagadera Camp",
    availability: "Open for appointment requests",
  },
];

const steps = [
  "Enter your patient details",
  "Choose the nearest health post",
  "Get your visit time before you arrive",
];

export const LandingPage = () => {
  return (
    <main className="min-h-screen bg-brand-paper text-brand-ink">
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="absolute -bottom-[178px] left-[-10%] h-[300px] w-[120%] rotate-[4deg] rounded-t-[50%] bg-brand-paper" />
        <div className="absolute right-[33%] top-44 hidden h-36 w-20 rounded-[6px] bg-white/6 lg:block" />
        <div className="absolute right-[22%] top-64 hidden h-44 w-20 rounded-[6px] bg-white/6 lg:block" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <nav className="flex items-center justify-between py-7">
            <Link
              to="/"
              className="font-sans text-3xl font-extrabold leading-none text-white"
              aria-label="Daryeel home"
            >
              Daryeel
            </Link>

            <div className="hidden items-center gap-10 text-sm text-white/80 md:flex">
              <a href="#services" className="hover:text-white">
                Services
              </a>
              <a href="#doctors" className="hover:text-white">
                Doctors
              </a>
              <a href="#workflow" className="hover:text-white">
                How it works
              </a>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-10 rounded-[4px] border-white/45 bg-transparent px-6 text-sm text-white hover:bg-white hover:text-brand"
            >
              <Link to="/login">Login</Link>
            </Button>
          </nav>

          <div className="grid min-h-[540px] gap-8 pb-32 pt-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pb-28 lg:pt-6">
            <div className="max-w-xl">
              <h1 className="max-w-[34rem] text-4xl font-bold leading-[1.08] tracking-normal sm:text-5xl lg:text-[56px]">
                Book your clinic visit before you arrive.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/82">
                Choose a clinic in Hagadera, Ifo, or Dhagahley, request an
                appointment, and know when to visit before joining the queue.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="h-12 rounded-[4px] bg-white px-7 text-sm font-semibold text-brand-ink shadow-none hover:bg-brand-paper-soft"
                >
                  <Link to="/patient">Book an Appointment</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-12 rounded-[4px] px-5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/patient">
                    Check Appointment Status <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-[390px]">
              <div className="absolute right-0 top-0 h-[392px] w-full max-w-[540px] overflow-hidden rounded-[36%_64%_50%_50%/24%_30%_70%_76%] bg-brand-image">
                <img
                  src="/assets/hero-care-team.png"
                  alt="Doctor and nurse ready to serve patients"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <div className="absolute bottom-16 left-12 hidden h-16 w-16 items-center justify-center rounded-full bg-brand-ink text-white lg:flex">
                <ArrowRight className="h-6 w-6 -rotate-45" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-brand-paper pb-20 pt-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="inline-flex w-fit -rotate-6 rounded-full bg-brand-black px-7 py-3 text-xl font-bold text-white">
              Services
            </div>
            <p className="max-w-sm text-sm leading-6 text-brand-muted">
              Start with the patient journey: book, check, and arrive prepared.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="doctors"
        className="bg-[linear-gradient(90deg,var(--brand-mint)_0%,var(--brand-paper-soft)_42%,var(--brand-paper)_100%)] py-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-normal">
              Find the right post
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.name} {...post} />
            ))}
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-16 rounded-full border-brand-border bg-transparent text-brand hover:bg-white"
              aria-label="Previous doctors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="h-10 w-16 rounded-full bg-brand text-white hover:bg-brand-dark"
              aria-label="Next doctors"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-brand-paper-soft py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1fr] lg:items-center">
          <div className="relative min-h-[330px] overflow-hidden rounded-[8px] bg-[linear-gradient(rgb(var(--brand-teal-rgb)_/_18%),rgb(var(--brand-teal-rgb)_/_18%)),url('/assets/hero-care-team.png')] bg-cover bg-center">
            <h2 className="absolute bottom-9 left-9 max-w-xl text-3xl font-bold text-white">
              How to make an appointment
            </h2>
          </div>

          <div>
            <p className="mb-4 w-fit -rotate-6 rounded-full bg-brand-black px-5 py-2 text-sm font-bold text-white">
              What to do
            </p>
            <h3 className="max-w-2xl text-3xl font-bold leading-tight">
              How patients book a visit
            </h3>
            <div className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-[8px] bg-white p-4 shadow-brand-soft"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

type ServiceCardProps = {
  title: string;
  description: string;
  icon: typeof CalendarCheck;
  highlighted?: boolean;
};

const ServiceCard = ({
  title,
  description,
  icon: Icon,
  highlighted,
}: ServiceCardProps) => (
  <Card
    className={cn(
      "relative min-h-[235px] overflow-hidden rounded-[8px_22px_8px_8px] border border-brand-info/15 bg-brand-info-soft text-brand-ink shadow-brand-card after:absolute after:bottom-[-42px] after:right-[-42px] after:h-28 after:w-28 after:rounded-tl-full after:bg-white/55 after:content-['']"
    )}
  >
    <CardContent className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
      <div>
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            highlighted ? "bg-brand text-white" : "bg-brand-surface text-brand"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>

        <h3 className="mt-10 max-w-[14rem] text-2xl font-semibold leading-tight">
          {title}
        </h3>
        <p
          className={cn(
            "mt-4 text-sm leading-6",
            "text-brand-muted"
          )}
        >
          {description}
        </p>
      </div>
    </CardContent>
  </Card>
);

type PostCardProps = {
  name: string;
  role: string;
  location: string;
  availability: string;
};

const PostCard = ({ name, role, location, availability }: PostCardProps) => (
  <Card className="rounded-[8px] border border-brand-border bg-brand-light shadow-brand-card">
    <CardContent className="p-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface text-brand">
        <UsersRound className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">{name}</h3>
      <p className="mt-1 text-xs text-brand-muted">{role}</p>
      <div className="mt-4 space-y-2 text-left text-xs leading-5 text-brand-ink">
        <p>• {location}</p>
        <p>• {availability}</p>
        <p>• Patient booking supported</p>
      </div>
      <div className="mt-5 flex justify-center gap-2">
        <Button size="sm" className="h-8 rounded-full bg-brand px-4 text-xs hover:bg-brand-dark">
          Book Visit
        </Button>
        <Button size="sm" variant="outline" className="h-8 rounded-full px-4 text-xs">
          Availability
        </Button>
      </div>
    </CardContent>
  </Card>
);
