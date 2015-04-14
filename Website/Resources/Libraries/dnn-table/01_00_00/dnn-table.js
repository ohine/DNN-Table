/* globals jQuery */
(function ($) {
	'use strict';

	var instanceId = 1,
	DnnTable = function (element, options) {
		var self = this;

		// Currently only supporting the table element.
		if (element.nodeName !== "TABLE") {
			throw 'Element not supported. Trying using a <table></table> element.';
		}

		// Verify that initial data is supplied.
		if (typeof options === 'undefined' ||
			(typeof options.data === 'undefined' &&
			(typeof options.ajax === 'undefined' ||
			typeof options.ajax.load === 'undefined'))) {
			throw 'Initial data not supplied. Use "data" or "ajax": { "load": {} }';
		}
		
		self.options = options;
		self.element = element;
		self.instanceId = instanceId++;

		// Remove all child elements.
		while (self.element.lastChild) {
			self.element.removeChild(self.element.lastChild);
		}

		// Add a class to define the instance of the dnnTable on the page.
		if (self.element.classList) {
			self.element.classList.add('dnnTable');
			self.element.classList.add('dnnTable-id-' + self.instanceId);
		} else {
			self.element.className += 'dnnTable';
			self.element.className += 'dnnTable-id-' + self.instanceId;
		}
		
		self.load(options.data || options.ajax.load, options.totalRecordCount);
	},
	dnnTableNoConflict = $.fn.dnnTable;

	DnnTable.DEFAULTS = {
		'columns': [],
		'serverSide': false,
		'sorting': false,
		'paging': false,
		'searching': false,
		'advancedSearch': false,
		'editable': false,
		'theme': 'default'
	};

	DnnTable.VERSION = '1.0.0';

	DnnTable.prototype.load = function (inputData, totalRecordCount) {
		var self = this;
	};
	
	DnnTable.prototype.destory = function () {
		var self = this;
		
		// Remove all child elements.
		while (self.element.lastChild) {
			self.element.removeChild(self.element.lastChild);
		}
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