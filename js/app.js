requirejs.config({
	"baseUrl": "js/lib",
	"paths": {
		"app" : "../app"
	},
	"shim": {
		"jquery.contextMenu": ["jquery"],
		"css": ["codemirror"],
		"htmlmixed": ["codemirror"],
		"xml": ["codemirror"],
		"javascript": ["codemirror"],
		"formatting": ["codemirror"],
		"backbone": ["underscore"],
		"meldbox": [
			"jquery",
			"jquery.contextMenu",
			"codemirror",
			"css",
			"htmlmixed",
			"xml",
			"javascript",
			"formatting",
			"backbone",
			"underscore",
			"base64",
			"md5",
			"utf8_encode",
			"less"
		]
	}
});

requirejs(["app/main"]);
