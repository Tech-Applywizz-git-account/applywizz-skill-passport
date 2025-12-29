import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Briefcase,
    Building2,
    Globe,
    CheckCircle2,
    LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Profile = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("Ganesh");
    const [jobTitle, setJobTitle] = useState("software developer");
    const [companyName, setCompanyName] = useState("applywizz");
    const [website, setWebsite] = useState("https://applywizz.com");

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error.message);
        } else {
            navigate("/");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account settings and professional information</p>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="gap-2 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>

            {/* Hero Section Card */}
            <Card className="overflow-hidden border-none shadow-sm bg-white">
                {/* Banner */}
                <div className="h-48 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-400 relative flex items-center justify-center">
                    <div className="text-white font-black text-8xl opacity-20 select-none">RTW</div>
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center p-2 border-4 border-white">
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                                RTW
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Info Summary */}
                <div className="pt-16 pb-8 px-8 flex justify-between items-end">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                        <p className="text-gray-500 font-medium">{jobTitle}</p>
                        <p className="text-gray-400 text-sm">gannicherry93789@gmail.com</p>
                        <div className="flex items-center gap-1.5 text-[#008ba3] text-sm font-medium mt-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Profile Complete
                        </div>
                    </div>
                </div>
            </Card>

            {/* Main Form Section */}
            <Card className="p-8 border-none shadow-sm bg-white space-y-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900">
                        <User className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-bold">Profile Information</h3>
                    </div>
                    <p className="text-sm text-gray-500">Update your personal and professional information</p>
                </div>

                {/* Personal & Account Details */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Personal & Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Full Name *</Label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-gray-50/50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                            <Input
                                value="gannicherry93789@gmail.com"
                                readOnly
                                className="bg-gray-50/50 border-gray-200 h-11 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-[11px] text-gray-400">Email cannot be changed. Contact support if needed.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Job Title *</Label>
                            <Input
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="bg-gray-50/50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Your Role</Label>
                            <Select defaultValue="hr-manager">
                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hr-manager">HR Manager</SelectItem>
                                    <SelectItem value="recruiter">Recruiter</SelectItem>
                                    <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Company Details */}
                <div className="space-y-6 pt-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2">Company Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-semibold text-gray-700">Company Name *</Label>
                            <Input
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="bg-gray-50/50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Company Size</Label>
                            <Select defaultValue="startup">
                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                                    <SelectItem value="small">Small (11-50 employees)</SelectItem>
                                    <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                                    <SelectItem value="large">Large (201+ employees)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Industry</Label>
                            <Select defaultValue="tech">
                                <SelectTrigger className="bg-gray-50/50 border-gray-200 h-11">
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tech">Technology/Software</SelectItem>
                                    <SelectItem value="finance">Finance/Banking</SelectItem>
                                    <SelectItem value="healthcare">Healthcare</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                Company Website
                            </Label>
                            <Input
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="bg-gray-50/50 border-gray-200 h-11"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                    <Button className="bg-[#008ba3] hover:bg-[#007a8f] text-white px-8 h-11 font-semibold">
                        Save Changes
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Profile;
