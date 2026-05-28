/**
 * EduSubmit Student Dashboard
 * Features: Stats, Upcoming Assignments, File Upload, AI Help, Exam Schedule, Grades
 * Route: /student
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  LogOut,
  Bell,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Upload,
  Send,
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  Award,
  MessageSquare,
  User,
  Inbox,
  Eye,
} from "lucide-react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("assignments");

  const utils = trpc.useUtils();

  // ─── API Queries ───
  const { data: assignmentsData, isLoading: assignmentsLoading } =
    trpc.assignment.getActiveForStudent.useQuery();

  const { data: submissionsData, isLoading: submissionsLoading } =
    trpc.submission.getByStudent.useQuery(
      { studentId: user?.id ?? 0 },
      { enabled: !!user?.id }
    );

  const { data: examsData, isLoading: examsLoading } =
    trpc.exam.getUpcoming.useQuery();

  const { data: gradesData, isLoading: gradesLoading } =
    trpc.grade.getByStudent.useQuery(
      { studentId: user?.id ?? 0 },
      { enabled: !!user?.id }
    );

  const { data: notificationsData } =
    trpc.notification.unreadCount.useQuery(undefined, {
      refetchInterval: 30000,
    });

  const submitMutation = trpc.submission.create.useMutation({
    onSuccess: () => {
      setUploadSuccess("Assignment submitted successfully!");
      setFile(null);
      setUploading(false);
      utils.assignment.getActiveForStudent.invalidate();
      utils.submission.getByStudent.invalidate();
    },
    onError: (err) => {
      setUploadError(err.message);
      setUploading(false);
    },
  });

  const aiHelpMutation = trpc.ai.help.useMutation({
    onSuccess: (data) => {
      setAiResponse(data.data?.answer || "No response from AI.");
      setAiLoading(false);
    },
    onError: () => {
      setAiResponse("Sorry, I couldn't process your request. Please try again.");
      setAiLoading(false);
    },
  });

  // ─── Stats Calculation ───
  const stats = useMemo(() => {
    const allAssignments = assignmentsData?.data || [];
    const allSubmissions = submissionsData?.data || [];
    const allGrades = gradesData?.data || [];

    const submitted = allSubmissions.filter((s) => s.status === "SUBMITTED" || s.status === "GRADED");
    const graded = allSubmissions.filter((s) => s.status === "GRADED");

    const avgGrade = allGrades.length > 0
      ? Math.round(allGrades.reduce((sum, g) => sum + (g.score || 0), 0) / allGrades.length)
      : 0;

    return {
      totalAssignments: allAssignments.length,
      submittedCount: submitted.length,
      pendingCount: allAssignments.length - submitted.length,
      averageGrade: avgGrade,
    };
  }, [assignmentsData, submissionsData, gradesData]);

  // ─── File Upload Handler ───
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "docx", "zip"];
    if (!ext || !allowed.includes(ext)) {
      setUploadError(`Invalid file type. Allowed: ${allowed.join(", ")}`);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit");
      return;
    }

    setFile(selected);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleSubmit = async () => {
    if (!file || !selectedAssignment) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      submitMutation.mutate({
        assignmentId: selectedAssignment,
        fileBase64: base64,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  // ─── AI Help Handler ───
  const handleAiHelp = () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    aiHelpMutation.mutate({
      question: aiQuestion,
      assignmentId: selectedAssignment || undefined,
    });
  };

  const selectedAssignmentData = assignmentsData?.data?.find(
    (a) => a.id === selectedAssignment
  );

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="assignments" className="gap-2">
              <FileText className="w-4 h-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <Calendar className="w-4 h-4" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="grades" className="gap-2">
              <Award className="w-4 h-4" />
              My Grades
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-2xl font-bold">{stats.submittedCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pendingCount}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Grade</p>
                      <p className="text-2xl font-bold">{stats.averageGrade}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignments List */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Upcoming Assignments</h2>
              {assignmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : assignmentsData?.data && assignmentsData.data.length > 0 ? (
                <div className="grid gap-4">
                  {assignmentsData.data.map((assignment) => (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{assignment.title}</h3>
                              <Badge variant={assignment.hasSubmitted ? "default" : "secondary"}>
                                {assignment.hasSubmitted ? "Submitted" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {assignment.subject} | Max Score: {assignment.maxScore}
                            </p>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                              {assignment.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "N/A"}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {assignment.teacherName}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment.id);
                              setFile(null);
                              setUploadError("");
                              setUploadSuccess("");
                              setAiResponse("");
                              setAiQuestion("");
                            }}
                            disabled={assignment.hasSubmitted}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Inbox className="h-4 w-4" />
                  <AlertDescription>No upcoming assignments found.</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <h2 className="text-lg font-semibold">Upcoming Exams (Next 30 Days)</h2>
            {examsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
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
                          <p className="text-sm text-muted-foreground mb-2">{exam.subject}</p>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "N/A"}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {exam.durationMinutes} minutes
                            </span>
                            {exam.venue && (
                              <span className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-slate-400" />
                                {exam.venue}
                              </span>
                            )}
                          </div>
                          {exam.syllabus && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <strong>Syllabus:</strong> {exam.syllabus}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Inbox className="h-4 w-4" />
                <AlertDescription>No upcoming exams in the next 30 days.</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-4">
            <h2 className="text-lg font-semibold">My Grades</h2>
            {gradesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : gradesData?.data && gradesData.data.length > 0 ? (
              <div className="grid gap-4">
                {gradesData.data.map((grade) => (
                  <Card key={grade.id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{grade.assignmentTitle}</h3>
                          <p className="text-sm text-muted-foreground">{grade.assignmentSubject}</p>
                          {grade.feedback && (
                            <p className="text-sm text-slate-600 mt-2">
                              <strong>Feedback:</strong> {grade.feedback}
                            </p>
                          )}
                          {grade.comments && (
                            <p className="text-sm text-slate-600 mt-1">
                              <strong>Comments:</strong> {grade.comments}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {grade.score}
                            <span className="text-sm text-muted-foreground font-normal">
                              /{grade.assignmentMaxScore}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Inbox className="h-4 w-4" />
                <AlertDescription>No graded assignments yet.</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Assignment Details Dialog */}
      <Dialog
        open={selectedAssignment !== null}
        onOpenChange={() => {
          setSelectedAssignment(null);
          setFile(null);
          setUploadError("");
          setUploadSuccess("");
          setAiResponse("");
          setAiQuestion("");
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignmentData?.title}</DialogTitle>
          </DialogHeader>

          {selectedAssignmentData && (
            <div className="space-y-6">
              {/* Assignment Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedAssignmentData.subject} | Max Score: {selectedAssignmentData.maxScore}
                </p>
                <p className="text-sm text-slate-700 mb-3">{selectedAssignmentData.description}</p>
                {selectedAssignmentData.instructions && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">Instructions</p>
                    <p className="text-sm text-slate-700">{selectedAssignmentData.instructions}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline">Due: {selectedAssignmentData.dueDate ? new Date(selectedAssignmentData.dueDate).toLocaleDateString() : "N/A"}</Badge>
                  <Badge variant="outline">{selectedAssignmentData.difficulty}</Badge>
                </div>
              </div>

              <Separator />

              {/* File Upload */}
              {!selectedAssignmentData.hasSubmitted && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Submit Your Work</h4>
                  {uploadSuccess ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">{uploadSuccess}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-1">
                          {file ? file.name : "Drag & drop or click to upload"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          PDF, DOCX, ZIP only (max 10MB)
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.docx,.zip"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          {file ? "Change File" : "Select File"}
                        </Button>
                      </div>

                      {uploadError && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{uploadError}</AlertDescription>
                        </Alert>
                      )}

                      {file && (
                        <Button
                          className="w-full mt-3"
                          onClick={handleSubmit}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Submit Assignment
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}

              {selectedAssignmentData.hasSubmitted && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    You have already submitted this assignment.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* AI Help Section */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Help
                </h4>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ask about this assignment..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAiHelp}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="w-full"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                  {aiResponse && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-500 mb-1">AI Response:</p>
                      <p className="text-sm text-slate-700">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
