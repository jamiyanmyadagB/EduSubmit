/**
 * EduSubmit Admin Dashboard
 * Features: System Stats, User Management, Audit Logs, Monitoring Charts, Alerts
 * Route: /admin
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  GraduationCap,
  LogOut,
  Users,
  FileText,
  TrendingUp,
  Activity,
  Database,
  Shield,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity as ActivityIcon,
  Download,
  Bell,
  Server,
  HardDrive,
  Wifi,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [userFilter, setUserFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [createError, setCreateError] = useState("");

  const utils = trpc.useUtils();

  // ─── API Queries ───
  const { data: statsData, isLoading: statsLoading } = trpc.admin.getStats.useQuery();

  const { data: usersData, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(
    { role: userFilter as "ALL" | "STUDENT" | "TEACHER" | "ADMIN", search: userSearch || undefined },
    { enabled: activeTab === "users" }
  );

  const { data: auditData, isLoading: auditLoading } = trpc.admin.getAuditLogs.useQuery(
    undefined,
    { enabled: activeTab === "audit" }
  );

  const { data: alertsData } = trpc.admin.getAlerts.useQuery(undefined, {
    enabled: activeTab === "overview",
  });

  // ─── Mutations ───
  const createUser = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      utils.admin.getUsers.invalidate();
      utils.admin.getStats.invalidate();
      setShowCreateUser(false);
      resetCreateForm();
    },
    onError: (err) => {
      setCreateError(err.message);
    },
  });

  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      utils.admin.getUsers.invalidate();
      utils.admin.getStats.invalidate();
    },
  });

  function resetCreateForm() {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("STUDENT");
    setCreateError("");
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setCreateError("All fields are required");
      return;
    }
    createUser.mutate({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
    });
  }

  function exportAuditLogs() {
    const logs = auditData?.data || [];
    const csv = [
      ["Time", "User", "Action", "Entity Type", "Entity ID", "IP Address", "Details"].join(","),
      ...logs.map((l) => [
        l.timestamp ? new Date(l.timestamp).toISOString() : "",
        l.userName || "System",
        l.action,
        l.entityType || "",
        l.entityId?.toString() || "",
        l.ipAddress || "",
        `"${(l.details || "").replace(/"/g, '\"')}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = statsData?.data;
  const userInitials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  // Chart data
  const userRoleData = stats ? [
    { name: "Students", value: stats.totalStudents },
    { name: "Teachers", value: stats.totalTeachers },
    { name: "Admins", value: (stats.totalUsers || 0) - stats.totalStudents - stats.totalTeachers },
  ] : [];

  const activityData = [
    { name: "Mon", submissions: 12, grades: 8 },
    { name: "Tue", submissions: 19, grades: 15 },
    { name: "Wed", submissions: 15, grades: 12 },
    { name: "Thu", submissions: 25, grades: 20 },
    { name: "Fri", submissions: 22, grades: 18 },
    { name: "Sat", submissions: 8, grades: 5 },
    { name: "Sun", submissions: 5, grades: 3 },
  ];

  const apiMetricsData = [
    { name: "00:00", requests: 120, errors: 2 },
    { name: "04:00", requests: 80, errors: 1 },
    { name: "08:00", requests: 350, errors: 5 },
    { name: "12:00", requests: 520, errors: 8 },
    { name: "16:00", requests: 480, errors: 6 },
    { name: "20:00", requests: 300, errors: 3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg">EduSubmit</span>
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Online
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{userInitials}</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2"><Activity className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="audit" className="gap-2"><Shield className="w-4 h-4" /> Audit Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {statsLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28" />)
              ) : stats ? (
                <>
                  <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{stats.totalUsers}</p></div><Users className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Today</p><p className="text-2xl font-bold">{stats.todayActiveUsers}</p></div><Activity className="w-8 h-8 text-green-500" /></div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Assignments</p><p className="text-2xl font-bold">{stats.totalAssignments}</p></div><FileText className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Submissions</p><p className="text-2xl font-bold">{stats.totalSubmissions}</p></div><TrendingUp className="w-8 h-8 text-amber-500" /></div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">System Health</p><p className="text-2xl font-bold text-green-600">{stats.systemHealth}%</p></div><Server className="w-8 h-8 text-green-500" /></div></CardContent></Card>
                  <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Storage Used</p><p className="text-2xl font-bold">{stats.storageUsed} MB</p></div><HardDrive className="w-8 h-8 text-slate-500" /></div></CardContent></Card>
                </>
              ) : null}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Weekly Activity</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="submissions" fill="#3b82f6" name="Submissions" />
                      <Bar dataKey="grades" fill="#10b981" name="Grades" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">User Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {userRoleData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* API Metrics */}
            <Card>
              <CardHeader><CardTitle className="text-base">API Request Rate (24h)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={apiMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#3b82f6" name="Requests/min" />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
              {alertsData?.data ? (
                <div className="space-y-3">
                  {alertsData.data.map((alert) => (
                    <Alert key={alert.id} variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "default" : "default"} className={alert.severity === "warning" ? "border-amber-200 bg-amber-50" : alert.severity === "info" ? "border-blue-200 bg-blue-50" : ""}>
                      <div className="flex items-center gap-2">
                        {alert.severity === "critical" ? <AlertCircle className="h-4 w-4 text-red-600" /> : alert.severity === "warning" ? <AlertCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-blue-600" />}
                        <AlertDescription className="flex-1">
                          <span className="font-medium">{alert.title}:</span> {alert.message}
                          <span className="text-xs text-muted-foreground ml-2">
                            {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : ""}
                          </span>
                        </AlertDescription>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline">Acknowledge</Button>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <Alert><AlertDescription>No active alerts</AlertDescription></Alert>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name or email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowCreateUser(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>

            {usersLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : usersData?.data && usersData.data.length > 0 ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Last Login</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.data.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3"><Badge variant={u.role === "ADMIN" ? "destructive" : u.role === "TEACHER" ? "default" : "secondary"}>{u.role}</Badge></td>
                        <td className="p-3"><Badge variant={u.status === "ACTIVE" ? "outline" : "secondary"}>{u.status}</Badge></td>
                        <td className="p-3 text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            {u.status === "ACTIVE" ? (
                              <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => updateUser.mutate({ id: u.id, status: "INACTIVE" })}>Suspend</Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateUser.mutate({ id: u.id, status: "ACTIVE" })}>Activate</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert><AlertDescription>No users found.</AlertDescription></Alert>
            )}
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Audit Logs</h3>
              <Button variant="outline" onClick={exportAuditLogs} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            {auditLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : auditData?.data && auditData.data.length > 0 ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Action</th>
                      <th className="text-left p-3 font-medium">Entity</th>
                      <th className="text-left p-3 font-medium">IP</th>
                      <th className="text-left p-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditData.data.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-muted-foreground">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}</td>
                        <td className="p-3">{log.userName || "System"}</td>
                        <td className="p-3"><Badge variant="outline">{log.action}</Badge></td>
                        <td className="p-3">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</td>
                        <td className="p-3 text-muted-foreground">{log.ipAddress || "N/A"}</td>
                        <td className="p-3 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert><AlertDescription>No audit logs found.</AlertDescription></Alert>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            {createError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{createError}</AlertDescription></Alert>}
            <div className="space-y-2"><Label>Name *</Label><Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@example.com" /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Min 3 characters" /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as "STUDENT" | "TEACHER" | "ADMIN")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="STUDENT">Student</SelectItem><SelectItem value="TEACHER">Teacher</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={createUser.isPending} className="flex-1">{createUser.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create User"}</Button>
              <Button type="button" variant="outline" onClick={() => { resetCreateForm(); setShowCreateUser(false); }}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
