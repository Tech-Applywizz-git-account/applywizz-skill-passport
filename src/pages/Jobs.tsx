import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Building2, MapPin, Calendar, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockJobs } from "@/data/mockData";

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your open positions and find the right candidates
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Job
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search title, location, team…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first job posting to get started"}
              </p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Left - Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span>·</span>
                        <span>{job.seniority}</span>
                        <span>·</span>
                        <span>{job.department}</span>
                        <span>·</span>
                        <span className="capitalize">{job.workType}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Posted {new Date(job.postedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        Last activity {job.lastActivity}
                      </span>
                    </div>
                  </div>

                  {/* Right - Stats */}
                  <div className="flex flex-col md:flex-row gap-6 items-end md:items-center">
                    <div className="text-center min-w-[100px]">
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        {job.applicants}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Applicants</div>
                    </div>

                    <div className="text-center min-w-[100px]">
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        {job.avgMatch}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Avg Match</div>
                    </div>

                    <div className="text-center min-w-[120px]">
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.closeDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Close Date</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
