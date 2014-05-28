/*****************************************************************************/
/* Home: Event Handlers and Helpers */
/*****************************************************************************/
Template.Home.events({
  /*
   * Example: 
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Home.helpers({
  packages: function() {
    if (Packages.find().count() > 300)
      return Packages.find({}, {sort: {installCount: -1}, limit:50, reactive: false});
    else
      return [];
  }
  /*
   * Example: 
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.created = function () {
};

Template.Home.rendered = function () {
};

Template.Home.destroyed = function () {
};
