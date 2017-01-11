"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "blacksea",
			"path": "blacksea/blacksea.js",
			"file": "blacksea.js",
			"module": "blacksea",
			"author": "Richeve S. Bebedor",
			"contributors": [
				"John Lenon Maghanoy <johnlenonmaghanoy@gmail.com>"
			],
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/blacksea.git",
			"test": "blacksea-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		Creates a pool of uncaught exception handlers.

		Hard default of 5 handlers, 4 are automatically registered and
			for every emitted event a succeeding handler will be registered.
	@end-module-documentation

	@include:
		{
			"called": "called",
			"exorcise": "exorcise",
			"harden": "harden",
			"protype": "protype",
			"snapd": "snapd"
		}
	@end-include
*/

const called = require( "called" );
const exorcise = require( "exorcise" );
const harden = require( "harden" );
const protype = require( "protype" );
const snapd = require( "snapd" );

const blacksea = function blacksea( logEngine ){
	/*;
		@meta-configuration:
			{
				"logEngine:required": "Olivant"
			}
		@end-meta-configuration
	*/

	if( protype( logEngine, OBJECT ) ){
		logEngine = logEngine.constructor;
	}

	if( !logEngine.prototype.parent ){
		throw new Error( "invalid log engine" );
	}

	if( logEngine.prototype.parent.name != "Olivant" ){
		throw new Error( "invalid log engine" );
	}

	if( blacksea.pool.length == 0 ){
		while( blacksea.pool.length != 5 ){
			blacksea.pool.push( blacksea.handler( logEngine ) );
		}

		while( blacksea.pool.length != 1 ){
			process.once( "uncaughtException", blacksea.pool.pop( ) );
		}
	}

	return logEngine;
};

harden( "pool", blacksea.pool || [ ], blacksea );

harden( "handler", blacksea.handler || function handler( logEngine ){
	return ( function onUncaughtException( ){
		snapd( function pushPool( ){
			if( blacksea.pool.length < 5 ){
				blacksea.pool.push( blacksea.handler( logEngine ) );
			}

		} )( function registerHandler( ){
			process.once( "uncaughtException", blacksea.pool.pop( ) );
		} );

		logEngine( "uncaught exception", arguments )
			.silence( )
			.report( )
			.prompt( );
	} );
}, blacksea );

exorcise( function drain( ){
	process.removeAllListeners( "uncaughtException" );

	while( blacksea.pool.length ){
		blacksea.pool.pop( );
	}
} );

module.exports = blacksea;
