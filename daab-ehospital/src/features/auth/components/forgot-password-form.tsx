import { useState, type ComponentProps, type FormEvent } from "react"
import { Link } from "react-router"
import { useForgotPassword } from "@refinedev/core"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function ForgotPasswordForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  const forgotPassword = useForgotPassword<{ email: string }>({
    mutationOptions: {
      onSuccess: (response) => {
        const authResponse = response as {
          success?: boolean
          error?: { message?: string }
        }

        if (authResponse.success === false) {
          setError(authResponse.error?.message || "Unable to send reset email")
          return
        }

        setIsSent(true)
      },
      onError: (resetError) => {
        setError(resetError.message || "Unable to send reset email")
      },
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSent(false)
    forgotPassword.mutate({ email })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <img
                  src="/assets/daab-logo-mark.svg"
                  alt="Daryeel"
                  className="mb-2 h-20 w-28 object-contain"
                />
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your email and we will send you a password reset link.
                </p>
              </div>

              {error && (
                <FieldError className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                  {error}
                </FieldError>
              )}

              {isSent && (
                <FieldDescription className="rounded-md border border-brand-success/20 bg-brand-success-soft p-3 text-brand-success">
                  If an account exists for this email, a reset link has been
                  sent.
                </FieldDescription>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <Button type="submit" disabled={forgotPassword.isPending}>
                  {forgotPassword.isPending ? "Sending..." : "Send reset link"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Remembered your password? <Link to="/login">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="hidden bg-primary-soft md:block" />
        </CardContent>
      </Card>
    </div>
  )
}
