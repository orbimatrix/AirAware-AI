
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockLeaderboard } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useUserScore } from "@/hooks/use-user-score";
import { useEffect, useState } from "react";
import type { LeaderboardUser } from "@/lib/types";

export function Leaderboard() {
  const { score } = useUserScore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(mockLeaderboard);

  useEffect(() => {
    // Update the 'You' user's score and re-sort the leaderboard
    const updatedLeaderboard = mockLeaderboard.map(user => 
      user.name === 'You' ? { ...user, score } : user
    );
    
    updatedLeaderboard.sort((a, b) => b.score - a.score);

    // Re-assign ranks
    const rankedLeaderboard = updatedLeaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    setLeaderboard(rankedLeaderboard);
  }, [score]);


  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((user) => (
            <TableRow key={user.rank} className={cn(user.name === 'You' && 'bg-primary/10')}>
              <TableCell className="font-medium text-lg">{user.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-primary">{user.score.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}
