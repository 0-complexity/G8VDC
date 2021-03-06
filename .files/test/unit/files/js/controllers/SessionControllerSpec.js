describe("SessionController tests", function(){
    var $scope, ctrl, $controller, User, $q, $window = {};
    
    beforeEach(module('cloudscalers'));
    
    beforeEach(inject(function($rootScope, _$controller_, _$q_) {
        $scope = $rootScope.$new();
        User = {login : jasmine.createSpy('login')};
        $controller = _$controller_;
        $q = _$q_;
    }));

    it("handles failure", function() {
    	var defer = $q.defer();
        User.login.andReturn(defer.promise);
        ctrl = $controller('SessionController', {$scope : $scope, User : User, $window : $window});

        $scope.user = {username : 'error',password : 'pa$$w0rd'};
        $scope.login();

        defer.reject({status: 403});
        $scope.$digest();
        
        expect(User.login).toHaveBeenCalledWith('error', 'pa$$w0rd');
        expect($scope.loginError).toBe(403);
    });
});

