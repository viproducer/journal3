import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { getUserAffirmation } from "@/lib/firebase/affirmations";
import type { Affirmation } from "@/lib/firebase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DailyAffirmationProps {
  journalTypeId?: string;
}

export default function DailyAffirmation({ journalTypeId = "self-discovery" }: DailyAffirmationProps) {
  const { user } = useAuth();
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffirmation = async () => {
      if (!user) return;
      try {
        const dailyAffirmation = await getUserAffirmation(user.uid, journalTypeId);
        setAffirmation(dailyAffirmation);
      } catch (error) {
        console.error("Error fetching affirmation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAffirmation();
  }, [user, journalTypeId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
            <p className="text-muted-foreground">Loading your daily affirmation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!affirmation) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <p className="text-muted-foreground">No affirmation available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <Badge variant="secondary" className="capitalize">
                {affirmation.category.replace("-", " ")}
              </Badge>
            </div>
          </div>
          <p className="text-lg font-medium">{affirmation.text}</p>
        </div>
      </CardContent>
    </Card>
  );
} 