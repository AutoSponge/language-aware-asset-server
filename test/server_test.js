var fs = require( "fs"),
    http = require("http"),
    server = require("../src/server"),
    testConfig = require("./server_test_config");


server.startServer(testConfig);

function error(test) {

    return function (e) {

        assert.equal (null, e, e );
        test.done();

    };
}

function expect(test, value) {

    return function (chunk) {

        test.equal( chunk, value );
        test.done();

    };
}

module.exports = {

    "test server should respond with english when no accept-language sent": function (test) {

        var req,
            options = {
                hostname: testConfig.host,
                port: testConfig.port,
                path: "http://" + testConfig.host + ":" + testConfig.port + "/test",
                method: "GET"
            };

        req = http.request( options, function (res) {

            res.on( "data", expect( test, "english" ));

        });

        req.on( "error", error(test) );

        req.end();

    },
    "test server should respond with english when preferred": function (test) {

        var req,
            options = {
                hostname: testConfig.host,
                port: testConfig.port,
                path: "http://" + testConfig.host + ":" + testConfig.port + "/test",
                method: "GET",
                headers: {
                    "accept-language": "xx,en-US,en,es;q=0.8"
                }
            };

        req = http.request( options, function (res) {

            res.on( "data", expect( test, "english" ));

        });

        req.on( "error", error(test) );

        req.end();

    },
    "test server should respond with spanish when es accept-language sent": function (test) {

        var req,
            options = {
                hostname: testConfig.host,
                port: testConfig.port,
                path: "http://" + testConfig.host + ":" + testConfig.port + "/test",
                method: "GET",
                headers: {
                    "accept-language": "es,en-US,en;q=0.8"
                }
            };

        req = http.request( options, function (res) {

            res.on( "data", expect( test, "spanish" ));

        });

        req.on( "error", error(test) );

        req.end();

    }
};