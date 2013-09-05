tsnug = {};

tsnug.contains = function(interval, m) {
  return (m >= interval[0] && m <= interval[1]);
}

tsnug.safeStarts = function (hoursPerSession) {
  // Generate an array of safe intervals of the form
  // [[start0,end0],[start1,end1],...]
  var intervals = [];
  var start0 = moment();
  var endN = moment().endOf('week');
  // Grab events that start or end between now and the
  // end of the week.
  var events = Events.find({
    $or: [{
      $and: [{start: {$gte: start0.toDate()}}, 
             {start: {$lt: endN.toDate()}}]
    },{
      $and: [{end: {$gt: start0.toDate()}}, 
             {end: {$lt: endN.toDate()}}]
    }]
  }, {
    sort: ["start", "asc"]
  }).fetch(); // does cursor forEach() yield item index to callback?
  var startsAt;
  _.each(events, function (event, i) {
    if (i === 0) {
      if (start0.isBefore(event.start)) { 
        startsAt = start0; 
        intervals.push([startsAt, moment(event.start)]);
        startsAt = moment(event.end);
      } else { // first event started before now
        startsAt = moment(event.end);
      }
    } else { // i > 0
      intervals.push([startsAt, moment(event.start)]);
      startsAt = moment(event.end);
    }
    if (i === events.length - 1) {
      startsAt.isBefore(endN) && intervals.push([startsAt, endN]);
    }
  });
  if (_.isEmpty(intervals)) {
    // are we in the middle of an event?
    var event = Events.findOne({
      start: {$lt: start0.toDate()},
      end: {$gt: endN.toDate()}
    });
    if (!event) {
      // zero conflicting events!
      intervals.push([start0,endN]);
    }
  }

  // Filter for intervals capable of storing an event
  // of duration hoursPerSession hours.
  intervals = _.filter(intervals, function (interval) {
    return interval[1].diff(interval[0], 'hours', true) 
      >= hoursPerSession;
  });

  // Produce an array of safe moments to start events
  // by reducing each surviving interval 
  // by hoursPerSession hours
  intervals = _.map(intervals, function (interval) {
    return [interval[0], 
            interval[1].subtract('hours', hoursPerSession)];
  });

  return intervals;
};

tsnug.updateCommitmentPreferences = function(event, dayDelta, minuteDelta){
  var commitment = Commitments.findOne(event.commitmentId);
  if (commitment){
    var start = moment(event.start);
    var timeIndex = moment(start).diff(start.startOf('week'), 'hours', true)*2;
    var prefs = commitment.prefs;
    if (_.has(prefs, timeIndex)){
      // Updates key-value pair if exist, adds 1 to it for now
      prefs[timeIndex]+=1;
    }else{
      // Add new key-value pair if not exists, starts from 1
      prefs[timeIndex]=1;
    }
    // Update preferences in the collection
    Commitments.update(commitment._id, 
                       {
                         $set:{'prefs': prefs}
                       }
                      )
  }
};

tsnug.findRoundingCandidates = function(pureMoment, includeCurrentMoment){

  // Shift pureMoment to the closest hour or half-hour if possible.
  var pureMomentMinutes = pureMoment.minutes();
  var hour = {startOf: moment(pureMoment).startOf('hour'),
              middleOf: moment(pureMoment).startOf('hour').add('minutes', 30),
              startOfNext: moment(pureMoment).startOf('hour').add('hours', 1)};
  var candidates;
  if (pureMomentMinutes >= 30) {
    if (pureMomentMinutes >= 45) {
      candidates = [hour.startOfNext, hour.middleOf]; // [45, 60)
    } else {
      candidates = [hour.middleOf, hour.startOfNext]; // [30, 45)
    }
  } else { // pureMomentMinutes <= 30
    if (pureMomentMinutes < 15) {
      candidates = [hour.startOf, hour.middleOf]; // [0, 15)
    } else {
      candidates = [hour.middleOf, hour.startOf]; // [15, 30)
    }
  }
  if (includeCurrentMoment){
    candidates.push(pureMoment);
  }
  return candidates;
};

tsnug.noOverlapDurations = function(startMoments, hoursPerSession){
  var numMoments = startMoments.length;
  for (var i=0;i<numMoments-1;i++){
    var firstMoment = startMoments[i];
    for(var j =i+1;j<numMoments;j++){
      var secondMoment = startMoments[j];
      var difference = moment(firstMoment).diff(secondMoment, 'hours', true);
      if (Math.abs(difference) < hoursPerSession){
        // overlap happened as difference between starting points 
        // is smaller than hours per session
        return false; 
      }
    }
  }
  return true; // Overlap did not happen
};