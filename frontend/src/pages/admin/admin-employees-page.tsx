import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { usersApi } from "@/api/users.api";
import { departmentsApi } from "@/api/departments.api";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ModalShell } from "@/components/ui/modal-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/http-error";
import type { Department, User } from "@/types/domain";
import type { Role } from "@/types/enums";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface UserFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  hireDate: string;
  role: Role;
  departmentId: string;
  managerId: string;
  active: boolean;
}

const emptyForm: UserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "ChangeMe123!",
  phone: "",
  hireDate: "",
  role: "EMPLOYEE",
  departmentId: "",
  managerId: "",
  active: true,
};

export function AdminEmployeesPage() {
  const [items, setItems] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");
  const [deptFilter, setDeptFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const managerOptions = useMemo(
    () => managers.filter((user) => user.role === "MANAGER" || user.role === "ADMIN"),
    [managers],
  );

  const load = async (requestedPage = page) => {
    try {
      setLoading(true);
      const [usersPage, departmentList, managerPage] = await Promise.all([
        usersApi.list({
          page: requestedPage,
          size: 10,
          search: search || undefined,
          dept: deptFilter ? Number(deptFilter) : undefined,
          role: roleFilter || undefined,
        }),
        departmentsApi.list(),
        usersApi.list({ page: 0, size: 100 }),
      ]);
      setItems(usersPage.content);
      setPage(usersPage.page);
      setTotalPages(usersPage.totalPages);
      setDepartments(departmentList);
      setManagers(managerPage.content);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load employees."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0);
  }, [search, roleFilter, deptFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "ChangeMe123!",
      phone: user.phone ?? "",
      hireDate: user.hireDate ?? "",
      role: user.role,
      departmentId: user.department?.id ? String(user.department.id) : "",
      managerId: user.manager?.id ? String(user.manager.id) : "",
      active: user.active,
    });
    setEditorOpen(true);
  };

  const submit = async () => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          hireDate: form.hireDate || null,
          role: form.role,
          departmentId: form.departmentId ? Number(form.departmentId) : null,
          managerId: form.managerId ? Number(form.managerId) : null,
          active: form.active,
        });
        toast.success("Employee updated.");
      } else {
        await usersApi.create({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          hireDate: form.hireDate || null,
          role: form.role,
          departmentId: form.departmentId ? Number(form.departmentId) : null,
          managerId: form.managerId ? Number(form.managerId) : null,
        });
        toast.success("Employee created.");
      }
      setEditorOpen(false);
      await load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save employee."));
    }
  };

  const resetPassword = async (user: User) => {
    try {
      await usersApi.resetPassword(user.id, "ChangeMe123!");
      toast.success(`Password reset for ${user.fullName}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reset password."));
    }
  };

  const remove = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await usersApi.remove(deleteTarget.id);
      toast.success("Employee deactivated.");
      setDeleteTarget(null);
      await load(page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete employee."));
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.fullName} src={row.original.profilePicture ?? undefined} size="sm" />
            <div>
              <p className="font-medium">{row.original.fullName}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Department",
        cell: ({ row }) => row.original.department?.name ?? "Unassigned",
      },
      {
        header: "Role",
        cell: ({ row }) => row.original.role,
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${row.original.active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
            {row.original.active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/admin/employees/${row.original.id}`}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => openEdit(row.original)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => void resetPassword(row.original)}
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent"
            >
              Reset password
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="rounded-lg border border-danger/20 px-2.5 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10"
            >
              Deactivate
            </button>
          </div>
        ),
      },
    ],
    [items],
  );

  if (loading && items.length === 0) {
    return <PageLoader message="Loading employees..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Employees"
        description="Create, edit, review, and deactivate user accounts."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add employee
          </button>
        }
      />

      <div className="glass-card grid gap-4 p-5 md:grid-cols-[1.2fr_0.7fr_0.7fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
              className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Role</span>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as "" | Role)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Department</span>
          <select
            value={deptFilter}
            onChange={(event) => setDeptFilter(event.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No employees found" description="Adjust the filters or create a new employee." />
      ) : (
        <>
          <DataTable data={items} columns={columns} />
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrevious={() => void load(Math.max(0, page - 1))}
            onNext={() => void load(page + 1)}
          />
        </>
      )}

      <ModalShell
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingUser ? "Edit employee" : "Create employee"}
        description="Manage employee identity, role, department, and reporting line."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">First name</span>
            <input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Last name</span>
            <input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Email</span>
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          {!editingUser ? (
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Initial password</span>
              <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
            </label>
          ) : null}
          <label className="space-y-2">
            <span className="text-sm font-medium">Phone</span>
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Hire date</span>
            <input type="date" value={form.hireDate} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Role</span>
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Department</span>
            <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5">
              <option value="">None</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Manager</span>
            <select value={form.managerId} onChange={(event) => setForm({ ...form, managerId: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5">
              <option value="">None</option>
              {managerOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>
          {editingUser ? (
            <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Active account
            </label>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {editingUser ? "Save changes" : "Create employee"}
          </button>
        </div>
      </ModalShell>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Deactivate employee"
        description={`Deactivate ${deleteTarget?.fullName ?? "this employee"}? Their account will be marked inactive.`}
        confirmLabel="Deactivate"
        onConfirm={() => void remove()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
