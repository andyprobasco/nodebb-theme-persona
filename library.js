'use strict';

var S = require.main.require('string');
var meta = module.parent.require('./meta');
var user = module.parent.require('./user');

var library = {};

library.init = function(params, callback) {
	var app = params.router;
	var middleware = params.middleware;

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
		config.enableQuickReply = settings.enableQuickReply === 'on';
	});

	callback(false, config);
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/themanadrain', {});
}

library.addUserToTopic = function(data, callback) {
	if (data.req.user) {
		user.getUserData(data.req.user.uid, function(err, userdata) {
			if (err) {
				return callback(err);
			}
			
			data.templateData.loggedInUser = userdata;
			callback(null, data);
		});
	} else {
		callback(null, data);
	}
};

// TheManaDrain specific

var decklistRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/mg
var cardNameRegex = /\[\[(.*?)\]\]/g
var decklistSubheadingRegex = /^([^\s\d].*?)$/mg
var decklistCardNameRegex = /^(\d+) (.*?)$/mg

function parseDecklist (raw) {
	var decklists;
	while ( (decklists = decklistRegex.exec(raw)) != null) {
		var rawDecklist = decklists[0];
		var decklistContent = decklists[1];
		if ( decklistContent ) {
			var renderedDecklist = '<div class="decklist">';
			renderedDecklist += decklistContent
					.replace(decklistSubheadingRegex, function (match, subheading) {
						if (subheading.lastIndexOf('# ', 0) === 0) {
							return '<h1>' + subheading.replace('# ', '') + '</h1>';
						} else if (subheading.lastIndexOf('## ', 0) === 0) {
							return '<h2>' + subheading.replace('## ', '') + '</h2>';
						} else {
							return '<h3>' + subheading + '</h3>';
						}
					}).replace(decklistCardNameRegex, function (match, quantity, cardName) {
						return '<div>' + quantity + ' [[' + cardName.replace('<br />', '') + ']] </div>'
					});
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

library.addParentCategoryAsClass = function (data, callback) {
	if (data.templateData.template.topic) {
		data.templateData.bodyClass += ' category-' + data.templateData.category.name.replace(/\ /g, '-');
	}
	callback(null, data);
}

library.addTagsAsClass = function (data, callback) {
	if (data.templateData.template.topic) {
		for (var i=0;i<data.templateData.tags.length;i++) {
			data.templateData.bodyClass += ' tag-' + data.templateData.tags[i].value.replace(/\ /g, '-');
		}
	}
	callback(null, data);
}

library.insertStrategyIntoBreadcrumb = function (data, callback) {
	console.log(data.templateData.breadcrumbs);
	if (data.templateData.breadcrumbs) {
		var breadcrumbs = data.templateData.breadcrumbs.slice()
		for (var i=0;i<breadcrumbs.length;i++) {
			if (breadcrumbs[i].text === 'deck to beat' ||
			    breadcrumbs[i].text === 'primer' ||
			    breadcrumbs[i].text === 'deck tech') {
				data.templateData.breadcrumbs[i-1] = {text: 'Vintage Strategy', url: '/category/1/vintage-strategy'};
			}
		}
	}
	callback(null, data);
}

module.exports = library;
