import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Phone, Mail, User, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const Support = () => {
    const [message, setMessage] = useState("");

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#008ba3]">Chat</h1>
                    <p className="text-sm text-gray-500 mt-1">AI-powered support assistant</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-6 px-6 py-2 bg-white border border-cyan-100 rounded-full shadow-sm text-xs font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-cyan-500" />
                            <span>+91 7428557989</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-cyan-500" />
                            <span>+91 9997045800</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-cyan-500" />
                            <span>contact@elitehq.co</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#008ba3] flex items-center justify-center text-white">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Sub-header Badge */}
            <div className="flex">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-[#008ba3] rounded-full text-sm font-medium border border-cyan-100">
                    <Sparkles className="w-4 h-4" />
                    ApplywizzHQ Support
                </div>
            </div>

            {/* Chat Container */}
            <Card className="border-none shadow-sm bg-white min-h-[600px] flex flex-col relative overflow-hidden">
                <div className="flex-1 p-8">
                    {/* AI Message */}
                    <div className="flex gap-4 max-w-2xl">
                        <div className="w-10 h-10 rounded-full bg-[#008ba3] flex items-center justify-center text-white shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-6 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-[#008ba3]">ApplywizzHQ Support</span>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    Hello! I'm your ApplywizzHQ Support Assistant. How can I help you today?
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-8 pt-0">
                    <div className="relative">
                        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-[#008ba3] focus-within:ring-1 focus-within:ring-[#008ba3] transition-all">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className="flex-1 border-none shadow-none focus-visible:ring-0 h-12 text-base"
                            />
                            <Button
                                className={cn(
                                    "bg-[#008ba3] hover:bg-[#007a8f] text-white px-8 h-12 rounded-xl text-lg font-medium transition-all",
                                    !message.trim() && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={!message.trim()}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-4">
                        ApplywizzHQ AI can make mistakes. Verify important information with our support team.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Support;
