// Returns an array of safe moments, m, s.t. no existing events overlap 
// the range [m, m.add('hours', durationInHours)), and where the
// moments try to be evenly distributed within the range possible.
//
// A toy function to work out the mechanics of generating an array of 
// mutually safe sessions.
tsnug.evenlyDistributedMomentsFromNow = function(hoursPerSession,numSessions) {

  var intervals = tsnug.safeStarts(hoursPerSession);
  if (_.isEmpty(intervals)) { 
    return null;
  }

  // Choose (potential) starts evenly distributed in the range of intervals.
  var startEarliest = intervals[0][0];
  var startLatest = intervals[intervals.length-1][1];
  var separation = startLatest.diff(startEarliest, 'hours', true) 
    / (numSessions + 1);
  var starts = _.times(numSessions, function(i) {
    return moment(startEarliest).add('hours', (i+1) * separation);
  });

  // For each potential start, until it is safe, evaluate its neighbors,
  // with preference for an earlier start.
  // TODO

  return starts;
};
