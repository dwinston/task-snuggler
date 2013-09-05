// Returns a moment, m, s.t. no existing events overlap 
// the range [m, m.add('hours', durationInHours)).
tsnug.safeRandomMomentFromNow = function (hoursPerSession) {

  var intervals = tsnug.safeStarts(hoursPerSession);
  if (_.isEmpty(intervals)) { 
    return null;
  }

  // Choose a random moment by first choosing a random
  // interval, with the probability of each interval proportional
  // to its duration, and then choosing a random moment within
  // that interval. Call this pureMoment.
  var totalDuration = 0;
  var startOffsets = [0];
  _.each(intervals, function (interval) {
    var duration = interval[1].diff(interval[0], 'hours', true);
    totalDuration += duration;
    startOffsets.push(totalDuration);
  });
  var startsAt = Math.random() * totalDuration;
  var startOffset = 0;
  for (var i=0; i < startOffsets.length; i++) {
    if (startOffsets[i] > startsAt) { break; } 
    else { startOffset = startOffsets[i]; }
  };
  var interval = intervals[_.indexOf(startOffsets, startOffset, true)];
  var pureMoment = interval[0].add('hours', startsAt - startOffset);
  var candidates = tsnug.findRoundingCandidates(pureMoment, true);
  return _.find(candidates, function (candidate) {
    return tsnug.contains(interval, candidate);
  });
};
