(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('CloudSpaceAccessManagementController', CloudSpaceAccessManagementController);

  function CloudSpaceAccessManagementController($scope, CloudSpace, Users,
    $http, $ErrorResponseAlert, $timeout, $modal) {
    $scope.shareCloudSpaceMessage = false;
    $scope.accessTypes = CloudSpace.cloudspaceAccessRights();
    $scope.resetUser = resetUser;
    $scope.loadSpaceAcl = loadSpaceAcl;
    $scope.userError = false;
    $scope.addUser = addUser;
    $scope.deleteUser = deleteUser;
    $scope.loadEditUser = loadEditUser;
    $scope.resetuserName = resetuserName;
    $scope.emailMode = false;
    // Binding and Watch
    $scope.$watch('userName', userName);

    // Initialization: Functions invokation logic
    $scope.resetUser();
    $scope.loadSpaceAcl();

    // Functions
    function userMessage(message, style, resetUser) {
      if (_.isUndefined(resetUser)) {
        resetUser = true;
      }

      $scope.shareCloudSpaceMessage = true;
      $scope.shareCloudSpaceStyle = style;
      $scope.shareCloudSpaceTxt = message;

      if (resetUser) {
        $scope.resetUser();
      }

      $timeout(function() {
        $scope.shareCloudSpaceMessage = false;
      }, 3000);
    }
    function resetUser() {
      $scope.newUser = {
        nameOrEmail: '',
        access: $scope.accessTypes[0].value
      };
    }
    function loadSpaceAcl() {
      return CloudSpace.get($scope.currentSpace.id)
      .then(function(space) {
        $scope.currentSpace.acl = space.acl;
      });
    }
    function addUser() {
      if ($scope.currentSpace.acl) {
        var userInAcl = _.find($scope.currentSpace.acl, function(acl) {
          return acl.userGroupId === $scope.newUser.nameOrEmail;
        });

        if (userInAcl) {
          userMessage($scope.newUser.nameOrEmail + ' already have access rights.', 'danger');
        } else {
          CloudSpace
          .addUser($scope.currentSpace, $scope.newUser.nameOrEmail, $scope.newUser.access)
          .then(function() {
            userMessage('Assigned access rights successfully to ' + $scope.newUser.nameOrEmail , 'success');
            $scope.loadSpaceAcl()
            .then(function() {
              $scope.resetUser();
              $scope.resetuserName();
            });
          }, function(reason) {
            if (reason.status === 404) {
              userMessage($scope.newUser.nameOrEmail + ' not found', 'danger');
            } else {
              $ErrorResponseAlert(reason);
            }
          });
        }
      }
    }
    function deleteUser(space, user) {
      if (user.canBeDeleted !== true) {
        return false;
      }
      var modalInstance = $modal.open({
        templateUrl: 'deleteUserDialog.html',
        controller: function($scope, $modalInstance) {
          $scope.ok = function() {
            $modalInstance.close('ok');
          };
          $scope.cancelRemoveUser = function() {
            $modalInstance.dismiss('cancel');
          };
        },
        resolve: {}
      });

      modalInstance.result.then(function() {
        CloudSpace.deleteUser($scope.currentSpace, user.userGroupId)
        .then(function() {
          $scope.loadSpaceAcl();
          $scope.currentSpace.acl.splice(_.indexOf($scope.currentSpace.acl, {userGroupId: user.userGroupId}), 1);
          userMessage('Assigned access right removed successfully for ' + user.userGroupId , 'success');
        },
        function(reason) {
          $ErrorResponseAlert(reason);
        });
      });
    }
    function loadEditUser(currentSpace, user, right) {
      var modalInstance = $modal.open({
        templateUrl: 'editUserDialog.html',
        controller: function($scope, $modalInstance) {
          $scope.accessTypes = CloudSpace.cloudspaceAccessRights();
          $scope.editUserAccess = right;
          $scope.userName = user;
          $scope.changeAccessRight = function(accessRight) {
            $scope.editUserAccess = accessRight.value;
          };
          $scope.ok = function(editUserAccess) {
            $modalInstance.close({
              currentSpaceId: currentSpace.id,
              user: user,
              editUserAccess: editUserAccess
            });
          };
          $scope.cancelEditUser = function() {
            $modalInstance.dismiss('cancel');
          };
        },
        resolve: {}
      });
      modalInstance.result.then(function(accessRight) {
        CloudSpace.updateUser(accessRight.currentSpaceId, accessRight.user, accessRight.editUserAccess)
        .then(
          function() {
            $scope.loadSpaceAcl().then(function() {
              $scope.resetUser();
            });
            userMessage('Access right updated successfully for ' + user , 'success');
          },
          function(reason) {
            $ErrorResponseAlert(reason);
          }
        );
      });
    }

    /**
     * Method to get data for autocomplete popup

     * @param {string} query Input value
     * @param {object} deferred "$q.defer()" object
     */

    function validateEmail(str) {
      // reference: http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
      var regexString =
        '^(([^<>()[\\]\\\\.,;:\\s@"]+(\\.[^<>()[\\]\\\\.,;:\\s@"]+)*)' +
        '|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])' +
        '|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
      var re = new RegExp(regexString);
      return re.test(str);
    }
    function resetuserName() {
      $scope.emailMode = false;
      $scope.userName = '';
    }
    function userName(userName) {
      $scope.newUser.nameOrEmail = userName;

      if (_.isUndefined(userName)) {
        return;
      }

      if (validateEmail(userName)) {
        $scope.emailMode = true;
      } else {
        $scope.emailMode = false;
      }
    }
  }
})();
