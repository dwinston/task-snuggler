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
