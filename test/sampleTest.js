const assert = require('chai').assert;

describe('This is a test to make sure TravisCI is building and testing correctly', function () {
    it('This is a mock test', function () {
        var result = 2 + 2;
        assert.equal(result, 4);
    })
})