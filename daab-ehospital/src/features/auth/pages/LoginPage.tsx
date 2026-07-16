import { LoginForm } from "../components/login-form";

export const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-paper px-5 py-10">
      <LoginForm className="w-full max-w-4xl" />
    </main>
  );
};
