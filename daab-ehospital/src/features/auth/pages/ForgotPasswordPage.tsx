import { ForgotPasswordForm } from "../components/forgot-password-form";

export const ForgotPasswordPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-paper px-5 py-10">
      <ForgotPasswordForm className="w-full max-w-4xl" />
    </main>
  );
};
