Meteor.startup(function () {
    if (Events.find().count() === 0) { 
        var now = moment().startOf('week');
	var d = now.date();
	var m = now.month();
	var y = now.year();
	var events = [
	    {
		title: 'Meeting',
		start: new Date(y, m, d+2, 9, 30),
		end: new Date(y, m, d+2, 10, 30),
		allDay: false
	    },
	    {
		title: 'Lunch',
		start: new Date(y, m, d+1, 12, 0),
		end: new Date(y, m, d+1, 14, 0),
		allDay: false
	    },
	    {
		title: 'Birthday Party',
		start: new Date(y, m, d+3, 16, 0),
		end: new Date(y, m, d+3, 18, 30),
		allDay: false
	    },
	    {
		title: 'Hacking',
		start: new Date(y, m, d+5, 16, 0),
		end: new Date(y, m, d+5, 18, 30),
		allDay: false
	    },	    
            {
		title: 'Ultimate Frisbee',
		start: new Date(y, m, d+6, 12, 0),
		end: new Date(y, m, d+6, 14, 0),
		allDay: false
	    }
	];

        for (var offset=-1; offset<7; offset++){
            events.push({
                title: 'Sleep',
                start: new Date(y,m,d+offset,21,0),
                end: new Date(y,m,d+offset+1,9,0),
                allDay: false
            });
        }

        _.each(events, function (evt) {
            Events.insert(evt);
        });
        
        if (Commitments.find().count() == 0) {
            Commitments.insert(
                {
                    numSessions: 3,
                    hoursPerSession: 1,
                    title: "Jog",
                    eventIds: []
                }, 
                function (err, res) {
                    generateEvents(res);
                });

                Commitments.insert(
                {
                    numSessions: 2,
                    hoursPerSession: 2,
                    title: "Code",
                    eventIds: []
                }, 
                function (err, res) {
                    generateEvents(res);
                });
        }
    }
});
