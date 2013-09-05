tsnug.learnedMomentsFromNow = function(commitment) {

  var hoursPerSession = commitment.hoursPerSession;
  var numSessions = commitment.numSessions;

// obtain intervals of safe starts

// get array of desired starts of form :00 or :30
//[0,0,1,1]
// where 1->available, 0->unavailable

// retrieve of key-value store of preferences
// of form (startIndex, weight)
// e.g. {(1,3),(3,5)} means that Sun 12:30am has weight 3
// and Sun 01:30am has weight 5.
//[0,3,0,5]

// If available, add preference weight if specified
//[0,0,1,6]

// sort array in desc order and dump unavailables at end
//[3,2]
// shuffle score-1 indices to get randomness for
// slots without preferences.

// sort is O(nlogn)
// sum weights and track indices. O(1) coin toss picks one. remove it.
// sutract its weight from sum and shift indices. repeat. in this way we'll 
// generate an ordering of all n candidates in O(n) time? maybe O(n^2).

// sanity check to see if numSessions sessions of duration hoursPerSession
// are possible:
// (1) numSessions * (hoursPerSession * 2) > numCandidates => error
// (2) greedily occupy safe slots and see that this is possible.

// run through candidate starts, keep track of first picked start_0,
// and try to find numSessions of them (start_0 .. start_(numSessions-1)).
// If cannot find numSessions of them, then have first pick be
// after last first pick, i.e. the choice after start_0 in the array. This
// is the new start_0. 
// e.g. sorted candidate array [a,b,c,d] and numSessions = 3.
// start_0 = a. b conflicts. c conflicts. uh oh. can't find 3 sessions with a.
// start_0 = b. c is fine. d is fine. return {b,c,d} as sessions.
// running time is O(c^2) where c <= 336 is the number of candidates.

};
