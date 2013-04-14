/*
 * jquery.endlesslist.js - jQuery plugin.
 *
 * Created by froop http://github.com/froop/jquery-endless-list
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
/*global jQuery, window, document */
(function ($) {
	"use strict";

	/**
	 * 一覧の末尾以降に未読込みの行がある場合に追加する空行.
	 * @param {jQuery} $list
	 */
	var NextPlaceHolder = function ($list) {
		var CLASS_NAME = "endless-next-place";

		this.append = function () {
			$list.append($("<li class='" + CLASS_NAME + "'></li>"));
		};

		this.remove = function () {
			$("." + CLASS_NAME, $list).remove();
		};

		this.exists = function () {
			return $("." + CLASS_NAME, $list).length > 0;
		};
	};

	/**
	 * Event listener on scroll.
	 * @param {Event} event
	 */
	function scrollListener(event) {
		var $list = event.data.$list;
		var callback = event.data.callback;
		var $lastItem = null;

		if (!$list.is(":visible")) {
			return;
		}
		$lastItem = $("li:last", $list);

		function isScrollLast() {
			var lastItemTop = $lastItem.offset() ? $lastItem.offset().top : 0;
			return $(window).scrollTop() + window.innerHeight > lastItemTop;
		}

		if ($lastItem.length === 0) {
			return;
		}

		if (new NextPlaceHolder($list).exists() && isScrollLast()) {
			callback(scrollListener);
		}
	}

	/**
	 * Main.
	 * @param {Object} options
	 */
	$.fn.endlessList = function (options) {
		var $list = this;
		var defaults = {
				asyncLoad : function () {},
				hasNext : function () {},
				afterLoad : function () {}
		};
		var setting = $.extend(defaults, options);

		function appendList() {
			var promise = setting.asyncLoad();

			$(document).off("scroll", scrollListener);

			promise.done(function () {
				var nextPlace = new NextPlaceHolder($list);
				nextPlace.remove();

				if (setting.hasNext()) {
					nextPlace.append();
					$(document).on("scroll", {
						$list : $list,
						callback : appendList
					}, scrollListener);

					// スクロールのある高さになるまでリストを拡張
					$(document).triggerHandler("scroll");
				}

				setting.afterLoad();
			});
		}

		appendList();
		return this;
	};
})(jQuery);
