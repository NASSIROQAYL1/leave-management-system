import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/http-error";
import { env } from "@/lib/env";

const loginSchema = z.object({
  email: z.string().email("Use your company email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);
      const destination = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;
      navigate(destination ?? (user.role === "ADMIN" ? "/admin/dashboard" : user.role === "MANAGER" ? "/manager/dashboard" : "/employee/dashboard"), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid email or password."));
    }
  });

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="border-b border-border/70 bg-gradient-to-r from-primary/12 via-info/10 to-success/10 px-8 py-7">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Access {env.appName} with your company account. Sessions are secured through JWT access and refresh tokens.
        </p>
      </div>

      <form className="space-y-5 px-8 py-8" onSubmit={onSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="name@company.com"
          />
          {errors.email ? <span className="text-xs text-danger">{errors.email.message}</span> : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? <span className="text-xs text-danger">{errors.password.message}</span> : null}
        </label>
        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/forgot-password" className="font-medium text-primary">
            Forgot password?
          </Link>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Seed password: ChangeMe123!</span>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Signing in..." : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          Use seeded accounts from the backend SQL to validate role-based redirects and protected shells.
        </div>
      </form>
    </div>
  );
}
