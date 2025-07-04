import React, { useState, useEffect, useCallback } from 'react';
import { Tournament, Match, Team } from '../../types/tournament';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db } from '../../lib/firebase'; // Import Firestore instance
import { doc, updateDoc, onSnapshot, collection } from 'firebase/firestore';

interface MatchCardProps {
  match: Match;
  tournamentId: string;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  tournamentId,
}) => {
  const [score1, setScore1] = useState(match.score1?.toString() || '');
  const [score2, setScore2] = useState(match.score2?.toString() || '');

  useEffect(() => {
    setScore1(match.score1?.toString() || '');
    setScore2(match.score2?.toString() || '');
  }, [match.score1, match.score2]);

  const handleScoreChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    team: 1 | 2,
  ) => {
    const value = e.target.value;
    const numValue = parseInt(value);

    if (!isNaN(numValue)) {
      const matchRef = doc(db, 'tournaments', tournamentId, 'matches', match.id);
      if (team === 1) {
        await updateDoc(matchRef, { score1: numValue });
      } else {
        await updateDoc(matchRef, { score2: numValue });
      }
    }
  };

  const handleWinnerSelect = async (winnerId: string) => {
    const matchRef = doc(db, 'tournaments', tournamentId, 'matches', match.id);
    await updateDoc(matchRef, { winnerId: winnerId });
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: match.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="mb-4 shadow-md"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Round {match.round} - Match {match.matchNumber}
        </CardTitle>
        <Button variant="ghost" size="sm" {...listeners}>
          ☰
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 items-center gap-2">
          <Label htmlFor={`team1-score-${match.id}`}>
            {match.team1?.name || 'TBD'}
          </Label>
          <Input
            id={`team1-score-${match.id}`}
            type="number"
            value={score1}
            onChange={(e) => handleScoreChange(e, 1)}
            className="w-20"
            disabled={!match.team1}
          />
          <Button
            variant={match.winnerId === match.team1?.id ? 'default' : 'outline'}
            onClick={() => match.team1 && handleWinnerSelect(match.team1.id)}
            disabled={!match.team1}
          >
            Winner
          </Button>
        </div>
        <div className="grid grid-cols-3 items-center gap-2 mt-2">
          <Label htmlFor={`team2-score-${match.id}`}>
            {match.team2?.name || 'TBD'}
          </Label>
          <Input
            id={`team2-score-${match.id}`}
            type="number"
            value={score2}
            onChange={(e) => handleScoreChange(e, 2)}
            className="w-20"
            disabled={!match.team2}
          />
          <Button
            variant={match.winnerId === match.team2?.id ? 'default' : 'outline'}
            onClick={() => match.team2 && handleWinnerSelect(match.team2.id)}
            disabled={!match.team2}
          >
            Winner
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface TournamentBracketProps {
  tournamentId: string;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournamentId,
}) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (!tournamentId) return;

    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const matchesRef = collection(db, 'tournaments', tournamentId, 'matches');

    const unsubscribeTournament = onSnapshot(tournamentRef, (docSnap) => {
      if (docSnap.exists()) {
        setTournament((prev) => ({
          ...(prev || {} as Tournament), // Preserve existing data if any
          ...docSnap.data() as Tournament,
          id: docSnap.id,
        }));
      } else {
        console.log('No such tournament!');
        setTournament(null);
      }
    });

    const unsubscribeMatches = onSnapshot(matchesRef, (querySnapshot) => {
      const fetchedMatches: Match[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMatches.push({ id: doc.id, ...doc.data() } as Match);
      });
      setTournament((prev) => {
        if (!prev) return null;
        return { ...prev, matches: fetchedMatches };
      });
    });

    return () => {
      unsubscribeTournament();
      unsubscribeMatches();
    };
  }, [tournamentId]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !tournament) return;

      if (active.id !== over.id) {
        const activeMatch = tournament.matches.find(
          (match) => match.id === active.id,
        );
        const overMatch = tournament.matches.find(
          (match) => match.id === over.id,
        );

        if (activeMatch && overMatch) {
          const updatedMatches = [...tournament.matches];
          const activeIndex = updatedMatches.findIndex(
            (match) => match.id === active.id,
          );
          const overIndex = updatedMatches.findIndex(
            (match) => match.id === over.id,
          );

          // Simple swap for now, more complex logic needed for actual bracket reordering
          [updatedMatches[activeIndex], updatedMatches[overIndex]] = [
            updatedMatches[overIndex],
            updatedMatches[activeIndex],
          ];

          setTournament({ ...tournament, matches: updatedMatches });
        }
      }
    },
    [tournament],
  );

  if (!tournament) {
    return <div>Loading tournament...</div>;
  }

  const matchesByRound = tournament.matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Card className="w-full max-w-4xl mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {tournament.name}
          </CardTitle>
          <p className="text-center text-gray-500">
            Format: {tournament.format}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto py-4">
            {sortedRounds.map((round) => (
              <div key={round} className="flex-shrink-0 w-64 mr-8">
                <h3 className="text-lg font-semibold mb-4">Round {round}</h3>
                <SortableContext
                  items={matchesByRound[round].map((match) => match.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {matchesByRound[round].map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      tournamentId={tournamentId}
                    />
                  ))}
                </SortableContext>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DndContext>
  );
};

export default TournamentBracket;