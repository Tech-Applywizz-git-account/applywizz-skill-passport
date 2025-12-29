import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, Eye, X, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateJobModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateJobModal = ({ open, onOpenChange }: CreateJobModalProps) => {
    const [isPublic, setIsPublic] = useState(true);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file.name);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Create New Job Listing</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Fill in the details for your new job opportunity. Required fields are marked with *.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] px-6 py-2">
                    <div className="space-y-6 pb-6">
                        {/* Basic Information */}
                        <div className="p-6 bg-blue-50/30 rounded-xl border border-blue-100/50 space-y-4">
                            <h3 className="font-semibold text-gray-900">Basic Information</h3>

                            <div className="space-y-2">
                                <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
                                    Job Title *
                                </Label>
                                <Input id="jobTitle" placeholder="e.g. Frontend Developer" className="bg-white border-gray-200" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                                    Location
                                </Label>
                                <Input id="location" placeholder="e.g. Mumbai, India or Remote" className="bg-white border-gray-200" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Job Type</Label>
                                    <Select>
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Experience</Label>
                                    <Select>
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder="Select level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entry">Entry Level</SelectItem>
                                            <SelectItem value="mid">Mid Level</SelectItem>
                                            <SelectItem value="senior">Senior Level</SelectItem>
                                            <SelectItem value="lead">Lead</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                        Job Description *
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf"
                                            className="hidden"
                                        />
                                        {uploadedFile ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-100 animate-in fade-in slide-in-from-right-2">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span className="max-w-[150px] truncate font-medium">{uploadedFile}</span>
                                                <button
                                                    onClick={handleRemoveFile}
                                                    className="p-0.5 hover:bg-blue-100 rounded-full transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 gap-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                                onClick={handleUploadClick}
                                            >
                                                <Upload className="w-4 h-4" />
                                                Upload PDF
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="Enter detailed job requirements, responsibilities, benefits, etc."
                                    className="min-h-[120px] bg-white border-gray-200 resize-none focus:ring-[#67c3d6] focus:border-[#67c3d6]"
                                />
                            </div>
                        </div>

                        {/* Salary Information */}
                        <div className="p-6 bg-white rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900">Salary Information (Optional)</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Min Salary</Label>
                                    <Input placeholder="e.g. 800000" className="bg-white border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Max Salary</Label>
                                    <Input placeholder="e.g. 1200000" className="bg-white border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Currency</Label>
                                    <Select defaultValue="inr">
                                        <SelectTrigger className="bg-white border-gray-200">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="inr">₹ INR</SelectItem>
                                            <SelectItem value="usd">$ USD</SelectItem>
                                            <SelectItem value="eur">€ EUR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Visibility Settings */}
                        <div className="p-6 bg-white rounded-xl border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900">Visibility Settings</h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-gray-900">Publish Job to Job Board</Label>
                                    <p className="text-xs text-gray-500">Allow candidates to find and apply to this job via a public link.</p>
                                </div>
                                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                            </div>

                            {isPublic && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-xs border border-green-100">
                                    <Eye className="w-4 h-4" />
                                    Job will be public and discoverable by candidates.
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t bg-gray-50/50">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white border-gray-200">
                        Cancel
                    </Button>
                    <Button className="bg-[#67c3d6] hover:bg-[#5bb0c2] text-white px-8">
                        Create Job
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateJobModal;
