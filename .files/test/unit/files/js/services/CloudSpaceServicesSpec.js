describe('CloudSpaceServices', function() {
    var $httpBackend, Account;

    beforeEach(module('cloudscalers.services'));

    beforeEach(inject(function(_$httpBackend_, _CloudSpace_) {
        $httpBackend = _$httpBackend_;
        CloudSpace = _CloudSpace_;
        defineUnitApiStub($httpBackend);
    }));

    it('can list all CloudSpaces', function() {
        var CloudSpaceList;
        CloudSpace.list().then(function(result) {
            CloudSpaceList = result;
        });
    
        expect(CloudSpaceList).toBeUndefined();
        $httpBackend.flush();
        expect(CloudSpaceList).toBeDefined();
        expect(CloudSpaceList.length).toBe(8);
        expect(CloudSpaceList[2]).toEqual({id: '3', name: 'Cloudspace 3', accountId: '2'});
    });

    it('can add user', function() {
        var addUserResult;
        CloudSpace.addUser({id: 1}, 'user 10', {'R': true}).then(function(result) {
            addUserResult = result;
        });
        expect(addUserResult).toBeUndefined();
        $httpBackend.flush();
        expect(addUserResult).toEqual("Success");
    });

    it('can delete user', function() {
        var deleteUserResult;
        CloudSpace.deleteUser({id: 1}, 'user 10').then(function(result) {
            deleteUserResult = result;
        });
        expect(deleteUserResult).toBeUndefined();
        $httpBackend.flush();
        expect(deleteUserResult).toEqual("Success");
    });
});