import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SkillPassport = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">Skill Passport</h2>
    <p className="text-muted-foreground">
      Download or share a summarized view of your skills and credentials.
    </p>

    <Card className="p-6 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Your latest Skill Passport</h3>
        <p className="text-sm text-muted-foreground">Generated from your current profile data.</p>
      </div>
      <Button>Download</Button>
    </Card>
  </div>
);

export default SkillPassport;
