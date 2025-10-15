import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";

import EducationReviewPanel from "@/components/review/EducationReviewPanel";
import CertificationReviewPanel from "@/components/review/CertificationReviewPanel";
import InternshipReviewPanel from "@/components/review/InternshipReviewPanel";
import WorkExperienceReviewPanel from "@/components/review/WorkExperienceReviewPanel";
import ProjectsReviewPanel from "@/components/review/ProjectsReviewPanel";
import TechnicalProfilesReviewPanel from "@/components/review/TechnicalProfilesReviewPanel";
import SocialResumeReviewPanel from "@/components/review/SocialResumeReviewPanel";

type SectionProps = {
  title: string;
  icon: string | React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
};

const ReviewSection = ({ title, icon, children, defaultOpen = false }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg p-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {open ? "Hide" : "Review and Edit"}
        </Button>
      </div>
      {open && children && (
        <div className="mt-4 pt-4 border-t border-border">{children}</div>
      )}
    </div>
  );
};

const ReviewCard = ({ showSubmit = true }: { showSubmit?: boolean }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md w-full p-8 text-center mx-auto fade-in">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-20 h-20 text-success" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Submission Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your Skill Wallet has been submitted for admin validation. You'll be notified once it's approved.
        </p>
        <Button onClick={() => navigate("/home")} className="w-full">
          Return to Home
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 fade-in">
      <h1 className="text-3xl font-bold mb-2">Review & Submit</h1>
      <p className="text-muted-foreground mb-8">
        Please review all your information before submitting
      </p>

      <div className="space-y-6 mb-8">
        <ReviewSection title="Education" icon="🎓" defaultOpen>
          <EducationReviewPanel />
        </ReviewSection>

        <ReviewSection title="Certifications" icon="📜">
          <CertificationReviewPanel />
        </ReviewSection>

        <ReviewSection title="Internships" icon="👩‍💼">
          <InternshipReviewPanel />
        </ReviewSection>

        <ReviewSection title="Work Experience" icon="💼">
          <WorkExperienceReviewPanel />
        </ReviewSection>

        <ReviewSection title="Projects" icon="🌐">
          <ProjectsReviewPanel />
        </ReviewSection>

        <ReviewSection title="Technical Profiles" icon="⚙️">
          <TechnicalProfilesReviewPanel />
        </ReviewSection>

        <ReviewSection title="Social & Resume" icon="📄">
          <SocialResumeReviewPanel />
        </ReviewSection>
      </div>

      {showSubmit && (
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate("/wizard")} className="flex-1">
            Back to Edit
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Validation"
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ReviewCard;
