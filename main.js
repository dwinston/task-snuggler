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

// No existing events overlap the range
// [<returned>, <returned> + hoursAfter hours)
var safeRandomMomentFromNow = function (hoursAfter) {
  // Generate an array of safe intervals of the form
  // [[start0,end0],[start1,end1],...]
  var intervals = [];
  var start0 = moment();
  var endN = moment().endOf('week');
  var events = Events.find({
    start: {$gt: start0.toDate()}, 
    end: {$lt: endN.toDate()}
  }, {
    sort: ["start", "asc"]
  }).fetch(); // does cursor forEach() yield item index to callback?
  var startsAt;
  _.each(events, function (event, i) {
    if (i === 0) { startsAt = start0; }

    intervals.push([startsAt, moment(event.start)]);
    startsAt = moment(event.end);

    if (i === events.length - 1) {
      intervals.push([startsAt, endN]);
    }
  });
  if (_.isEmpty(intervals)) {
    // zero conflicting events!
    intervals.push([start0,endN]);
  }

  // Filter for intervals capable of storing an event
  // of duration hoursAfter hours.
  // Return false if the resulting array is empty.
  intervals = _.filter(intervals, function (i) {
    return i[1].diff(i[0], 'hours', true) > hoursAfter;
  });
  if (_.isEmpty(intervals)) { 
    return false; 
  }

  // Produce an array of safe moments by reducing each
  // surviving interval by hoursAfter hours
  intervals = _.map(intervals, function (i) {
    return [i[0], i[1].subtract('hours', hoursAfter)];
  });

  // Choose a random moment by first choosing a random
  // interval, with the probability of each interval proportional
  // to its duration, and then choosing a random moment within
  // that interval. Return this moment.
  // TODO
};

generateEvents = function (commitmentId) {
  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var startsAt = randomMomentFromNow();
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
