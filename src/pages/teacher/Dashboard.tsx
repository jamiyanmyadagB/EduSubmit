/**
 * EduSubmit Teacher Dashboard
 * Features: Stats, Create Assignments, View Submissions, Grading Panel, Exam Management
 * Route: /teacher
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  LogOut,
  Bell,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  Award,
  Eye,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  ChevronLeft,
  Save,
  Send,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateExamForm, setShowCreateExamForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [editAssignment, setEditAssignment] = useState<number | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formMaxScore, setFormMaxScore] = useState("100");
  const [formDifficulty, setFormDifficulty] = useState("MEDIUM");
  const [formFileTypes, setFormFileTypes] = useState({ pdf: true, docx: true, zip: false });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const utils = trpc.useUtils();

  // ─── API Queries ───
  const { data: myAssignments, isLoading: assignmentsLoading } =
    trpc.assignment.getByTeacher.useQuery(
      { teacherId: user?.id ?? 0 },
      { enabled: !!user?.id }
    );

  const { data: submissionsData, isLoading: submissionsLoading } =
    trpc.submission.getByAssignment.useQuery(
      { assignmentId: selectedAssignment ?? 0 },
      { enabled: selectedAssignment !== null }
    );

  const { data: examsData, isLoading: examsLoading } =
    trpc.exam.getAll.useQuery();

  const { data: pendingData } =
    trpc.submission.getPending.useQuery();

  const { data: notificationsData } =
    trpc.notification.unreadCount.useQuery(undefined, { refetchInterval: 30000 });

  // ─── Mutations ───
  const createAssignment = trpc.assignment.create.useMutation({
    onSuccess: () => {
      utils.assignment.getByTeacher.invalidate();
      resetForm();
      setShowCreateForm(false);
    },
    onError: (err) => {
      setFormError(err.message);
      setFormSubmitting(false);
    },
  });

  const deleteAssignment = trpc.assignment.delete.useMutation({
    onSuccess: () => {
      utils.assignment.getByTeacher.invalidate();
    },
  });

  const createGrade = trpc.grade.create.useMutation({
    onSuccess: () => {
      setSelectedSubmission(null);
      setGradeValue("");
      setGradeFeedback("");
      utils.submission.getByAssignment.invalidate();
      utils.submission.getPending.invalidate();
    },
  });

  const createExam = trpc.exam.create.useMutation({
    onSuccess: () => {
      utils.exam.getAll.invalidate();
      setShowCreateExamForm(false);
      resetExamForm();
    },
  });

  const deleteExam = trpc.exam.delete.useMutation({
    onSuccess: () => {
      utils.exam.getAll.invalidate();
    },
  });

  // ─── Stats ───
  const stats = {
    totalAssignments: myAssignments?.data?.length || 0,
    totalSubmissions: myAssignments?.data?.reduce((sum, a) => sum + (a.submissionCount ? Number(a.submissionCount) : 0), 0) || 0,
    pendingGrading: pendingData?.data?.length || 0,
    avgScore: 0,
  };

  // ─── Form Handlers ───
  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormSubject("");
    setFormInstructions("");
    setFormDueDate("");
    setFormMaxScore("100");
    setFormDifficulty("MEDIUM");
    setFormFileTypes({ pdf: true, docx: true, zip: false });
    setFormSubmitting(false);
    setFormError("");
  }

  function resetExamForm() {
    setFormTitle("");
    setFormDescription("");
    setFormSubject("");
    setFormDueDate("");
  }

  function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!formTitle || !formDescription || !formSubject || !formDueDate) {
      setFormError("Please fill in all required fields");
      return;
    }

    const types: string[] = [];
    if (formFileTypes.pdf) types.push("pdf");
    if (formFileTypes.docx) types.push("docx");
    if (formFileTypes.zip) types.push("zip");

    setFormSubmitting(true);
    createAssignment.mutate({
      title: formTitle,
      description: formDescription,
      subject: formSubject,
      instructions: formInstructions,
      dueDate: new Date(formDueDate).toISOString(),
      maxScore: parseInt(formMaxScore),
      difficulty: formDifficulty as "EASY" | "MEDIUM" | "HARD",
      allowedFileTypes: types.join(","),
    });
  }

  function handleGradeSubmit() {
    if (!selectedSubmission || !gradeValue) return;
    createGrade.mutate({
      submissionId: selectedSubmission,
      score: parseInt(gradeValue),
      feedback: gradeFeedback,
    });
  }

  const selectedSubmissionData = submissionsData?.data?.find(
    (s) => s.id === selectedSubmission
  );

  const userInitials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">EduSubmit</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {notificationsData?.data?.count ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationsData.data.count}
                </span>
              ) : null}
            </button>
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
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="assignments" className="gap-2">
                <FileText className="w-4 h-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-2">
                <Calendar className="w-4 h-4" />
                Exams
              </TabsTrigger>
            </TabsList>

            {activeTab === "assignments" && (
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Assignment
              </Button>
            )}
            {activeTab === "exams" && (
              <Button onClick={() => setShowCreateExamForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Exam
              </Button>
            )}
          </div>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Assignments</p><p className="text-2xl font-bold">{stats.totalAssignments}</p></div><FileText className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Submissions</p><p className="text-2xl font-bold">{stats.totalSubmissions}</p></div><Users className="w-8 h-8 text-green-500" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Grade</p><p className="text-2xl font-bold">{stats.pendingGrading}</p></div><Clock className="w-8 h-8 text-amber-500" /></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avg Score</p><p className="text-2xl font-bold">{stats.avgScore || "N/A"}</p></div><TrendingUp className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
            </div>

            {/* My Assignments */}
            {assignmentsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
            ) : myAssignments?.data && myAssignments.data.length > 0 ? (
              <div className="grid gap-4">
                {myAssignments.data.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{assignment.title}</h3>
                            <Badge variant={assignment.status === "ACTIVE" ? "default" : "secondary"}>{assignment.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{assignment.subject} | Max: {assignment.maxScore}</p>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{assignment.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => setSelectedAssignment(assignment.id)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Submissions
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm("Delete this assignment?")) deleteAssignment.mutate({ id: assignment.id }); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert><AlertDescription>No assignments created yet.</AlertDescription></Alert>
            )}
          </TabsContent>

          {/* Submissions Detail View */}
          {selectedAssignment !== null && (
            <div className="mb-6">
              <Button variant="ghost" onClick={() => { setSelectedAssignment(null); setSelectedSubmission(null); }} className="mb-4 gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Assignments
              </Button>

              {submissionsLoading ? (
                <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
              ) : submissionsData?.data && submissionsData.data.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Submissions ({submissionsData.data.length})
                  </h3>
                  <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">Submitted</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">AI Score</th>
                          <th className="text-left p-3 font-medium">Plagiarism</th>
                          <th className="text-right p-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionsData.data.map((sub) => (
                          <tr key={sub.id} className="border-b hover:bg-slate-50">
                            <td className="p-3">{sub.studentName}</td>
                            <td className="p-3">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}</td>
                            <td className="p-3"><Badge variant={sub.status === "GRADED" ? "default" : "secondary"}>{sub.status}</Badge></td>
                            <td className="p-3">{sub.aiScore ?? "-"}</td>
                            <td className="p-3">
                              {sub.plagiarismScore ? (
                                <span className={`font-medium ${Number(sub.plagiarismScore) > 40 ? "text-red-500" : Number(sub.plagiarismScore) > 20 ? "text-amber-500" : "text-green-500"}`}>
                                  {sub.plagiarismScore}%
                                </span>
                              ) : "-"}
                            </td>
                            <td className="p-3 text-right">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedSubmission(sub.id); setGradeValue(""); setGradeFeedback(""); }}>
                                <Award className="w-4 h-4 mr-1" />
                                Grade
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <Alert><AlertDescription>No submissions for this assignment yet.</AlertDescription></Alert>
              )}
            </div>
          )}

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            {examsLoading ? (
              <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
            ) : examsData?.data && examsData.data.length > 0 ? (
              <div className="grid gap-4">
                {examsData.data.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{exam.title}</h3>
                            <Badge variant="outline">{exam.examType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{exam.subject}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                            <span>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "N/A"}</span>
                            <span>{exam.durationMinutes} min</span>
                            {exam.venue && <span>{exam.venue}</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (confirm("Delete this exam?")) deleteExam.mutate({ id: exam.id }); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert><AlertDescription>No exams scheduled.</AlertDescription></Alert>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            {formError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
            <div className="space-y-2"><Label>Title *</Label><Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Assignment title" /></div>
            <div className="space-y-2"><Label>Description *</Label><Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Brief description" /></div>
            <div className="space-y-2"><Label>Subject *</Label><Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="e.g., Computer Science" /></div>
            <div className="space-y-2"><Label>Instructions</Label><Textarea value={formInstructions} onChange={(e) => setFormInstructions(e.target.value)} placeholder="Detailed instructions for students" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Due Date *</Label><Input type="datetime-local" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Max Score</Label><Input type="number" value={formMaxScore} onChange={(e) => setFormMaxScore(e.target.value)} min="1" max="1000" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Allowed File Types</Label><div className="flex gap-4 pt-2"><label className="flex items-center gap-2 text-sm"><Checkbox checked={formFileTypes.pdf} onCheckedChange={(c) => setFormFileTypes((p) => ({ ...p, pdf: !!c }))} /> PDF</label><label className="flex items-center gap-2 text-sm"><Checkbox checked={formFileTypes.docx} onCheckedChange={(c) => setFormFileTypes((p) => ({ ...p, docx: !!c }))} /> DOCX</label><label className="flex items-center gap-2 text-sm"><Checkbox checked={formFileTypes.zip} onCheckedChange={(c) => setFormFileTypes((p) => ({ ...p, zip: !!c }))} /> ZIP</label></div></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={formSubmitting} className="flex-1">{formSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : <><Plus className="w-4 h-4 mr-2" />Create Assignment</>}</Button>
              <Button type="button" variant="outline" onClick={() => { resetForm(); setShowCreateForm(false); }}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Exam Dialog */}
      <Dialog open={showCreateExamForm} onOpenChange={setShowCreateExamForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
          <ExamForm onSubmit={(data) => createExam.mutate(data)} onCancel={() => { resetExamForm(); setShowCreateExamForm(false); }} />
        </DialogContent>
      </Dialog>

      {/* Grading Panel Dialog */}
      <Dialog open={selectedSubmission !== null} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Grade Submission</DialogTitle></DialogHeader>
          {selectedSubmissionData && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium">{selectedSubmissionData.studentName}</p>
                <p className="text-xs text-muted-foreground">Submitted: {selectedSubmissionData.submittedAt ? new Date(selectedSubmissionData.submittedAt).toLocaleDateString() : "N/A"}</p>
                <p className="text-xs text-muted-foreground">File: {selectedSubmissionData.fileName}</p>
              </div>

              {selectedSubmissionData.aiScore && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">AI Score: {selectedSubmissionData.aiScore}</Badge>
                  {selectedSubmissionData.plagiarismScore && (
                    <Badge variant={Number(selectedSubmissionData.plagiarismScore) > 40 ? "destructive" : Number(selectedSubmissionData.plagiarismScore) > 20 ? "secondary" : "default"}>
                      Plagiarism: {selectedSubmissionData.plagiarismScore}%
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Grade (0-{myAssignments?.data?.find((a) => a.id === selectedAssignment)?.maxScore || 100}) *</Label>
                <Input type="number" value={gradeValue} onChange={(e) => setGradeValue(e.target.value)} placeholder="Enter score" min="0" />
              </div>

              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} placeholder="Provide feedback to the student" />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGradeSubmit} disabled={createGrade.isPending || !gradeValue} className="flex-1">
                  {createGrade.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Publishing...</> : <><Send className="w-4 h-4 mr-2" />Publish Grade</>}
                </Button>
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Exam Form Component */
function ExamForm({ onSubmit, onCancel }: { onSubmit: (data: { title: string; subject: string; examType: "WRITTEN" | "MCQ" | "PRACTICAL" | "VIVA"; examDate: string; durationMinutes: number; venue?: string; syllabus?: string; instructions?: string }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState<"WRITTEN" | "MCQ" | "PRACTICAL" | "VIVA">("WRITTEN");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("120");
  const [venue, setVenue] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title || !subject || !examDate || !duration) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    onSubmit({
      title,
      subject,
      examType,
      examDate: new Date(examDate).toISOString(),
      durationMinutes: parseInt(duration),
      venue: venue || undefined,
      syllabus: syllabus || undefined,
      instructions: instructions || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam title" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Subject *</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" /></div>
        <div className="space-y-2"><Label>Type *</Label>
          <Select value={examType} onValueChange={(v) => setExamType(v as typeof examType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="WRITTEN">Written</SelectItem><SelectItem value="MCQ">MCQ</SelectItem><SelectItem value="PRACTICAL">Practical</SelectItem><SelectItem value="VIVA">Viva</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Date & Time *</Label><Input type="datetime-local" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
        <div className="space-y-2"><Label>Duration (min) *</Label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="15" max="300" /></div>
      </div>
      <div className="space-y-2"><Label>Venue</Label><Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g., Hall A" /></div>
      <div className="space-y-2"><Label>Syllabus</Label><Textarea value={syllabus} onChange={(e) => setSyllabus(e.target.value)} placeholder="Topics covered" /></div>
      <div className="space-y-2"><Label>Instructions</Label><Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions for students" /></div>
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting} className="flex-1">{submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : <><Plus className="w-4 h-4 mr-2" />Create Exam</>}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
