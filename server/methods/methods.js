Future = Npm.require('fibers/future');

twitterSendTweet =  function(string) {

	if (Meteor.settings.noTweet) return false;

	var fut = new Future(), Twit = new TwitMaker({
		consumer_key:         twitterCredentials.apiKey,
		consumer_secret:      twitterCredentials.apiSecret,
		access_token:         twitterCredentials.accessToken,
		access_token_secret:  twitterCredentials.accessSecret
	});
	Twit.post('statuses/update', { status: string }, function(err, data, response) {
		if (err)
			fut.return(err);
		else {
			console.log("probably sent: " + string);
			fut.return(data, response);
		}
	});
	return fut.wait();
};

Meteor.methods({
	test: function(string, password) {
		if (password === remoteString)
			return twitterSendTweet(string);
		else
			throw new Meteor.Error(500, "Incorrect Password");
	},
	packageReset: function(password) {
		if (password === remoteString) {
			Subs.installs.stop();
			PackageTracker.update({}, {$set: {installCount: 0}}, {multi: true});
			InstallsLocal.remove({});
			SecureData.update({name: 'lastInstalls'}, {$set: {unixTime: 0}});
			Subs.installs = remote.subscribe('installs', 0);
			return true;
		}
		else
			throw new Meteor.Error(500, "Incorrect Password");		
	},
	queryServerCollection: function(collection, query, options, password) {
		if (password === remoteString)
			return (global[collection] && global[collection].find) ? global[collection].find(query, options).fetch() : collection + " is not a collection";
		else
			throw new Meteor.Error(500, "Incorrect Password");		
	}
});