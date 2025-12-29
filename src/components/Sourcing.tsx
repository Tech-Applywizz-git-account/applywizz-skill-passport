import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Search, SlidersHorizontal, AtSign, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const Sourcing = () => {
    const [activeSubTab, setActiveSubTab] = useState<"search" | "saved">("search");
    const [searchType, setSearchType] = useState<"regular" | "deep">("regular");
    const [searchQuery, setSearchQuery] = useState("marketing head of technical training institutes in pune");

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Sub Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100/50 w-fit rounded-lg">
                <button
                    onClick={() => setActiveSubTab("search")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                        activeSubTab === "search"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Search Candidates
                </button>
                <button
                    onClick={() => setActiveSubTab("saved")}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                        activeSubTab === "saved"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Saved Results
                </button>
            </div>

            {activeSubTab === "search" ? (
                <>
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">All Candidates</h1>
                            <p className="text-gray-500 mt-1">Search for candidates using AI-powered deep research</p>
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2 border-gray-200 text-gray-600">
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filter
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-6 space-y-4" align="end">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">School/University</Label>
                                    <Input
                                        placeholder="e.g., MIT, Stanford, Harv"
                                        className="bg-white border-gray-200 focus-visible:ring-[#008ba3]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Company</Label>
                                    <Input
                                        placeholder="Search company..."
                                        className="bg-white border-gray-200 focus-visible:ring-[#008ba3]"
                                    />
                                </div>
                                <Button className="w-full bg-[#008ba3] hover:bg-[#007a8f] text-white h-11">
                                    Apply
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Search Controls */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSearchType("regular")}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border",
                                    searchType === "regular"
                                        ? "bg-[#008ba3] text-white border-[#008ba3]"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <Search className="w-4 h-4" />
                                Regular Search
                            </button>
                            <button
                                onClick={() => setSearchType("deep")}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border",
                                    searchType === "deep"
                                        ? "bg-[#008ba3] text-white border-[#008ba3]"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <AtSign className="w-4 h-4" />
                                Deep Research
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-11 bg-white border-gray-200 focus-visible:ring-[#008ba3]"
                                    placeholder="Search for candidates..."
                                />
                            </div>
                            <div className="flex items-center px-4 border border-gray-200 rounded-md bg-white text-sm font-medium text-[#008ba3] whitespace-nowrap">
                                <span className="font-bold mr-1">30</span> results
                            </div>
                            <Button className="h-11 px-8 bg-[#67c3d6] hover:bg-[#5bb0c2] text-white gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Empty State Card */}
                    <Card className="mt-8 border border-gray-100 shadow-sm bg-white min-h-[450px] flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to find great candidates?</h3>
                        <p className="text-gray-500 max-w-md">
                            Enter your search criteria and optionally add filters to get started.
                        </p>
                    </Card>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 mb-6 text-gray-300">
                        <Users className="w-full h-full" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Saved Results</h3>
                    <p className="text-gray-500 text-lg">
                        Save your search results to access them later
                    </p>
                </div>
            )}
        </div>
    );
};

export default Sourcing;
