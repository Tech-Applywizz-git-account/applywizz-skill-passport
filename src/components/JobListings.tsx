import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Briefcase,
    Search,
    Plus,
    Building2,
    FileText,
    BarChart3,
    Calendar
} from "lucide-react";
import CreateJobModal from "./CreateJobModal";

const JobListings = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <CreateJobModal open={isModalOpen} onOpenChange={setIsModalOpen} />
            {/* Top Header with Stats */}
            <Card className="p-6 flex items-center justify-between border-none shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your job opportunities and track applications
                    </p>
                </div>
                <div className="flex gap-12 text-center">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Jobs</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                    </div>
                </div>
            </Card>

            {/* Main Content */}
            <Card className="border-none shadow-sm bg-white min-h-[600px]">
                {/* Controls Header */}
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">All Jobs</h2>
                            <span className="bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded-full">0</span>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#008ba3] hover:bg-[#007a8f] text-white gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Job
                        </Button>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-gray-50/50 border-gray-200"
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[150px] bg-gray-50/50 border-gray-200">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/30">
                    <div className="col-span-4 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        Job Title
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" />
                        Company
                    </div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Applications
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Ranked
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Created
                    </div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-16 h-16 mb-4 text-gray-400">
                        <Briefcase className="w-full h-full" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No jobs found</h3>
                    <p className="text-sm text-gray-500">
                        Create your first job listing to get started
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default JobListings;
