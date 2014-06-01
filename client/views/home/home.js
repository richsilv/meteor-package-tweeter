/*****************************************************************************/
/* Home: Event Handlers and Helpers */
/*****************************************************************************/
var SCROLL_INCREMENT = 20, BASE_NUMBER = 50,
    scrollCount = {
      value: BASE_NUMBER,
      dep: new Deps.Dependency()
    },
    Subs = {};

Deps.autorun(function() {
  scrollCount.dep.depend();
  Subs.PackageTracker = Meteor.subscribe('packagetracker', scrollCount.value);
});

Template.Home.events({
  /*
   * Example: 
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Home.helpers({
  packagetracker: function() {
    return PackageTracker.find({});
  },
  moreResults: function() {
    return true;
  }
  /*
   * Example: 
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

function showMoreVisible() {
    var threshold, target = $('#showMoreResults');
    if (!target.length) return;
 
    threshold = $(window).scrollTop() + $(window).height() - target.height();
 
    if (target.offset().top < threshold) {
        if (!target.data('visible')) {
            // console.log('target became visible (inside viewable area)');
            target.data('visible', true);
            scrollCount.value += SCROLL_INCREMENT;
            scrollCount.dep.changed();
            console.log("loading data...");
        }
    } else {
        if (target.data('visible')) {
            // console.log('target became invisible (below viewable arae)');
            target.data('visible', false);
        }
    }        
}
 
// run the above func every time the user scrolls
$(window).scroll(showMoreVisible);

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.created = function () {
};

Template.Home.rendered = function () {
};

Template.Home.destroyed = function () {
};
