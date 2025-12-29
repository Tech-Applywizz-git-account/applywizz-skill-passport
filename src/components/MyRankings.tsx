import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, FileText, Calendar, Plus } from "lucide-react";

interface MyRankingsProps {
    setActiveTab: (tab: string) => void;
}

const MyRankings = ({ setActiveTab }: MyRankingsProps) => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-[#008ba3]" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Rankings</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View all your saved resume ranking results
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setActiveTab("resume-ranker")}
                    className="bg-[#008ba3] hover:bg-[#007a8f] text-white gap-2"
                >
                    <FileText className="w-4 h-4" />
                    New Ranking
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 flex items-center justify-between border shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Rankings</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                    </div>
                    <Trophy className="w-8 h-8 text-[#008ba3]" strokeWidth={1.5} />
                </Card>

                <Card className="p-6 flex items-center justify-between border shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Candidates Ranked</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                    </div>
                    <FileText className="w-8 h-8 text-[#008ba3]" strokeWidth={1.5} />
                </Card>

                <Card className="p-6 flex items-center justify-between border shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">This Month</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                    </div>
                    <Calendar className="w-8 h-8 text-[#dca578]" strokeWidth={1.5} />
                </Card>
            </div>

            {/* Empty State */}
            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border shadow-sm">
                <div className="w-20 h-20 mb-6 text-gray-300">
                    <Trophy className="w-full h-full" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rankings yet</h3>
                <p className="text-gray-500 mb-8">
                    Start ranking resumes to see them here
                </p>
                <Button
                    onClick={() => setActiveTab("resume-ranker")}
                    className="bg-[#008ba3] hover:bg-[#007a8f] text-white gap-2 px-6"
                >
                    <FileText className="w-4 h-4" />
                    Create Your First Ranking
                </Button>
            </Card>
        </div>
    );
};

export default MyRankings;
