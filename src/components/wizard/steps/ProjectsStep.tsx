import { useState } from "react";
import { FolderGit2, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProjectsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const ProjectsStep = ({ onNext, onBack, updateFormData }: ProjectsStepProps) => {
  const [projects, setProjects] = useState([
    { title: "", description: "", role: "", techStack: "", url: "", files: null }
  ]);

  const addProject = () => {
    setProjects([...projects, { title: "", description: "", role: "", techStack: "", url: "", files: null }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    updateFormData({ projects });
    onNext();
  };

  return (
    <StepWrapper title="Projects / Portfolio" icon={<FolderGit2 />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="border border-border rounded-lg p-6 relative">
            {projects.length > 1 && (
              <button
                onClick={() => removeProject(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Project Title</Label>
                <Input placeholder="E-commerce Platform" />
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the project, its goals, and outcomes..." rows={4} />
              </div>

              <div>
                <Label>Your Role in Project</Label>
                <Input placeholder="Lead Developer, Designer, etc." />
              </div>

              <div>
                <Label>Project/GitHub URL</Label>
                <Input placeholder="https://github.com/username/project" />
              </div>

              <div className="md:col-span-2">
                <Label>Tech Stack Used</Label>
                <Input placeholder="React, Node.js, MongoDB, AWS..." />
              </div>

              <div className="md:col-span-2">
                <Label>Screenshots, PPT, Case Study</Label>
                <Input type="file" accept="image/*,.pdf,.ppt,.pptx" multiple />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addProject} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Project
      </Button>
    </StepWrapper>
  );
};

export default ProjectsStep;
