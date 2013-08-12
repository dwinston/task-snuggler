Template.inputForm.events({
  "submit #inputForm": function (evt, templ) {
    evt.preventDefault();
    var description = templ.find("#description").value;
    var numSessions = +templ.find("#numSessions").value;
    var hoursPerSession = +templ.find("#hoursPerSession").value;

    var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

    Events.insert(
      {
        title: description,
        start: new Date(y,m,d-2,16,0),
        allDay: false
      }
    );

    $('#calendar').fullCalendar(
      'refetchEvents'
		);
		
  }
});
