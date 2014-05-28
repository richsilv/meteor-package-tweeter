Meteor.publish('packages', function() {
	return Packages.find({});
});