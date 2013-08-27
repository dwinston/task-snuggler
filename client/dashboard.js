Template.dashboard.commitments = function () {
    return Commitments.find({}, {sort: {title: -1}});
};


Template.commitment.events({
    'click': function () {
        Session.set("selected_commitment", this._id);
    }
});

Template.commitment.selected = function () {
    return Session.equals("selected_commitment", this._id) ? "selected" : '';
};

Template.dashboard.selectedEvent = function() {
    var tmp = Commitments.findOne(Session.get("selected_commitment"));
    // var tmpId = tmp.eventIds; // cannot find property
    return tmp && tmp.eventIds;
    //return Events.find(Events.ObjectID(tmp.eventIds));
};