Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

var randomMomentFromNow = function(opts) {
  var min = moment().startOf('hour').add('hours', 1);
  var max = moment(min).endOf('week');
  var hoursToGo = max.diff(min, 'hours');
  var offset = _.random(hoursToGo);
  return moment(min).
    hour(min.hour() + offset).
    subtract('minutes', _.first(_.shuffle([0, 30])));
};

// Returns a moment, m, s.t. no existing events overlap 
// the range [m, m.add('hours', durationInHours)).
var safeRandomMomentFromNow = function (durationInHours) {
  // Generate an array of safe intervals of the form
  // [[start0,end0],[start1,end1],...]
  var intervals = [];
  var start0 = moment();
  var endN = moment().endOf('week');
  // Grab events that start or end between now and the
  // end of the week.
  var events = Events.find({
    $or: [
      {
        start: {$gte: start0.toDate()}, 
        start: {$lt: endN.toDate()}
      },
      {
        end: {$gt: start0.toDate()}, 
        end: {$lt: endN.toDate()}
      }
    ]
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
  // of duration durationInHours hours.
  // Return false if the resulting array is empty.
  intervals = _.filter(intervals, function (interval) {
    return interval[1].diff(interval[0], 'hours', true) 
      >= durationInHours;
  });
  if (_.isEmpty(intervals)) { 
    return false; 
  }

  // Produce an array of safe moments to start events
  // by reducing each surviving interval 
  // by durationInHours hours
  intervals = _.map(intervals, function (interval) {
    return [interval[0], 
            interval[1].subtract('hours', durationInHours)];
  });

  // Choose a random moment by first choosing a random
  // interval, with the probability of each interval proportional
  // to its duration, and then choosing a random moment within
  // that interval. Return this moment.
  // TODO
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
    if (startOffsets[i] > startsAt) {
      break;
    } else {
      startOffset = startOffsets[i];
    }
  };
  var interval = intervals[_.indexOf(startOffsets, startOffset, true)];
  console.log(_.indexOf(startOffsets, startOffset, true));
  return interval[0].add('hours', startsAt - startOffset);
};

generateEvents = function (commitmentId) {
  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var startsAt = safeRandomMomentFromNow(commitment.hoursPerSession);
    Events.insert({
      title: commitment.title + ' #' + (s+1),
      start: startsAt.toDate(),
      end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
      allDay: false
    }, function (err, res) {
      Commitments.update(commitmentId, {
        $push: {eventIds: res}});
    });
  }
}

if (Meteor.isClient) {

  Meteor.startup(function () {
		
		$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
      defaultView: 'agendaWeek',
      contentHeight: 600,
      firstHour: 9,
			editable: true,
      events: function(start, end, callback) {
        callback(Events.find().fetch());
      }
		});

		Deps.autorun(function () {
      Events.find();
      $('#calendar').fullCalendar(
        'refetchEvents'
		  );
    });
	});
}
