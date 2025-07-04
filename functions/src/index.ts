import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Firestore Data Structures (Conceptual)
// tournaments/{tournamentId}
//   - name: string
//   - status: 'upcoming' | 'ongoing' | 'completed'
//   - bracket: { [round: string]: { [matchId: string]: { team1: string, team2: string, winner?: string, score1?: number, score2?: number, nextMatchId?: string } } }
//   - teams: { [teamId: string]: { name: string, players: string[] } }

// Cloud Function to update match scores and determine winners
export const updateMatchScore = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const newMatchData = change.after.data();
    const previousMatchData = change.before.data();
    const { tournamentId, matchId } = context.params;

    // Only proceed if scores have changed and a winner hasn't been determined yet
    if (newMatchData.score1 !== previousMatchData.score1 || newMatchData.score2 !== previousMatchData.score2) {
      if (!newMatchData.winner) {
        let winnerId: string | undefined;

        if (newMatchData.score1 > newMatchData.score2) {
          winnerId = newMatchData.team1;
        } else if (newMatchData.score2 > newMatchData.score1) {
          winnerId = newMatchData.team2;
        } else {
          // Handle ties if necessary, e.g., sudden death, re-match, or specific tie-breaking rules
          console.log(`Match ${matchId} in tournament ${tournamentId} is a tie. No winner determined yet.`);
          return null;
        }

        if (winnerId) {
          console.log(`Match ${matchId} in tournament ${tournamentId}: Winner is ${winnerId}`);
          await db.collection('tournaments').doc(tournamentId).collection('matches').doc(matchId).update({ winner: winnerId, status: 'completed' });
        }
      }
    }
    return null;
  });

// Cloud Function to propagate winners to subsequent matches
export const propagateWinner = functions.firestore
  .document('tournaments/{tournamentId}/matches/{matchId}')
  .onUpdate(async (change, context) => {
    const newMatchData = change.after.data();
    const previousMatchData = change.before.data();
    const { tournamentId, matchId } = context.params;

    // Only propagate if a winner has just been determined
    if (newMatchData.winner && !previousMatchData.winner) {
      const nextMatchId = newMatchData.nextMatchId;
      const winnerTeamId = newMatchData.winner;

      if (nextMatchId && winnerTeamId) {
        console.log(`Propagating winner ${winnerTeamId} from match ${matchId} to next match ${nextMatchId}`);

        const nextMatchRef = db.collection('tournaments').doc(tournamentId).collection('matches').doc(nextMatchId);
        const nextMatchDoc = await nextMatchRef.get();

        if (nextMatchDoc.exists) {
          const nextMatchData = nextMatchDoc.data();
          let updateData: { team1?: string, team2?: string } = {};

          // Determine if the winner should be team1 or team2 in the next match
          // This logic depends on how your bracket is structured (e.g., left/right side of bracket)
          // For simplicity, let's assume a placeholder like 'TBD1' or 'TBD2'
          if (nextMatchData?.team1 === 'TBD1' || nextMatchData?.team1 === 'TBD_FROM_MATCH_' + matchId) {
            updateData.team1 = winnerTeamId;
          } else if (nextMatchData?.team2 === 'TBD2' || nextMatchData?.team2 === 'TBD_FROM_MATCH_' + matchId) {
            updateData.team2 = winnerTeamId;
          } else {
            console.warn(`Could not determine where to place winner ${winnerTeamId} in next match ${nextMatchId}.`);
            return null;
          }

          await nextMatchRef.update(updateData);
          console.log(`Winner ${winnerTeamId} propagated to match ${nextMatchId}.`);
        } else {
          console.warn(`Next match ${nextMatchId} not found for tournament ${tournamentId}.`);
        }
      }
    }
    return null;
  });