import { Users, CheckCircle2, Briefcase, Phone, Timer, TrendingUp, Clock, UserSearch, Activity, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
    { name: "11-24", value: 0 },
    { name: "11-26", value: 0 },
    { name: "11-28", value: 0 },
    { name: "11-30", value: 0 },
    { name: "12-02", value: 0 },
    { name: "12-04", value: 0 },
    { name: "12-06", value: 0 },
    { name: "12-08", value: 0 },
    { name: "12-10", value: 0 },
    { name: "12-12", value: 0 },
    { name: "12-14", value: 0 },
    { name: "12-16", value: 0 },
    { name: "12-18", value: 0 },
    { name: "12-20", value: 0 },
    { name: "12-22", value: 0 },
];

const StatCard = ({ icon: Icon, title, subtitle, value, suffix = "" }: any) => (
    <Card className="p-6 flex items-center justify-between border-none shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center text-[#008ba3]">
                <Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div className="text-3xl font-bold text-[#008ba3]">
            {value}{suffix}
        </div>
    </Card>
);

const DashboardHome = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Monday, December 22, 2025</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} title="Applications" subtitle="0 active jobs" value="0" />
                <StatCard icon={CheckCircle2} title="Ranked" subtitle="Avg score: 0%" value="0" />
                <StatCard icon={Briefcase} title="Active Jobs" subtitle="0 total" value="0" />
                <StatCard icon={Phone} title="Voice Calls" subtitle="0 total made" value="0" />

                <StatCard icon={Timer} title="Call Campaigns" subtitle="Completed: 0" value="0" />
                <StatCard icon={TrendingUp} title="Success Rate" subtitle="Call campaigns: 0" value="0" suffix="%" />
                <StatCard icon={Clock} title="Total Duration" subtitle="0 minutes" value="0" />
                <StatCard icon={UserSearch} title="Sourced Candidates" subtitle="0 total found" value="0" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Applications Trend */}
                <Card className="lg:col-span-2 p-6 border-none shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-gray-900">Applications Trend</h3>
                        <p className="text-sm text-gray-500 mt-1">Daily application volume over time</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    domain={[0, 4]}
                                    ticks={[0, 1, 2, 3, 4]}
                                />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#e5e7eb"
                                    fill="transparent"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 flex flex-col border-none shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                        <p className="text-sm text-gray-500 mt-1">Latest updates</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                        <Activity className="w-10 h-10 mb-3 opacity-40" />
                        <p className="text-sm">No recent activity</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardHome;
