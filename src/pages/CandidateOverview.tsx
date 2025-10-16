//src/pages/CandidateOverview.tsx

import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, Star, Mail, Phone, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CandidateSummaryCard } from "@/components/candidate/CandidateSummaryCard";
import { MatchBreakdown } from "@/components/candidate/MatchBreakdown";
import { SectionGrid } from "@/components/candidate/SectionGrid";
import { DetailModal } from "@/components/candidate/DetailModal";
import { candidateData } from "../data/candidateData";

const CandidateOverview = () => {
  const { jobId, candidateId } = useParams();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const candidate = candidateData;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-subtle">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back + Breadcrumb */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-muted"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Candidates
              </Button>
              <div className="hidden md:flex items-center gap-2 text-sm text-secondary">
                <span>Jobs</span>
                <span>→</span>
                <span>Senior Full Stack Developer</span>
                <span>→</span>
                <span className="text-foreground font-medium">
                  {candidate.name}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
              <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary-hover text-primary-foreground">
                <Star className="h-4 w-4" />
                Shortlist
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-error text-error hover:bg-error/10">
                Reject
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Summary Card (Sticky) */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <CandidateSummaryCard candidate={candidate} />
            </div>
          </aside>

          {/* Right Column - Details */}
          <section className="lg:col-span-8 space-y-6">
            {/* Match Breakdown */}
            <MatchBreakdown breakdown={candidate.matchBreakdown} />

            {/* Section Grid */}
            <SectionGrid
              sections={candidate.sections}
              onSectionClick={setSelectedSection}
            />
          </section>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedSection && (
        <DetailModal
          section={selectedSection}
          candidate={candidate}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </div>
  );
};

export default CandidateOverview;
