import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Settings2, Sparkles, CheckCircle2, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ResumeRanker = () => {
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [uploadedJD, setUploadedJD] = useState<string | null>(null);
    const [uploadedResumes, setUploadedResumes] = useState<string[]>([]);

    const jdInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    const handleJDClick = () => jdInputRef.current?.click();
    const handleResumeClick = () => resumeInputRef.current?.click();

    const handleJDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadedJD(file.name);
    };

    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setUploadedResumes(prev => [...prev, ...files.map(f => f.name)]);
        }
    };

    const removeJD = () => {
        setUploadedJD(null);
        if (jdInputRef.current) jdInputRef.current.value = "";
    };

    const removeResume = (index: number) => {
        setUploadedResumes(prev => prev.filter((_, i) => i !== index));
    };

    const steps = [
        { id: 1, label: "Job Details", icon: FileText, status: "current" },
        { id: 2, label: "Configure Weights", icon: Settings2, status: "current" },
        { id: 3, label: "Upload Resumes", icon: Upload, status: "current" },
        { id: 4, label: "Rank", icon: Sparkles, status: "upcoming" },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#008ba3]">Resume Ranker</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    AI-powered resume evaluation in 3 simple steps
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border",
                                step.status === "current"
                                    ? "bg-cyan-50 border-cyan-200 text-[#008ba3]"
                                    : "bg-white border-gray-200 text-gray-500"
                            )}
                        >
                            <step.icon className="w-4 h-4" />
                            {step.label}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="w-8 h-px bg-gray-200 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {/* Step 1: Job Details */}
                <Card className="p-6 border-2 border-cyan-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-[#008ba3] font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
                            <p className="text-sm text-gray-500">Define the role you're hiring for</p>
                        </div>
                    </div>

                    <div className="space-y-4 pl-11">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g. Senior Software Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    Job Description
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={jdInputRef}
                                        onChange={handleJDChange}
                                        accept=".pdf"
                                        className="hidden"
                                    />
                                    {uploadedJD ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-50 text-[#008ba3] rounded-full text-xs border border-cyan-100 animate-in fade-in slide-in-from-right-2">
                                            <FileText className="w-3 h-3" />
                                            <span className="max-w-[150px] truncate font-medium">{uploadedJD}</span>
                                            <button onClick={removeJD} className="hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs gap-2 hover:bg-cyan-50 hover:text-[#008ba3] hover:border-cyan-200 transition-all"
                                            onClick={handleJDClick}
                                        >
                                            <Upload className="w-3 h-3" />
                                            Select JD PDF
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Upload a PDF or paste the job description that you want to evaluate resumes against.
                            </p>
                            <Textarea
                                placeholder="Paste job description here... or upload a PDF above"
                                className="min-h-[150px] resize-none focus:ring-[#67c3d6] focus:border-[#67c3d6]"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Step 2: Configure Scoring Weights */}
                <Card className="p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Configure Scoring Weights</h3>
                            <p className="text-sm text-gray-500">AI will analyze and suggest custom weights</p>
                        </div>
                    </div>
                    <div className="pl-11">
                        <Button className="w-full bg-[#67c3d6] hover:bg-[#5bb0c2] text-white gap-2">
                            <Sparkles className="w-4 h-4" />
                            Configure Weights with AI
                        </Button>
                    </div>
                </Card>

                {/* Step 3: Upload Resumes */}
                <Card className="p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Upload Resumes</h3>
                            <p className="text-sm text-gray-500">Add candidate resumes to evaluate</p>
                        </div>
                    </div>

                    <div className="pl-11">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50/30">
                            <input
                                type="file"
                                ref={resumeInputRef}
                                onChange={handleResumeChange}
                                accept=".pdf"
                                multiple
                                className="hidden"
                            />
                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 mb-1">Drag and drop your files or click to browse</p>
                            <p className="text-xs text-gray-400 mb-4">Accepts .pdf</p>
                            <Button
                                variant="outline"
                                className="bg-[#008ba3] text-white hover:bg-[#007a8f] border-none px-8"
                                onClick={handleResumeClick}
                            >
                                Select Files
                            </Button>
                        </div>

                        {uploadedResumes.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {uploadedResumes.map((name, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg text-sm group animate-in fade-in zoom-in-95">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="truncate text-gray-700">{name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeResume(idx)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Footer Action */}
            <div className="mt-8">
                <Button className="w-full h-12 text-lg bg-[#008ba3] text-white hover:bg-[#007a8f]">
                    Complete All Steps to Continue
                </Button>
                <div className="flex justify-center gap-8 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> Job Details</span>
                    <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> Weights</span>
                    <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> Resumes</span>
                </div>
            </div>
        </div>
    );
};

export default ResumeRanker;
