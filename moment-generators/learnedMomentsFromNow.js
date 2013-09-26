tsnug.learnedMomentsFromNow = function(commitment) {

  var hoursPerSession = commitment.hoursPerSession;
  var sessionIndexSpan = hoursPerSession * 2;
  var numSessions = commitment.numSessions;
  
  // obtain intervals of safe starts
  var intervals = tsnug.safeStarts(commitment.userId, hoursPerSession);
  if (_.isEmpty(intervals)) { 
    return [];
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
  if (numSessions > availableStartIndices.length) return [];
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

  // Generate an array of numSessions moments, each the start of a session.
  // Priority is successively given to each index by rank. While priority by
  // sum-of-weights would intuitively be more ideal, such a solution requires
  // exponential space.
  var iMax = rankedIndices.length - 1;

  // Each element in candidate represents an index in rankedIndices
  var candidate = new Array(numSessions);
  candidate[0] = 0;

  // Function to check collision of a new event with allocated events
  var compatibleCandidate = function (cIdx) {
    var cTimeIndex = rankedIndices[candidate[cIdx]];
    var allocatedInterval;
    var tmp;
    return _.every(candidate.slice(0,cIdx), function (c) {
      tmp = rankedIndices[c];
      allocatedInterval = [tmp, tmp + sessionIndexSpan - 1];      
      return !tsnug.contains(allocatedInterval, cTimeIndex);
    });
  };

  var cIdx = 0;
  while (candidate[0] + (numSessions-1) <= iMax) {
    if (compatibleCandidate(cIdx)) {
      // Terminates when last session is compatible
      if (cIdx === numSessions - 1) { 
        break;
      }
      cIdx++;
      candidate[cIdx] = candidate[cIdx-1];
    } else if (candidate[cIdx] + ((numSessions-cIdx)-1) > iMax) { // backtrack
      cIdx--;
    }
    candidate[cIdx] += 1;
  }
  if (candidate[0] + (numSessions-1) > iMax) return [];

  var startAts = _.map(candidate, function (c) { 
    return rankedIndices[c]; 
  });
  var startOfWeek = moment(intervals[0][0]).startOf('week');
  return _.map(startAts, function(startAt){
    return moment(startOfWeek).add('hours', startAt/2);
  });
};
