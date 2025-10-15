// src/pages/home/MyDetails.tsx

import ReviewCard from "@/components/review/ReviewCard";

const MyDetails = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">My Details</h2>
    <p className="text-muted-foreground mb-4">
      Review or update your full Skill Wallet information.
    </p>

    {/* Reuse the same review card without submit button */}
    <ReviewCard showSubmit={false} />
  </div>
);

export default MyDetails;
