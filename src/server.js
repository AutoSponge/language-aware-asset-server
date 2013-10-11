// Language Aware Asset Server
// ---------------------------

// This proof-of-concept project demonstrates
// how you can serve assets based on [browser]
// language preferences passed in the request
// header `Accept-Language`.

// Pull in the node packages we need
// and the asset list.
var fs      = require( "fs" ),
    http    = require( "http" ),
    url     = require( "url" );

// `slice` should convert an array-like object into an array.
function slice(obj) {

    return Array.prototype.slice.call( obj, 0 );

}

// `maybe` should execute an array of functions until
// one returns `true`.
function maybe(fns) {

    return fns.some(function (fn) {

        return fn();

    });

}

// `bind` should take an argument and
// return a function which when
// passed a function, will bind the argument
// to the function.
function bind(arg) {

    return function (fn) {

        return fn.bind( this, arg );

    };
}

// `applyWith` should take a function and
// return a function which
// when passed an array of arguments, will
// apply the arguments to the function.
function applyWith(fn) {

    return function (args) {

        return fn.apply( this, args );

    };

}

// `splitAcceptLanguageHeaders` should take a request
// and split the "accept-language" header into a list
// of ISO language codes.
function splitAcceptLanguageHeaders(req) {

    return ( req.headers["accept-language"] || "" )
        .split( ";" )[0]
        .split( "," );
}

// `findAsset` should take a request and return
// a matching key in the assets object based on the
// request `pathname` property.
function findAsset(req, assets) {

    return assets[url.parse( req.url, true ).pathname.substring( 1 )];

}

// `serveLanguageAsset` should take an asset and path
// then respond streaming the file at the path location
// and return boolean based on the existence of asset.
function serveLanguageAsset(req, res, asset, path) {

    if ( asset && path ) {

        res.end( fs.readFileSync( path ), "binary" );

    }

    return !!(asset && path);
}

// `serveUnmatchedLanguage` should invoke `serveLanguageAsset`
// passing the path of the unmatched language
function serveUnmatchedLanguage(req, res, asset) {

    return serveLanguageAsset( req, res, asset, asset.availableLanguages[asset.unmatched] );

}

// `matchAssetLanguage` attempts to match language
// preferences with provided asset object
function matchAssetLanguage(req, res, asset) {

    return splitAcceptLanguageHeaders( req ).some(function (languageCode) {

        return serveLanguageAsset( req, res, asset, asset.availableLanguages[languageCode] );

    });
}

// Standard error response handler.
function errorNotFound(req, res, asset) {

    res.writeHead( 404, {"Content-Type": "text/plain"} );

    res.end( "File not found. \n" );

}

// When given an asset, `serveAsset` attempts to serve
// the asset or the unmatched (default) asset.  If no
// unmatched asset is provided, respond with an error.
// returns {boolean}
function serveAsset (req, res, asset) {

    if ( asset ) {

        res.writeHead( 200, {"Content-Type": asset.type} );

        maybe( [matchAssetLanguage, serveUnmatchedLanguage, errorNotFound]
            .map( applyWith )
            .map( bind( arguments ) ) );

    }

    return !!asset;
}

// Create our server based on the config provided.
function startServer(config) {

    var assets = require( config.assets );

    http.createServer( function(req, res) {

        // We will serve an asset or
        // return "File not found." message.
        maybe( [serveAsset, errorNotFound]
            .map( applyWith )
            .map( bind( slice( arguments )
                .concat( findAsset( req, assets ) ) ) ) );

    } ).listen( config.port, config.host );

}

exports.startServer = startServer;