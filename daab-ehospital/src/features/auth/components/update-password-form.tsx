import { useState, type ComponentProps, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
import { useUpdatePassword } from "@refinedev/core"

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

export function UpdatePasswordForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const updatePassword = useUpdatePassword<{ password: string }>({
    mutationOptions: {
      onSuccess: (response) => {
        if (!response.success) {
          setError(response.error?.message || "Unable to update password")
          return
        }

        navigate(response.redirectTo || "/login", { replace: true })
      },
      onError: (updateError) => {
        setError(updateError.message || "Unable to update password")
      },
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    updatePassword.mutate({ password })
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
                <h1 className="text-2xl font-bold">Create a new password</h1>
                <p className="text-balance text-muted-foreground">
                  Enter a new password for your Daryeel account.
                </p>
              </div>

              {error && (
                <FieldError className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                  {error}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <FieldDescription>
                  Password must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={updatePassword.isPending}>
                  {updatePassword.isPending ? "Updating..." : "Update password"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Already updated it? <Link to="/login">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="hidden bg-primary-soft md:block" />
        </CardContent>
      </Card>
    </div>
  )
}
