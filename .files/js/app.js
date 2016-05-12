'use strict';

// Declare app level module which depends on filters, and services
var cloudscalers = angular.module('cloudscalers', [
  'cloudscalers.services',
  'cloudscalers.controllers',
  'ngRoute',
  'angular-szn-autocomplete',
  'ui.bootstrap'
]);

cloudscalers
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/decks', {templateUrl: 'Portal/Decks/Decks.html'});
    $routeProvider.when('/list', {templateUrl: 'shared/list.html', controller: 'MachineController'});
    $routeProvider.when('/new', {templateUrl: 'Portal/Decks/MachineDeck/pages/new.html', controller: 'MachineCreationController'});
    $routeProvider.when('/edit/:machineId/:activeTab?', {
      templateUrl: 'shared/details.html',
      controller: 'MachineEditController'
    });
    $routeProvider.when('/CloudSpaceSettings', {templateUrl: 'Portal/Admin/CloudSpaceSettings/CloudSpaceSettings.html', controller: 'CloudSpaceManagementController'});
    $routeProvider.when('/AccountSettings', {templateUrl: 'Portal/Admin/AccountSettings/AccountSettings.html', controller: 'AccountSettingsController'});
    $routeProvider.when('/GettingStarted', {templateUrl: 'Portal/Support/getting-started/getting-started.html'});
    $routeProvider.when('/ApiDocs', {templateUrl: 'Portal/Support/ApiDocs/ApiDocs.html'});
    $routeProvider.when('/Support', {templateUrl: 'Portal/Support/Support.html'});
    $routeProvider.when('/MachineDeck', {templateUrl: 'shared/list.html', controller: 'MachineController'});
    $routeProvider.when('/Portforwarding', {templateUrl: 'Portal/Decks/NetworkDeck/Portforwarding.html', controller: 'PortforwardingController'});
    $routeProvider.when('/NetworkDeck', {templateUrl: 'Portal/Decks/NetworkDeck/NetworkDeck.html', controller: 'NetworkController'});
    $routeProvider.when('/Consumption', {templateUrl: 'Portal/Admin/Consumption/Consumption.html', controller: 'AccountController'});
    $routeProvider.when('/Billing', {templateUrl: 'Portal/Admin/AccountSettings/Billing.html', controller: 'BillingController'});
    $routeProvider.when('/Profile', {templateUrl: 'Portal/Admin/Profile/Profile.html', controller: 'UsersController'});
    $routeProvider.when('/Docs', {templateUrl: 'Portal/Docs/Docs.html'});
    $routeProvider.when('/Docs/access-your-cloud-space-using-openvpn', {templateUrl: 'Portal/Docs/TechnicalTutorials/access-your-cloud-space-using-openvpn.html'});
    $routeProvider.when('/Docs/enable-root-access-on-ubuntu-over-ssh', {templateUrl: 'Portal/Docs/TechnicalTutorials/enable-root-access-on-ubuntu-over-ssh.html'});
    $routeProvider.when('/Docs/getting-started-with-jumpscale', {templateUrl: 'Portal/Docs/TechnicalTutorials/getting-started-with-jumpscale.html'});
    $routeProvider.when('/Docs/how-to-configure-ubuntu-to-connect-to-openvpn', {templateUrl: 'Portal/Docs/TechnicalTutorials/how-to-configure-ubuntu-to-connect-to-openvpn/tutorial.html'});

    $routeProvider.otherwise({redirectTo: '/list'});
  }])
  .config(['$interpolateProvider','$compileProvider', function($interpolateProvider, $compileProvider) {
    // Angular uses {{}} for data-binding. This operator will conflict with JumpScale macro syntax.
    // Use {[]} instead.
    $interpolateProvider.startSymbol('{[').endSymbol(']}');
    //Accept bitcoin and litecoin urls
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|bitcoin|litecoin):/);
  }]);

angular.module('cloudscalers.services',['ng'])
  .config(['$httpProvider',function($httpProvider) {
    $httpProvider.interceptors.push('authenticationInterceptor');
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
  }]);

var cloudscalersControllers = angular.module('cloudscalers.controllers', [
  'ui.slider',
  'cloudscalers.services',
  'cloudscalers.directives',
  'angular-tour',
  'ipCookie'
]);

if (cloudspaceconfig.apibaseurl === '') {
  cloudscalersControllers.config(function($provide) {
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
  });
  cloudscalersControllers.run(defineApiStub);
}

// So we can inject our own functions instead of the builtin functions
cloudscalers.value('confirm', window.confirm);
cloudscalers.factory('$alert', function($modal) {
  return function(message) {
    var ModalInstanceCtrl = function($scope, $modalInstance) {
      $scope.message = message.replace('\n', '<br>');
      $scope.ok = function() {
        $modalInstance.close();
      };
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    };

    $modal.open({
      templateUrl: 'myModalContent.html',
      controller: ModalInstanceCtrl,
      resolve: {}
    });
  };
});
cloudscalers.factory('$ErrorResponseAlert',function($alert) {
  return function(reason) {
    if (reason.status === 500 || reason.status === 502 || reason.status === 504 || reason.data === null) {
      $alert('An unexpected error has occurred');
    } else {
      var message = '';
      try {
        message = JSON.parse(reason.data);
        if (typeof message !== 'string') {
          message = reason.data;
        }
      } catch (e) {
        message = reason.data;
        //data is not JSON
      }
      $alert(message);
    }
  };
});

cloudscalers.run(function($templateCache) {
  $templateCache.put('autocomplete-result-template.html',
        '<ul ng-show="show" class="szn-autocomplete-results"> ' +
          '<li ' +
              'szn-autocomplete-result ' +
              'ng-repeat="result in results" ' +
              'ng-class="{selected: highlightIndex === $index}" ' +
              'ng-show="results.length"> ' +
              '<div class="text-left"> ' +
                  '<img class="gravatar" ng-show="result.gravatarurl" ng-src="{[result.gravatarurl]}" /> ' +
                  '<span ng-show="!result.validEmail" ' +
                  'view-as-html="result.value | sznAutocompleteBoldMatch:query"></span> ' +
                  '<span ng-show="result.validEmail">Invite: <strong>{[result.value]}</strong></span> ' +
              '</div> ' +
          '</li> ' +
      '</ul>'
  );
});
