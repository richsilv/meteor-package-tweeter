Subs = {}, remoteString = "DUMMY";

remote = DDP.connect('https://atmospherejs.com');

Packages = new Meteor.Collection('packages', {connection: remote});
Counts = new Meteor.Collection('counts', {connection: remote});

var keyLevels = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000];
var heartbeatOutstanding = false
var localHost = (Meteor.absoluteUrl() === 'http://localhost:3000/');

function subFunc() {
	var subHolder = [], intervalHandle, subNum;
	var localIds = PackageTracker.find({}, {fields: {_id: true}}).map(function(doc) {return doc._id});
	Packages.find({_id: {$nin: localIds}}).forEach(function(doc) {
		var thisPackage = PackageTracker.findOne({name: doc.metadata.name});
		if (!thisPackage) {
			PackageTracker.insert({name: doc.metadata.name, description: doc.metadata.description, git: doc.metadata.git, installCount: 0});
			var tweetString = ("New Package: " + doc.metadata.name + ', ' + doc.metadata.description).slice(0,140);
			console.log(tweetString);
			if (!localHost) twitterSendTweet(tweetString);
		}	
	});

	PackageTracker.find({}).forEach(function(doc) {
		var thisSub = remote.subscribe('packageInstalls', doc.name);
		subHolder.push({name: doc.name, sub: thisSub});
	});

	subNum = subHolder.length;
	console.log("Waiting for subscriptions on " + subNum.toString() + " packages");

	intervalHandle = Meteor.setInterval(function() {
		var thisPackage, oldPackage, thisCount, count = 0;
		for (var i = 0; i < subHolder.length; i++) {
			thisPackage = subHolder[i];
			if (thisPackage && thisPackage.sub.ready()) {
				thisCount = Counts.findOne({_id: 'package-installs-' + thisPackage.name}),
				oldPackage = PackageTracker.findOne({name: thisPackage.name});
				checkBounds(oldPackage, thisCount.count);
				console.log("Updating install count for " + thisPackage.name + " to " + (thisCount ? thisCount.count : 0).toString());
				PackageTracker.update({name: thisPackage.name}, {$set: {installCount: thisCount ? thisCount.count: 0}});
				thisPackage.sub.stop();
				subHolder[i] = null;
			}
			else if (thisPackage) count += 1;
		}
		if (!count) {
			console.log("Clearing Interval Job");
			Meteor.clearInterval(intervalHandle);
		}
		console.log("Still " + count.toString() + " packages left to check...");
	}, 5000);

};

function checkBounds(package, newCount) {
	if (!newCount || package.installCount === newCount) return false;
	else {
		keyLevels.forEach(function(level) {
			if (package.installCount < level && newCount >= level) {
				var tweetString = "Package '" + package.name + "' has reached " + level.toString() + " downloads! https://atmospherejs.com/package/" + package.name;
				console.log(tweetString);
				if (!localHost) twitterSendTweet(tweetString);
			}
		})
	}
}

Meteor.startup(function() {

	twitterCredentials = SecureData.findOne({name: "twitterCredentials"});
	remoteString = SecureData.findOne({name: 'remoteString'}) ? SecureData.findOne({name: 'remoteString'}).value : "DUMMY";

	Subs.packages = remote.subscribe('search', '*', 10000);

	if (!Meteor.settings.noUpdate) Meteor.setInterval(subFunc, 300000);

});

Meteor.methods({
	subFunc: function() {
		subFunc();
		return true;
	},
	showCounts: function() {
		return Counts.find().count();
	}
})