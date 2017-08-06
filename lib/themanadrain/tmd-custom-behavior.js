library = {}

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
