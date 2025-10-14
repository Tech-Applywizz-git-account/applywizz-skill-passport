import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Copy, X, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockJobs, mockCandidates, calculateMatchScore } from "@/data/mockData";
import CandidateRow from "@/components/hr/CandidateRow";
import { useToast } from "@/hooks/use-toast";

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("candidates");

  const job = mockJobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Job not found</h2>
          <Button onClick={() => navigate("/jobs")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  // Calculate match scores for candidates
  const candidatesWithScores = mockCandidates.map((candidate) => ({
    candidate,
    matchScore: calculateMatchScore(candidate, job),
  })).sort((a, b) => b.matchScore - a.matchScore);

  const handleQuickView = (candidateId: string) => {
    toast({
      title: "Quick View",
      description: "Opening candidate details...",
    });
  };

  const handleShortlist = (candidateName: string) => {
    toast({
      title: "Shortlisted",
      description: `${candidateName} has been added to shortlist`,
    });
  };

  const handleReject = (candidateName: string) => {
    toast({
      title: "Rejected",
      description: `${candidateName} has been removed from consideration`,
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-success/10 text-success border-success/20";
      case "Closed":
        return "bg-muted text-muted-foreground border-border";
      case "Draft":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Jobs
          </button>

          {/* Title & Meta */}
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{job.location}</span>
                <span>·</span>
                <span>{job.seniority}</span>
                <span>·</span>
                <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                <span>·</span>
                <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidates">
                Candidates ({candidatesWithScores.length})
              </TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="activity">Notes & Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab}>
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* JD Preview */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Job Description</h3>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.jd}
                </p>
              </div>

              {/* Key Skills */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Key Skills</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Must-have</p>
                    <div className="flex flex-wrap gap-2">
                      {job.mustHaveSkills.map((skill) => (
                        <Badge key={skill} className="bg-primary/10 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Nice-to-have</p>
                    <div className="flex flex-wrap gap-2">
                      {job.niceHaveSkills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Settings */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Role Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{job.experienceRange} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Type</span>
                    <span className="font-medium">{job.workType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{job.department}</span>
                  </div>
                </div>
              </div>

              {/* Weights Panel */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Matching Weights</h3>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Must-have Skills</span>
                    <span className="font-medium">{job.weights.mustHave}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nice-to-have Skills</span>
                    <span className="font-medium">{job.weights.niceHave}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{job.weights.experience}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-medium">{job.weights.projects}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assessments</span>
                    <span className="font-medium">{job.weights.assessments}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{job.weights.availability}%</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-muted-foreground">Verified Bonus</span>
                    <span className="font-medium text-success">+{job.weights.verifiedBonus}%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6 mt-6">
            {/* Filters & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {job.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="gap-1">
                    {keyword}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm">
                  + Add keyword
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Recalculate</Button>
                <Button variant="outline" size="sm">Bulk Actions</Button>
              </div>
            </div>

            {/* Candidate List */}
            <div className="space-y-4">
              {candidatesWithScores.map(({ candidate, matchScore }) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  matchScore={matchScore}
                  onQuickView={() => handleQuickView(candidate.id)}
                  onShortlist={() => handleShortlist(candidate.name)}
                  onReject={() => handleReject(candidate.name)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="mt-6">
            <div className="bg-card border rounded-lg p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">Pipeline View</h3>
              <p className="text-muted-foreground">
                Kanban board with drag-and-drop functionality coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="bg-card border rounded-lg p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">Notes & Activity</h3>
              <p className="text-muted-foreground">
                Activity timeline and notes panel coming soon
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-card border rounded-lg p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">Job Settings</h3>
              <p className="text-muted-foreground">
                Auto-screen rules, email templates, and export options coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobDetails;
