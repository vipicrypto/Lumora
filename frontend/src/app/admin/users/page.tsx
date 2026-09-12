"use client";

import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  ordersCount: number;
};

type UserOrder = {
  id: string;
  status: string;
  total: number;
};

type UserDetails = User & {
  orders: UserOrder[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] =
    useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] =
    useState(false);
  const [detailsError, setDetailsError] =
    useState("");

  const [roleConfirmUser, setRoleConfirmUser] =
    useState<User | null>(null);
  const [roleUpdating, setRoleUpdating] =
    useState(false);
  const [roleUpdateError, setRoleUpdateError] =
    useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load users.",
        );
      }

      setUsers(
        Array.isArray(data.users)
          ? data.users
          : [],
      );
    } catch (error) {
      console.error(
        "User management error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function viewUser(userId: string) {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedUser(null);

      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(userId)}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load user details.",
        );
      }

      setSelectedUser(data.user);
    } catch (error) {
      console.error(
        "User details error:",
        error,
      );

      setDetailsError(
        error instanceof Error
          ? error.message
          : "Unable to load user details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setSelectedUser(null);
    setDetailsError("");
    setDetailsLoading(false);
  }

  function openRoleConfirmation(user: User) {
    setRoleUpdateError("");
    setRoleConfirmUser(user);
  }

  function closeRoleConfirmation() {
    if (roleUpdating) {
      return;
    }

    setRoleConfirmUser(null);
    setRoleUpdateError("");
  }

  async function changeUserRole() {
    if (!roleConfirmUser) {
      return;
    }

    const user = roleConfirmUser;

    const nextRole =
      user.role === "ADMIN"
        ? "CUSTOMER"
        : "ADMIN";

    try {
      setRoleUpdating(true);
      setRoleUpdateError("");

      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: nextRole,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update user role.",
        );
      }

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                role: nextRole,
              }
            : item,
        ),
      );

      setSelectedUser((currentUser) =>
        currentUser &&
        currentUser.id === user.id
          ? {
              ...currentUser,
              role: nextRole,
            }
          : currentUser,
      );

      setRoleConfirmUser(null);
      setRoleUpdateError("");
    } catch (error) {
      console.error(
        "Role update error:",
        error,
      );

      setRoleUpdateError(
        error instanceof Error
          ? error.message
          : "Unable to update user role.",
      );
    } finally {
      setRoleUpdating(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        String(user.name ?? "")
          .toLowerCase()
          .includes(query) ||
        user.email
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const customerCount = users.filter(
    (user) => user.role === "CUSTOMER",
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "ADMIN",
  ).length;

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Management
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                User Management
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Manage registered customers and
                administrators.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                Total Users
              </p>

              <p className="mt-2 text-2xl font-semibold text-black">
                {users.length}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                Customers
              </p>

              <p className="mt-2 text-2xl font-semibold text-black">
                {customerCount}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                Administrators
              </p>

              <p className="mt-2 text-2xl font-semibold text-black">
                {adminCount}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name or email..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700 outline-none focus:border-neutral-400"
              >
                <option value="ALL">
                  All Roles
                </option>

                <option value="CUSTOMER">
                  Customers
                </option>

                <option value="ADMIN">
                  Administrators
                </option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Users table */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-black">
                  Registered Users
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  {filteredUsers.length} user
                  {filteredUsers.length === 1
                    ? ""
                    : "s"}{" "}
                  shown
                </p>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-neutral-500">
                  Loading users...
                </p>
              </div>
            ) : filteredUsers.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium text-neutral-700">
                  No users found.
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Try changing your search or
                  role filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Email
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Orders
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map(
                      (user) => (
                        <tr
                          key={user.id}
                          className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
                                {(
                                  user.name ||
                                  user.email
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-black">
                                  {user.name ||
                                    "Unnamed User"}
                                </p>

                                <p className="text-xs text-neutral-400">
                                  Lumora account
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-neutral-600">
                            {user.email}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                user.role ===
                                "ADMIN"
                                  ? "bg-black text-white"
                                  : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {user.role ===
                              "ADMIN"
                                ? "ADMIN"
                                : "CUSTOMER"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-neutral-700">
                            {user.ordersCount}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  viewUser(
                                    user.id,
                                  )
                                }
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-black hover:text-white"
                              >
                                View Details
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openRoleConfirmation(
                                    user,
                                  )
                                }
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                              >
                                Change Role
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {(selectedUser ||
        detailsLoading ||
        detailsError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDetails();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  User Details
                </p>

                <h2 className="mt-1 text-lg font-semibold text-black">
                  {selectedUser?.name ||
                    "User"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Loading */}
            {detailsLoading && (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-neutral-500">
                  Loading user details...
                </p>
              </div>
            )}

            {/* Error */}
            {!detailsLoading &&
              detailsError && (
                <div className="px-6 py-8">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {detailsError}
                  </div>
                </div>
              )}

            {/* Details */}
            {!detailsLoading &&
              !detailsError &&
              selectedUser && (
                <div className="p-6">
                  {/* Profile */}
                  <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-semibold text-black shadow-sm">
                        {(
                          selectedUser.name ||
                          selectedUser.email
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-black">
                          {selectedUser.name ||
                            "Unnamed User"}
                        </h3>

                        <p className="mt-1 break-all text-sm text-neutral-500">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-neutral-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          Role
                        </p>

                        <p className="mt-1 text-sm font-semibold text-black">
                          {selectedUser.role}
                        </p>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          Orders
                        </p>

                        <p className="mt-1 text-sm font-semibold text-black">
                          {
                            selectedUser.ordersCount
                          }
                        </p>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          User ID
                        </p>

                        <p className="mt-1 truncate font-mono text-xs text-neutral-600">
                          {selectedUser.id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          openRoleConfirmation(
                            selectedUser,
                          )
                        }
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 transition hover:bg-black hover:text-white"
                      >
                        Change Role
                      </button>
                    </div>
                  </div>

                  {/* Orders */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-black">
                        Orders
                      </h3>

                      <span className="text-xs text-neutral-400">
                        {
                          selectedUser.orders
                            .length
                        }{" "}
                        total
                      </span>
                    </div>

                    {selectedUser.orders
                      .length === 0 ? (
                      <div className="rounded-xl border border-neutral-200 px-5 py-8 text-center">
                        <p className="text-sm text-neutral-500">
                          No orders found for
                          this user.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-neutral-200">
                        <div className="divide-y divide-neutral-100">
                          {selectedUser.orders.map(
                            (order) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between gap-4 px-4 py-4"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-mono text-xs font-medium text-black">
                                    {order.id}
                                  </p>

                                  <p className="mt-1 text-xs text-neutral-400">
                                    Order
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-4">
                                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
                                    {order.status}
                                  </span>

                                  <span className="text-sm font-semibold text-black">
                                    ₹
                                    {order.total.toLocaleString(
                                      "en-IN",
                                    )}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Change Role Confirmation Modal */}
      {roleConfirmUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !roleUpdating
            ) {
              closeRoleConfirmation();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-neutral-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    Role Management
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-black">
                    Change User Role
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeRoleConfirmation
                  }
                  disabled={roleUpdating}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black shadow-sm">
                    {(
                      roleConfirmUser.name ||
                      roleConfirmUser.email
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-black">
                      {roleConfirmUser.name ||
                        "Unnamed User"}
                    </p>

                    <p className="truncate text-xs text-neutral-500">
                      {roleConfirmUser.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    roleConfirmUser.role ===
                    "ADMIN"
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {roleConfirmUser.role}
                </span>

                <span className="text-neutral-300">
                  →
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    roleConfirmUser.role ===
                    "ADMIN"
                      ? "bg-neutral-100 text-neutral-600"
                      : "bg-black text-white"
                  }`}
                >
                  {roleConfirmUser.role ===
                  "ADMIN"
                    ? "CUSTOMER"
                    : "ADMIN"}
                </span>
              </div>

              <p className="mt-5 text-center text-sm leading-6 text-neutral-500">
                Are you sure you want to change
                this user&apos;s role?
              </p>

              {roleConfirmUser.role ===
                "ADMIN" && (
                <p className="mt-2 text-center text-xs leading-5 text-neutral-400">
                  The user will lose administrator
                  access after this change.
                </p>
              )}

              {roleConfirmUser.role ===
                "CUSTOMER" && (
                <p className="mt-2 text-center text-xs leading-5 text-neutral-400">
                  The user will receive full
                  administrator access after this
                  change.
                </p>
              )}

              {roleUpdateError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {roleUpdateError}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={
                    closeRoleConfirmation
                  }
                  disabled={roleUpdating}
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={changeUserRole}
                  disabled={roleUpdating}
                  className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roleUpdating
                    ? "Updating..."
                    : "Confirm Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}