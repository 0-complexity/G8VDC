(function() {
  'use strict';
  //jshint latedef: nofunc
  angular
    .module('cloudscalers.controllers')
    .controller('CloudSpaceManagementController', CloudSpaceManagementController);

  function CloudSpaceManagementController($scope, CloudSpace, LoadingDialog,
    $ErrorResponseAlert, $modal, $window, $timeout, LocationsService) {

    $scope.getLocationInfo = getLocationInfo;
    $scope.deleteCloudspace = deleteCloudspace;
    $scope.updateCloudspace = updateCloudspace;

    $scope.$watch('currentSpace.id', currentSpaceId);

    function getLocationInfo(locationcode) {
      return LocationsService.get(locationcode);
    }

    function currentSpaceId() {
      $scope.cloudSpaceSettingsLoader = true;
      CloudSpace.get($scope.currentSpace.id).then(
        function(data) {
          $scope.cloudSpaceDetails = data;
          LocationsService.list().then(function(locations) {
            $scope.currentLocation = _.findWhere(locations, {locationCode: $scope.currentSpace.location});
            $scope.cloudSpaceSettingsLoader = false;
          });
        },
        function(reason) {
          $ErrorResponseAlert(reason);
          $scope.cloudSpaceSettingsLoader = false;
        }
      );
    }

    function updateCloudspace() {
      var modalInstance = $modal.open({
        templateUrl: 'updateCloudspace.html',
        controller: function($scope, $modalInstance) {
          $scope.submit = function(result) {
            $modalInstance.close(result.name);
          };
          $scope.cancelUpdate = function() {
            $modalInstance.dismiss('cancel');
          };
        },
        resolve: {
        }
      });
      modalInstance.result.then(function(name) {
        CloudSpace.update($scope.currentSpace.id, name)
        .then(
          function() {
            $scope.currentSpace.name = name;
          }, function(reason) {
            $ErrorResponseAlert(reason);
          }
        );
      });
    }



    function deleteCloudspace() {
      var modalInstance = $modal.open({
        templateUrl: 'deleteCloudSpaceDialog.html',
        controller: function($scope, $modalInstance) {
          $scope.ok = function() {
            $modalInstance.close('ok');
          };
          $scope.cancelDeletion = function() {
            $modalInstance.dismiss('cancel');
          };
        },
        resolve: {
        }
      });
      modalInstance.result.then(function() {
        LoadingDialog.show('Deleting cloudspace');
        CloudSpace.delete($scope.currentSpace.id)
        .then(
          function() {
            $scope.cloudspaces.splice(
              _.where($scope.cloudspaces, {
                id: $scope.currentSpace.id,
                accountId: $scope.currentSpace.accountId
              }), 1);
            $scope.setCurrentCloudspace($scope.cloudspaces[0]);
            $scope.loadSpaces();
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
              $window.location.reload();
            } else {
              var uri = new URI($window.location);
              uri.filename('');
              uri.fragment('');
              $window.location = uri.toString();
            }
          }, function(reason) {
            LoadingDialog.hide();
            $ErrorResponseAlert(reason);
          }
        );
      });
    }
  }
})();
