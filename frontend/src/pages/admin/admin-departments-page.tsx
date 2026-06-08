import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { departmentsApi } from "@/api/departments.api";
import { usersApi } from "@/api/users.api";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ModalShell } from "@/components/ui/modal-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { getErrorMessage } from "@/lib/http-error";
import type { Department, User } from "@/types/domain";
import { toast } from "sonner";

interface DepartmentForm {
  name: string;
  description: string;
  managerId: string;
}

const emptyDepartmentForm: DepartmentForm = {
  name: "",
  description: "",
  managerId: "",
};

export function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentForm>(emptyDepartmentForm);

  const managerOptions = useMemo(() => managers.filter((user) => user.role === "MANAGER" || user.role === "ADMIN"), [managers]);

  const load = async () => {
    try {
      setLoading(true);
      const [departmentList, userPage] = await Promise.all([
        departmentsApi.list(),
        usersApi.list({ page: 0, size: 100 }),
      ]);
      setDepartments(departmentList);
      setManagers(userPage.content);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load departments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingDepartment(null);
    setForm(emptyDepartmentForm);
    setDialogOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditingDepartment(department);
    setForm({
      name: department.name,
      description: department.description ?? "",
      managerId: department.manager?.id ? String(department.manager.id) : "",
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        managerId: form.managerId ? Number(form.managerId) : null,
      };

      if (editingDepartment) {
        await departmentsApi.update(editingDepartment.id, payload);
        toast.success("Department updated.");
      } else {
        await departmentsApi.create(payload);
        toast.success("Department created.");
      }
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save department."));
    }
  };

  const remove = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await departmentsApi.remove(deleteTarget.id);
      toast.success("Department deleted.");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete department."));
    }
  };

  if (loading) {
    return <PageLoader message="Loading departments..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage department structure and assign department managers."
        action={
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Add department
          </button>
        }
      />

      {departments.length === 0 ? (
        <EmptyState title="No departments yet" description="Create the first department to organize employees and managers." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <div key={department.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold">{department.name}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{department.description || "No description provided."}</p>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {department.employeeCount} employees
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                {department.manager ? (
                  <>
                    <Avatar name={department.manager.fullName} src={department.manager.profilePicture ?? undefined} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{department.manager.fullName}</p>
                      <p className="text-xs text-muted-foreground">Department manager</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No manager assigned</p>
                )}
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => openEdit(department)} className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground">
                  Edit
                </button>
                <button type="button" onClick={() => setDeleteTarget(department)} className="inline-flex items-center gap-2 rounded-xl border border-danger/20 px-3 py-2 text-sm font-medium text-danger">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalShell
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingDepartment ? "Edit department" : "Create department"}
      >
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Manager</span>
            <select value={form.managerId} onChange={(event) => setForm({ ...form, managerId: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5">
              <option value="">None</option>
              {managerOptions.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setDialogOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Save department
          </button>
        </div>
      </ModalShell>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete department"
        description={`Delete ${deleteTarget?.name ?? "this department"}?`}
        confirmLabel="Delete"
        onConfirm={() => void remove()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
