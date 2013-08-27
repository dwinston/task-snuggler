Template.inputForm.events({
    "submit #inputForm": function (evt, templ) {
        evt.preventDefault();
        var title = templ.find("#title").value;
        var numSessions = +templ.find("#numSessions").value;
        var hoursPerSession = +templ.find("#hoursPerSession").value;
        
        Commitments.insert(
            {
                numSessions: numSessions,
                hoursPerSession: hoursPerSession,
                title: title,
                eventIds: []
            }, 
            function (err, res) {
                generateEvents(res);
            });        	
    },
});

Deps.autorun(function (c) {
    var tmpID = Session.get("selected_commitment");
    var commitment = Commitments.findOne(tmpID);
    // Commitment database not found
    $('title').val('abc');
    //$('#title').val(commitment.title);
    //$('#numSessions').val(commitment.numSessions);
    //$('#hoursPerSession').val(commnt.hoursPerSession);
});