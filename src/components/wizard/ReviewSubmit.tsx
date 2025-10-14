//src/components/wizard/ReviewSubmit.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

const ReviewSubmit = () => {
  return (
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-2">Review & Submit</h2>
      <p className="text-muted-foreground mb-8">
        Please review all your information before submitting
      </p>

      <div className="space-y-4 mb-8">
        <ReviewSection title="Education" icon="🎓" />
        <ReviewSection title="Certifications" icon="📜" />
        <ReviewSection title="Internships" icon="👩‍💼" />
        <ReviewSection title="Work Experience" icon="💼" />
        <ReviewSection title="Projects" icon="🌐" />
        <ReviewSection title="Technical Profiles" icon="⚙️" />
        <ReviewSection title="Assessments" icon="🏅" />
        <ReviewSection title="Social & Resume" icon="📄" />
      </div>

      <Button className="w-full" size="lg">
        Submit for Validation
      </Button>
    </Card>
  );
};

const ReviewSection = ({ title, icon }: { title: string; icon: string }) => (
  <div className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <Button variant="ghost" size="sm">
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>
  </div>
);

export default ReviewSubmit;
