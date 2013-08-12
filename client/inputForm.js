Template.inputForm.events({
  "submit #inputForm": function (evt, templ) {
    evt.preventDefault();
    var title = templ.find("#title").value;
    var numSessions = +templ.find("#numSessions").value;
    var hoursPerSession = +templ.find("#hoursPerSession").value;

    var date = new Date();
		var d = date.getDate();
		var m = date.getMonth();
		var y = date.getFullYear();

    Events.insert(
      {
        title: title,
        start: new Date(y,m,d-2,16,0),
        allDay: false
      }
    );
		
  }
});
