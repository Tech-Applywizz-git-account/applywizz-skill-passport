import { Card } from "@/components/ui/card";

const Dashboard = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">Welcome back 👋</h2>
    <p className="text-muted-foreground">
      Here’s a quick overview of your profile and progress.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <h3 className="font-semibold mb-1">Profile Status</h3>
        <p className="text-sm text-muted-foreground">Submitted for validation</p>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-1">Completion</h3>
        <p className="text-sm text-muted-foreground">100%</p>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-1">Next Step</h3>
        <p className="text-sm text-muted-foreground">Wait for admin approval</p>
      </Card>
    </div>
  </div>
);

export default Dashboard;
