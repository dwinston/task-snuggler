tsnug.learnedMomentsFromNow = function(commitment) {

  var hoursPerSession = commitment.hoursPerSession;
  var sessionIndexSpan = hoursPerSession * 2;
  var numSessions = commitment.numSessions;
  
  // obtain intervals of safe starts
  var intervals = tsnug.safeStarts(hoursPerSession);
  if (_.isEmpty(intervals)) { 
    return null;
  }

  // Return a list of indices of possible start times, in ascending order.
  var availableStartIndices = [];
  _.each(intervals, function(interval){
    var candidates = tsnug.findRoundingCandidates(interval[0], false);
    var candidate = _.find(candidates, function (candidate) {
      return tsnug.contains(interval, candidate);
    });
    var timeIndex = 
      moment(candidate).diff(
        moment(candidate).startOf('week'), 'hours', true)*2;
    while(tsnug.contains(interval, candidate)){
      availableStartIndices.push(timeIndex++);
      candidate.add('hours', 0.5);
    }
  });

  // Sanity checks: given availableStartIndices, is it possible to generate 
  // numSessions sessions of duration hoursPerSession?
  // Check 1: Simple arithmetic. Necessary but insufficient.
  if (numSessions * sessionIndexSpan > availableStartIndices.length) return [];
  // Check 2: A greedy solution. Assumes ascending availableStartIndices.
  var sessionCount = 0;
  var lastStartIdx = -sessionIndexSpan;
  for (var i=0; i < availableStartIndices.length; i++) {
    if (availableStartIndices[i] < lastStartIdx + sessionIndexSpan) continue; 
    if (++sessionCount === numSessions) break;
    lastStartIdx = availableStartIndices[i];
  } 
  if (sessionCount < numSessions) return [];

  // From preferences, generate ranking of available start indices.
  // Indices without preference are to be shuffled via randomly assigned
  // ranks in the range (-1, 0].
  // E.g., [{startIndex: 1, rank: -3},{startIndex: 3, rank: -5}] 
  // means that Sun 12:30am has weight 3 and Sun 01:30am has weight 5.
  // Ranking is by absolute value.
  var prefs = commitment.prefs;
  var indexRank = _.map(availableStartIndices, function(i) { 
    return {
      index: i, 
      rank: _.has(prefs, i) ? -prefs[i] : -Math.random()
    };
  });
  var rankedIndices = _.pluck(_.sortBy(indexRank, 'rank'), 'index');

  var startOfWeek = moment(intervals[0][0]).startOf('week');
  var startMoments;

  
  // Find possible start moments according to the numSessions
  for (var index = 0; index<=rankedIndices.length-numSessions;index++){
    var startsAts = rankedIndices.slice(index,index+numSessions);
    startMoments =  _.map(startsAts, function(startAt){
      return moment(startOfWeek).add('hours', startAt/2);
    });
    // Check if the scheduled commitments overlap with each other
    if (tsnug.noOverlapDurations(startMoments, hoursPerSession)){
      // No overlap, DONE
      break;
    }else{
      // Overlap happened, try again with another set
      startMoments = [];
    }
  }
  return startMoments;
};

// Other comments

// sort is O(nlogn)
// sum weights and track indices. O(1) coin toss picks one. remove it.
// sutract its weight from sum and shift indices. repeat. in this way we'll 
// generate an ordering of all n candidates in O(n) time? maybe O(n^2).

// To do:

// run through candidate starts, keep track of first picked start_0,
// and try to find numSessions of them (start_0 .. start_(numSessions-1)).
// If cannot find numSessions of them, then have first pick be
// after last first pick, i.e. the choice after start_0 in the array. This
// is the new start_0. 
// e.g. sorted candidate array [a,b,c,d] and numSessions = 3.
// start_0 = a. b conflicts. c conflicts. uh oh. can't find 3 sessions with a.
// start_0 = b. c is fine. d is fine. return {b,c,d} as sessions.
// running time O(c^2) where c <= 336 is the number of candidates.
