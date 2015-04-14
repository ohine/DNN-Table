/* globals jQuery */
(function ($) {
	'use strict';

	var DnnTable = function (element, options) {
	},
	dnnTableNoConflict = $.fn.dnnTable;

	DnnTable.DEFAULTS = {
	};

	DnnTable.VERSION = '1.0.0';

	DnnTable.prototype.load = function (inputData, totalRecordCount) {
	};

	function DnnTablePlugin(option, inputData) {
		return this.each(function () {
			var self = $(this),
				data = self.data('dnnTable'),
				options = $.extend(true, { }, DnnTable.DEFAULTS, typeof option === 'object' && option);

			if (!data) {
				self.data('dnnTable', (data = new DnnTable(this, options)));
			}

			if (typeof option === 'string') {
				data[option](inputData);

				if (option === 'destory') {
					self.removeData('dnnTable');
				}
			}
		});
	}

	$.fn.dnnTable = DnnTablePlugin;
	$.dn.dnnTable.constructor = DnnTable;
	$.fn.dnnTable.noConflict = function () {
		$.fn.dnnTable = dnnTableNoConflict;
		return this;
	};
}(jQuery));