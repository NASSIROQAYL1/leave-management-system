import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, Sparkles, TriangleAlert } from "lucide-react";
import { z } from "zod";
import { filesApi } from "@/api/files.api";
import { leaveBalancesApi } from "@/api/leave-balances.api";
import { leaveRequestsApi } from "@/api/leave-requests.api";
import { leaveTypesApi } from "@/api/leave-types.api";
import { publicHolidaysApi } from "@/api/public-holidays.api";
import { RequestWizardSteps } from "@/components/leave/request-wizard-steps";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload } from "@/components/ui/file-upload";
import { getErrorMessage } from "@/lib/http-error";
import { useAuthStore } from "@/store/auth-store";
import type { LeaveBalance, LeaveType, OverlapCheckResponse, PublicHoliday } from "@/types/domain";
import { toast } from "sonner";

const wizardSchema = z.object({
  leaveTypeId: z.number({ required_error: "Select a leave type." }),
  startDate: z.string().min(1, "Choose a start date."),
  endDate: z.string().min(1, "Choose an end date."),
  reason: z.string().max(1000, "Reason is too long.").optional(),
  attachmentUrl: z.string().optional(),
});

type WizardValues = z.infer<typeof wizardSchema>;

const steps = ["Type", "Dates", "Details", "Summary"];

function uniqueYears(values: Array<string | undefined>) {
  return [...new Set(values.filter(Boolean).map((value) => Number(value?.slice(0, 4))))];
}

export function RequestWizard() {
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overlap, setOverlap] = useState<OverlapCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      reason: "",
    },
    mode: "onChange",
  });

  const values = form.watch();
  const selectedType = leaveTypes.find((item) => item.id === values.leaveTypeId);
  const selectedBalance = balances.find((item) => item.leaveType.id === values.leaveTypeId);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [typeData, balanceData, holidayData] = await Promise.all([
          leaveTypesApi.list(),
          leaveBalancesApi.my(currentYear),
          publicHolidaysApi.list(currentYear),
        ]);
        setLeaveTypes(typeData);
        setBalances(balanceData);
        setHolidays(holidayData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to prepare the leave request form."));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentYear]);

  useEffect(() => {
    const years = uniqueYears([values.startDate, values.endDate]);
    if (years.length === 0) {
      return;
    }

    const loadHolidays = async () => {
      try {
        const all = await Promise.all(years.map((year) => publicHolidaysApi.list(year)));
        setHolidays(all.flat());
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load public holidays for the selected dates."));
      }
    };

    void loadHolidays();
  }, [values.startDate, values.endDate]);

  useEffect(() => {
    if (!values.startDate || !values.endDate) {
      setOverlap(null);
      return;
    }

    const check = async () => {
      try {
        const result = await leaveRequestsApi.checkOverlap(values.startDate, values.endDate);
        setOverlap(result);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to validate overlapping leave."));
      }
    };

    void check();
  }, [values.startDate, values.endDate]);

  const localWorkingDays = useMemo(() => {
    if (!values.startDate || !values.endDate) {
      return 0;
    }
    const start = new Date(values.startDate);
    const end = new Date(values.endDate);
    const holidaySet = new Set(holidays.map((holiday) => holiday.date));
    let count = 0;

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const day = cursor.getDay();
      const iso = cursor.toISOString().slice(0, 10);
      if (day === 0 || day === 6 || holidaySet.has(iso)) {
        continue;
      }
      count += 1;
    }

    return count;
  }, [holidays, values.endDate, values.startDate]);

  const approvalChain = useMemo(() => {
    if (localWorkingDays > 5) {
      return `${user?.manager?.fullName ?? "Manager"} → Admin final approval`;
    }
    return `${user?.manager?.fullName ?? "Manager"} review`;
  }, [localWorkingDays, user?.manager?.fullName]);

  const goNext = async () => {
    if (step === 1) {
      const valid = await form.trigger("leaveTypeId");
      if (!valid) {
        return;
      }
    }
    if (step === 2) {
      const valid = await form.trigger(["startDate", "endDate"]);
      if (!valid) {
        return;
      }
      if (overlap?.overlap) {
        toast.error("Resolve the overlap warning before continuing.");
        return;
      }
      if (localWorkingDays <= 0) {
        toast.error("Select a range that includes at least one working day.");
        return;
      }
    }
    if (step === 3 && selectedType?.requiresDocument && !selectedFile) {
      toast.error("This leave type requires a supporting document.");
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length));
  };

  const submit = form.handleSubmit(async (payload) => {
    try {
      setSubmitting(true);
      let attachmentUrl: string | undefined;

      if (selectedFile) {
        const uploaded = await filesApi.upload(selectedFile);
        attachmentUrl = uploaded.url;
      }

      const response = await leaveRequestsApi.create({
        leaveTypeId: payload.leaveTypeId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason?.trim() || undefined,
        attachmentUrl,
      });

      setSuccessId(response.id);
      toast.success("Leave request submitted.");
      form.reset({ reason: "" });
      setSelectedFile(null);
      setOverlap(null);
      setStep(1);

      const [balanceData] = await Promise.all([leaveBalancesApi.my(currentYear)]);
      setBalances(balanceData);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit leave request."));
    } finally {
      setSubmitting(false);
    }
  });

  if (loading) {
    return (
      <div className="glass-card p-6">
        <p className="text-sm text-muted-foreground">Preparing the leave request wizard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RequestWizardSteps currentStep={step} steps={steps} />

      {successId ? (
        <div className="glass-card flex items-start gap-4 border-success/20 bg-success/10 p-5">
          <div className="rounded-2xl bg-success/15 p-3 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">Request submitted</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Request #{successId} is now in the review queue. You can keep creating another request below.
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          {step === 1 ? (
            <div className="glass-card space-y-5 p-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Choose leave type</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Remaining balances are shown beside each type so you can choose the right request path.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {leaveTypes.map((type) => {
                  const balance = balances.find((item) => item.leaveType.id === type.id);
                  const selected = values.leaveTypeId === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => form.setValue("leaveTypeId", type.id, { shouldValidate: true })}
                      className={`rounded-3xl border p-5 text-left transition ${
                        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: type.colorHex }} />
                            <p className="font-medium">{type.name}</p>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{type.description || "No description available."}</p>
                        </div>
                        {type.requiresDocument ? (
                          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
                            Document required
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Remaining balance</span>
                        <span className="font-semibold">{balance?.remainingDays ?? 0} days</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.leaveTypeId ? (
                <p className="text-sm text-danger">{form.formState.errors.leaveTypeId.message}</p>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <DateRangePicker
                startDate={values.startDate}
                endDate={values.endDate}
                holidays={holidays}
                onChange={(range) => {
                  form.setValue("startDate", range.startDate ?? "", { shouldValidate: true });
                  form.setValue("endDate", range.endDate ?? "", { shouldValidate: true });
                }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card p-5">
                  <p className="text-sm text-muted-foreground">Working days</p>
                  <p className="mt-3 font-heading text-3xl font-semibold">{overlap?.workingDays ?? localWorkingDays}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Weekends and public holidays are excluded from this count.
                  </p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-sm text-muted-foreground">Public holidays in range year(s)</p>
                  <div className="mt-3 space-y-2">
                    {holidays.length > 0 ? (
                      holidays.slice(0, 3).map((holiday) => (
                        <div key={holiday.id} className="rounded-2xl border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
                          {holiday.date} · {holiday.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No holidays loaded for this year yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {form.formState.errors.startDate ? <p className="text-sm text-danger">{form.formState.errors.startDate.message}</p> : null}
              {form.formState.errors.endDate ? <p className="text-sm text-danger">{form.formState.errors.endDate.message}</p> : null}

              {overlap?.overlap ? (
                <div className="glass-card flex items-start gap-3 border-warning/20 bg-warning/10 p-4">
                  <TriangleAlert className="mt-0.5 h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-warning">Overlap detected</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This date range overlaps an existing active request. Adjust your dates before continuing.
                    </p>
                  </div>
                </div>
              ) : null}

              {selectedBalance && (overlap?.workingDays ?? localWorkingDays) > selectedBalance.remainingDays ? (
                <div className="glass-card flex items-start gap-3 border-danger/20 bg-danger/10 p-4">
                  <TriangleAlert className="mt-0.5 h-5 w-5 text-danger" />
                  <div>
                    <p className="font-medium text-danger">Balance warning</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You selected {(overlap?.workingDays ?? localWorkingDays)} working days, but only {selectedBalance.remainingDays} remain for this leave type.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div className="glass-card space-y-4 p-5">
                <div>
                  <h2 className="font-heading text-2xl font-semibold">Add context</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reason and supporting documents help the reviewer decide faster.
                  </p>
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Reason</span>
                  <textarea
                    value={values.reason ?? ""}
                    onChange={(event) => form.setValue("reason", event.target.value, { shouldValidate: true })}
                    className="min-h-36 w-full rounded-2xl border border-input bg-background px-3 py-3"
                    placeholder="Share any context your manager should know."
                  />
                </label>
              </div>
              <FileUpload value={selectedFile} onChange={setSelectedFile} />
              {selectedType?.requiresDocument && !selectedFile ? (
                <p className="text-sm text-warning">This leave type requires a PDF or image attachment before submission.</p>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="glass-card space-y-5 p-5">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Review before submitting</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirm the type, dates, working-day total, and approval routing.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Leave type</p>
                  <p className="mt-2 text-sm font-medium">{selectedType?.name ?? "Not selected"}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Working days</p>
                  <p className="mt-2 text-sm font-medium">{overlap?.workingDays ?? localWorkingDays}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Date range</p>
                  <p className="mt-2 text-sm font-medium">
                    {values.startDate || "N/A"} to {values.endDate || "N/A"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Approval chain</p>
                  <p className="mt-2 text-sm font-medium">{approvalChain}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reason</p>
                <p className="mt-2 text-sm">{values.reason?.trim() || "No additional comment provided."}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Attachment</p>
                <p className="mt-2 text-sm">{selectedFile ? selectedFile.name : "No file attached."}</p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              disabled={step === 1 || submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => void goNext()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit request"}
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold">Request snapshot</h3>
                <p className="text-sm text-muted-foreground">Live summary while you move through the wizard.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected type</p>
                <p className="mt-2 text-sm">{selectedType?.name ?? "Choose a leave type"}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Working days</p>
                <p className="mt-2 text-sm">{overlap?.workingDays ?? localWorkingDays}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Approval path</p>
                <p className="mt-2 text-sm">{approvalChain}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-heading text-xl font-semibold">My balances</h3>
            <div className="mt-4 space-y-3">
              {balances.length > 0 ? (
                balances.map((balance) => (
                  <div key={balance.id} className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: balance.leaveType.colorHex }} />
                        <div>
                          <p className="font-medium">{balance.leaveType.name}</p>
                          <p className="text-xs text-muted-foreground">{balance.totalDays} total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{balance.remainingDays}</p>
                        <p className="text-xs text-muted-foreground">remaining</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No balances available"
                  description="Balance records for the current year are not available yet."
                  compact
                />
              )}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
