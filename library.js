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

var decklistRegex = /\[deck(?: name="([\s\S]*?)")?\]([\s\S]*?)\[\/deck\]/mg
var cardNameRegex = /\[\[(.*?)\]\]/g
var decklistSubsectionRegex = /^\D.*?$/mg
var decklistCardNameRegex = /^(\d+) (.*?)$/mg

function parseDecklist (raw) {
	var decklists;
	while ( (decklists = decklistRegex.exec(raw)) != null) {
		var rawDecklist = decklists[0];
		var decklistName = decklists[1];
		var decklistContent = decklists[2];
		if ( decklistContent ) {
			var renderedDecklist = '<div class="decklist">';
			renderedDecklist += decklistContent
					.replace(decklistSubsectionRegex, function (match) { return '<h2>' + match.replace('<br />', '') + '</h2>' })
					.replace(decklistCardNameRegex, function (match, quantity, cardName) {return quantity + ' [[' + cardName.replace('<br />', '') + ']] <br />'});
			renderedDecklist += '</div>';
			raw = raw.replace(rawDecklist, renderedDecklist);
		}
	}

	return raw;
}

function parseCardNames (raw) {
	var cardNames;
	while ((cardNames = cardNameRegex.exec(raw)) != null) {
		var rawCard = cardNames[0];
		var name = cardNames[1];
		raw = raw.replace(rawCard, '<a href="http://magiccards.info/query?q=!' + name.replace(' ', '+') + '">' + name + '</a>');
	}

	return raw;
}


library.renderDecklistRaw = function (raw, callback) {
	raw = parseDecklist(raw);
	raw = parseCardNames(raw);
	callback(null, raw);
}

library.renderDecklistPost = function (data, callback) {
	data.postData.content = parseDecklist(data.postData.content);
	data.postData.content = parseCardNames(data.postData.content);
	callback(null, data);
}

module.exports = library;
