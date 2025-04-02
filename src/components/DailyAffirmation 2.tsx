import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/auth";
import { getUserAffirmation } from "@/lib/firebase/affirmations";
import type { Affirmation } from "@/lib/firebase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface DailyAffirmationProps {
  journalTypeId: string;
}

export function DailyAffirmation({ journalTypeId }: DailyAffirmationProps) {
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
        console.error("Error fetching daily affirmation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAffirmation();
  }, [user, journalTypeId]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  if (!affirmation) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Daily Affirmation</h3>
            <p className="text-muted-foreground italic">{affirmation.text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 