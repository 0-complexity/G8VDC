'use strict';

angular.module('cloudscalers.services')
.factory('Users', function($http, $q) {
  return {
    tourTipsSwitch: function(tourtipsStatus) {
      return $http.post(cloudspaceconfig.apibaseurl + '/users/setData?' , {
        'data': {'tourtips': encodeURIComponent(tourtipsStatus)}
      }).then(
        function(result) {
          return result.data;
        },
        function(reason) {
          return $q.reject(reason);
        }
      );
    },
    // TODO make usernameregex dynamic
    getMatchingUsernames: function() {
      var data = {limit: 5, usernameregex: 'k'};
      return $http.post(cloudspaceconfig.apibaseurl + '/users/getMatchingUsernames', data)
      .then(
        function(result) {
          return result.data;
        },
        function(reason) {
          return $q.reject(reason);
        }
      );
    },
    isValidInviteUserToken: function(inviteUserToken, emailAddress) {
      var data = {inviteusertoken: inviteUserToken, emailaddress: emailAddress};
      return $http.post(cloudspaceconfig.apibaseurl + '/users/isValidInviteUserToken', data)
      .then(
        function(result) {
          return result.data;
        },
        function(reason) {
          return $q.reject(reason);
        }
      );
    }
  };
});
