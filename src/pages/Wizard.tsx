//src/pages/Wizard.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepProgress from "@/components/wizard/StepProgress";
import EducationStep from "@/components/wizard/steps/EducationStep";
import CertificationsStep from "@/components/wizard/steps/CertificationsStep";
import InternshipsStep from "@/components/wizard/steps/InternshipsStep";
import WorkExperienceStep from "@/components/wizard/steps/WorkExperienceStep";
import ProjectsStep from "@/components/wizard/steps/ProjectsStep";
import TechnicalProfilesStep from "@/components/wizard/steps/TechnicalProfilesStep";
import SocialResumeStep from "@/components/wizard/steps/SocialResumeStep";
import ReviewSubmit from "@/components/wizard/ReviewSubmit";

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const totalSteps = 7;

  const updateFormData = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/review");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <EducationStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      case 2:
        return <CertificationsStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      case 3:
        return <InternshipsStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      case 4:
        return <WorkExperienceStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      case 5:
        return <ProjectsStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      case 6:
        return <TechnicalProfilesStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      case 7:
        return <SocialResumeStep onNext={handleNext} onBack={handleBack} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
        <div className="fade-in">{renderStep()}</div>
      </div>
    </div>
  );
};

export default Wizard;
