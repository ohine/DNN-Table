/* globals jQuery, module, require, define */
(function (factory) {
    'use strict';

    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        module.exports = factory(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
        define('dnnTable', ['jquery'], factory);
    } else {
        factory(jQuery);
    }
} (function ($) {
	'use strict';

	var _uniqueId = 1,
		_cssClasses,
		_errorMessages,
		DnnTable,
		Column,
		PageState,
		dnnTableNoConflict = $.fn.dnnTable;

	_cssClasses = {
		'tableWrapper': 'dnnTable-wrapper',
		'table': 'dnnTable',
		'unqiueTableId': 'dnnTable-id-',
		'pagination': 'dnnTable-pagination',
		'paginationSize': 'dnnTable-pagination--small'
	};

	_errorMessages = {
		'invalidElement': 'Element not supported. Trying initialize dnnTable without using a <table></table> element.',
		'noData': 'No Data',
		'noColumns': 'No columns defined'
	};

	Column = function (columnOptions) {
		var self = this;

		self.visible = columnOptions.visible || true;
		self.title = columnOptions.title || '';
		self.propName = columnOptions.propName || '';
		self.cssClass = columnOptions.cssClass || '';
		self.searchable = columnOptions.searchable || false;
		self.sortable = columnOptions.sortable || false;

		/*
		 * Available options {string} :
		 *	string
		 *	number
		 *	date
		 *	select
		 */
		self.dataType = columnOptions.dataType || '';

		/*
		 *	Available options:
		 *	 @structure : {array}/{string | integer}
		 *	  @example
		 *		 [1, 2, 3, 4, 5]
		 *  - OR -
		 *	 @structure : {array}/{object}
		 *    text {string} : Text displayed to the user.
		 *	  value {string} : Value returned when selected.
		 *	  @example
		 *	 	[ { text = 'Text', value = 'Value' } ]
		 */
		self.availableValues = columnOptions.availableValues || [ ];

		/*
		 * @Function : used to display computed values.
		 * @param {object} : The current DataRow item.
		 * @example
		 *	function(dataRow) { return dataRow['item']; }
		 */
		self.render = columnOptions.render || null;

		/*
		 * Defines a group of buttons objects to display in the column.
		 * @structure : {array}/{object}
		 *	text {string} : The text displayed on the button.
		 *	action {string} : Currently only 'update' and 'delete' are supported.
		 *		   {function} : Callback function for action click event.
		 *				@param {*} : Row key.
		 *				@param {object} : jQuery event object.
		 */
		self.buttons = columnOptions.buttons || [ ];
	};

	PageState = function (pagingOptions) {
		var self = this;

		self.pageIndex = pagingOptions.pageIndex || 1;
		self.pageSize = pagingOptions.pageSize || 10;
	};

	DnnTable = function (element, options) {
		var self = this;

		// Currently only supporting the table element.
		if (element.nodeName !== 'TABLE') {
			throw _errorMessages.invalidElement;
		}

		// Remove all child elements.
		while (element.lastChild) {
			element.removeChild(self.element.lastChild);
		}

		self._options = options;
		self._css = self._options.cssClasses;
		self._id = _uniqueId++;
		self._columns = $.map(self._options.columns || [ ], function (column) {
			return new Column(column);
		});

		self._rowKeyProperty = self._options.rowKeyProperty || '';

		self._totalRecordCount = 0;
		self._allowPaging = self.paging;
		self._allowedPageSizes = self._options.allowedPageSizes;
		self._defaultPageSize = self._options.defaultPageSize;
		self._pageState = new PageState({ pageSize: self._defaultPageSize });

		// TODO: Wrap the _table within a wrapper.
		self._table = $(element).addClass(self._css.table).addClass(self._css.unqiueTableId + self._id);
		self._pagingWrapper = $('<div>').addClass(self._css.pagination).addClass(self._css.paginationSize);

		self.initialize();
	};

	DnnTable.DEFAULTS = {
		'columns': [],
		'serverSide': false,
		'sorting': false,
		'paging': false,
		'searching': false,
		'advancedSearch': false,
		'editable': false,
		'theme': 'default',
		'allowedPageSizes': [10, 20, 30, 40, 50],
		'defaultPageSize': 10,
		'cssClasses': _cssClasses
	};

	DnnTable.VERSION = '1.0.0';

	DnnTable.prototype._clear = function () {
		var self = this;

		if (self._table) {
			self._table.empty().hide();
		}

		if (self._pagingWrapper) {
			self._pagingWrapper.empty().hide();
		}
	};

	DnnTable.prototype._dispose = function () {
		var self = this;

		self._clear();
		self._table = null;
		self._pagingWrapper = null;

		// Remove _table and _page from wrapper
	};

	DnnTable.prototype._api = function (ajaxOptions) {
		$.ajax({
			type: ajaxOptions.type,
			url: ajaxOptions.url,
			beforeSend: ajaxOptions.beforeSend || function () { },
			data: ajaxOptions.data || { }
		}).done(ajaxOptions.done || function () { })
		.fail(ajaxOptions.fail || function () { })
		.always(ajaxOptions.always || function () { });
	};

	DnnTable.prototype._renderTable = function (inputData) {
		var self = this;

		self._table.append(self._renderTableHead());
		self._table.append(self._renderTableBody(inputData));
	};

	DnnTable.prototype._renderTableHead = function () {
		var self = this,
			tableHead,
			tableRow;

		tableHead = $('<thead>').append(tableRow = $('<tr>'));

		$.each(self._columns, function (columnIndex, column) {
			if (!column.visible) {
				return true;
			}

			tableRow.append($('<th>').text(column.title || ''));
		});

		return tableHead;
	};

	DnnTable.prototype._renderTableBody = function (inputData) {
		var self = this,
			tableBody = $('<tbody>');

		if (inputData.length === 0) {
			tableBody.html('<tr><td colspan="' + self._columns.length + '">' + _errorMessages.NoData + '</td></tr>');

			return tableBody;
		}

		$.each(inputData, function (rowIndex, dataRow) {
			var tableRow = $('<tr>');

			self._renderDataRow(tableRow, dataRow);

			tableBody.append(tableRow);
		});

		return tableBody;
	};

	DnnTable.prototype._renderDataRow = function (tableRow, dataRow) {
		var self = this;

		$.each(self._columns, function (columnIndex, column) {
			if (!column.visible) {
				return true;
			}

			var tableData = $('<td>'),
				data;

			if (column.render !== null && column.render instanceof Function) {
				data = column.render(dataRow);
			} else if (dataRow[column.propName] instanceof Function) {
				data = dataRow[column.propName]();
			} else {
				data = dataRow[column.propName];
			}

			tableData.html(data || '');
			tableRow.append(tableData);
		});
	};

	/*
	DnnTable.prototype._renderPaging = function (inputData) {
		var self = this;
	};

	DnnTable.prototype._renderPageButtonList = function (totalRecordCount, pagingState) {
		var self = this;
	};

	DnnTable.prototype._renderPageButtonGap = function () {
		var self = this;
	};

	DnnTable.prototype._renderPageButton = function (pageIndex, isActivePage, isDisabled, label, tip) {
		var self = this;
	}

	DnnTable.prototype._renderPageSizePicker = function (pageSize) {
		var self = this;
	}

	DnnTable.prototype._renderPageStatus = function (totalRecordCount, pagingState) {
		var self = this;
	}
	*/

	DnnTable.prototype.initialize = function () {
		var self = this;

		self._clear();

		if (typeof self._options.data !== 'undefined') {
			self.load(self._options.data, self._options.totalRecordCount);
		} else if (typeof self._options.ajax !== 'undefined' &&
			typeof self._options.ajax.load !== 'undefined') {
			self._api(self._options.ajax.load);
		}
	};

	DnnTable.prototype.load = function (inputData, totalRecordCount) {
		var self = this;

		if (!inputData instanceof Object) {
			throw _errorMessages.noData;
		}

		if (!self._columns instanceof Array || self._columns.length === 0) {
			throw _errorMessages.noColumns;
		}

		self._clear();

		self._totalRecordCount = totalRecordCount;

		self._renderTable(inputData);
		//self._renderPaging(inputData, self._pagingWrapper);

		self._table.show();
		//self._pagingWrapper.show();
	};

	DnnTable.prototype.destory = function () {
		var self = this;

		self._dispose();
	};

	function DnnTablePlugin(option, inputData) {
		return this.each(function () {
			var $self = $(this),
				data = $self.data('dnnTable'),
				options = $.extend(true, { }, DnnTable.DEFAULTS, typeof option === 'object' && option);

			if (!data) {
				$self.data('dnnTable', (data = new DnnTable(this, options)));
			}

			if (typeof option === 'string') {
				data[option](inputData);

				if (option === 'destory') {
					$self.removeData('dnnTable');
				}
			}
		});
	}

	$.fn.dnnTable = DnnTablePlugin;
	$.fn.dnnTable.constructor = DnnTable;
	$.fn.dnnTable.noConflict = function () {
		$.fn.dnnTable = dnnTableNoConflict;
		return this;
	};

	return $.fn.dnnTable;
}));