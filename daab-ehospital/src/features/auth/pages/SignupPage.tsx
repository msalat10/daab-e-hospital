import { SignupForm } from "../components/signup-form";

export const SignupPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-paper px-5 py-10">
      <SignupForm className="w-full max-w-4xl" />
    </main>
  );
};
