Meteor.publish('packagetracker', function(n) {
	return PackageTracker.find({}, {sort: {installCount: -1}, limit: n});
});