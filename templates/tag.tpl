<!-- IMPORT partials/breadcrumbs.tpl -->
<div widget-area="header">
	<!-- BEGIN widgets.header -->
	{{widgets.header.html}}
	<!-- END widgets.header -->
</div>

<div class="tag">
	<div class="clearfix">
		<div class="pull-right">
			<!-- IF loggedIn -->
			<button component="category/post" id="new_topic" class="btn btn-primary">[[category:new_topic_button]]</button>
			<!-- ELSE -->
			<a component="category/post/guest" href="{config.relative_path}/login" class="btn btn-primary">[[category:guest-login-post]]</a>
			<!-- ENDIF loggedIn -->
		</div>
	</div>

	<hr class="hidden-xs"/>

	<!-- IF !topics.length -->
	<div class="alert alert-warning">[[tags:no_tag_topics]]</div>
	<!-- ENDIF !topics.length -->

	<div class="category">
		<!-- IMPORT partials/topics_list.tpl -->
		<button id="load-more-btn" class="btn btn-primary hide">[[unread:load_more]]</button>
		<!-- IF config.usePagination -->
			<!-- IMPORT partials/paginator.tpl -->
		<!-- ENDIF config.usePagination -->
	</div>
</div>
