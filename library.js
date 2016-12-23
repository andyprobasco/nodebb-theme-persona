'use strict';

var S = require.main.require('string');
var	meta = module.parent.require('./meta');

var library = {};

library.init = function(params, callback) {
	var app = params.router;
	var	middleware = params.middleware;

	app.get('/admin/plugins/themanadrain', middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin/plugins/themanadrain', renderAdmin);

	callback();
};

library.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/themanadrain',
		icon: 'fa-paint-brush',
		name: 'The Mana Drain Theme'
	});

	callback(null, header);
};

library.getTeasers = function(data, callback) {
	data.teasers.forEach(function(teaser) {
		if (teaser && teaser.content) {
			teaser.content = S(teaser.content).stripTags('img').s;
		}
	});
	callback(null, data);
};

library.defineWidgetAreas = function(areas, callback) {
	areas = areas.concat([
		{
			name: "Categories Sidebar",
			template: "categories.tpl",
			location: "sidebar"
		},
		{
			name: "Category Sidebar",
			template: "category.tpl",
			location: "sidebar"
		},
		{
			name: "Topic Sidebar",
			template: "topic.tpl",
			location: "sidebar"
		},
		{
			name: "Categories Header",
			template: "categories.tpl",
			location: "header"
		},
		{
			name: "Category Header",
			template: "category.tpl",
			location: "header"
		},
		{
			name: "Topic Header",
			template: "topic.tpl",
			location: "header"
		},
		{
			name: "Categories Footer",
			template: "categories.tpl",
			location: "footer"
		},
		{
			name: "Category Footer",
			template: "category.tpl",
			location: "footer"
		},
		{
			name: "Topic Footer",
			template: "topic.tpl",
			location: "footer"
		}
	]);

	callback(null, areas);
};

library.getThemeConfig = function(config, callback) {

	meta.settings.get('themanadrain', function(err, settings) {
		config.hideSubCategories = settings.hideSubCategories === 'on';
		config.hideCategoryLastPost = settings.hideCategoryLastPost === 'on';
	});

	callback(false, config);
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/themanadrain', {});
}


// TheManaDrain specific

function parseDecklist (raw) {
	var regex = /\[deck(?: name="([\s\S]*?)")?\]([\s\S]*?)\[\/deck\]/m
	var results = regex.exec(raw);
	if ( results ) {
		var fullDeck = results[0];
		var deckname = results[1];
		var deckContent = results[2];
		if ( deckContent ) {
			var renderedDecklist = '<div class="decklist">';
			var ddd = deckContent.replace(/^\D.*?$/mg, function (match) { return '<h2>' + match.replace('<br />', '') + '</h2>' });

			renderedDecklist += ddd;
			renderedDecklist += '</div>';

			return raw.replace(fullDeck, renderedDecklist);
		}
	}

	return raw;
}

library.renderDecklistRaw = function (raw, callback) {
	callback(null, parseDecklist(raw));
}

library.renderDecklistPost = function (data, callback) {
	data.postData.content = parseDecklist(data.postData.content);
	callback(null, data);
}

module.exports = library;
