Meteor.publish('packages', function() {
	return Packages.find({});
});
Meteor.publish('installs', function() {
	return Installs.find({});
});
Meteor.publish('packagetracker', function() {
	return PackageTracker.find({});
});
Meteor.publish('installslocal', function() {
	return InstallsLocal.find({});
});