'use strict';
/* globals $, app */

define('admin/plugins/themanadrain', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('themanadrain', $('.themanadrain-settings'));

		$('#save').on('click', function() {
			Settings.save('themanadrain', $('.themanadrain-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'themanadrain-saved',
					title: 'Settings Saved',
					message: 'The Mana Drain Theme settings saved'
				});
			});
		});
	};

	return ACP;
});
