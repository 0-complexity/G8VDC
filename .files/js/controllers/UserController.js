(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('UsersController', UsersController);

  function UsersController($scope, Users, SessionData, LoadingDialog, $ErrorResponseAlert, $timeout) {
    $timeout(function() {
      $scope.tourSwitchFlag = JSON.parse(SessionData.getUser().tourTips);
    }, 400);

    $scope.tourSwitch = function() {
      Users.tourTipsSwitch($scope.tourSwitchFlag)
      .then(
        function() {
        }, function(reason) {
          $ErrorResponseAlert(reason);
        }
      );
    };
  }
})();
