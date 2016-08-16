"use strict";
exports.sf = require('sf');
exports.moment = require("moment");
var observable_array_1 = require("data/observable-array");
var platform_1 = require("platform");
var observableModule = require("data/observable");
/// Tagging ------------
var Tagging = (function () {
    function Tagging() {
        this.tagIcon = String.fromCharCode(0xf046);
        this.unTagIcon = String.fromCharCode(0xf096);
    }
    Tagging.prototype.newTag = function (icon) {
        if (!icon)
            icon = this.unTagIcon;
        return new observableModule.Observable({ value: icon });
    };
    Tagging.prototype.clearAll = function (array) {
        for (var i = 0; i < array.length; i++) {
            //			array[i].tag = ""
            array[i].tag = this.newTag();
        }
        return array;
    };
    Tagging.prototype.tagAll = function (array) {
        var me = this;
        for (var i = 0; i < array.length; i++) {
            array[i].tag = me.newTag(me.tagIcon);
        }
        return array;
    };
    Tagging.prototype.unTagAll = function (array) {
        var me = this;
        for (var i = 0; i < array.length; i++) {
            array[i].tag = me.newTag(me.unTagIcon);
        }
        return array;
    };
    Tagging.prototype.toggleTagIcon = function (icon) {
        if (icon == this.tagIcon) {
            return this.unTagIcon;
        }
        else {
            return this.tagIcon;
        }
    };
    Tagging.prototype.toggleRow = function (row) {
        if (!row)
            return null;
        row.tag = this.newTag(this.toggleTagIcon(row.tag));
        return row;
    };
    Tagging.prototype.toggleObservable = function (obervableTag) {
        return this.newTag(this.toggleTagIcon(obervableTag.get("value")));
    };
    Tagging.prototype.toggleObservableRow = function (array, index) {
        var row = this.toggleRow(array.getItem(index));
        array.setItem(index, row);
        return array;
    };
    Tagging.prototype.count = function (array) {
        if (!array)
            return 0;
        return array.length;
    };
    Tagging.prototype.countTagged = function (array) {
        if (!array)
            return 0;
        return this.getTaggedRows(array).length;
    };
    Tagging.prototype.countUntagged = function (array) {
        if (!array)
            return 0;
        return this.getTaggedRows(array).length;
    };
    Tagging.prototype.getTaggedRows = function (array) {
        var me = this;
        if (!array)
            return null;
        var taggedRows = array.filter(function (x) {
            return (x.tag && x.tag.get("value") == me.tagIcon);
        });
        return taggedRows;
    };
    Tagging.prototype.getUnTaggedRows = function (array) {
        var me = this;
        var taggedRows = array.filter(function (x) {
            return (x.tag && x.tag.get("value") == me.unTagIcon);
        });
        return taggedRows;
    };
    return Tagging;
}());
var Sql = (function () {
    function Sql() {
    }
    //other
    Sql.prototype.dateField = function (field, description) {
        return exports.sf("convert(varchar,convert(datetime,{0}-36163),103) {0}", field, description || field);
    };
    Sql.prototype.date = function (field) {
        return exports.sf("convert(varchar,convert(datetime,{0}-36163),103)", field);
    };
    return Sql;
}());
var Str = (function () {
    function Str() {
    }
    Str.prototype.fixedEncodeURIComponent = function (url) {
        return encodeURIComponent(url).replace(/[!'()*]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    };
    Str.prototype.filterArray = function (data, searchField, searchText) {
        searchText = searchText.toLowerCase();
        var filteredData = data.filter(function (x) {
            return (x[searchField] && x[searchField].toLowerCase().indexOf(searchText) >= 0);
        });
        return new observable_array_1.ObservableArray(filteredData);
    };
    Str.prototype.filterArrayByArray = function (data, searchField, searchText) {
        searchText = searchText.toLowerCase();
        var filteredData = data.filter(function (x) {
            for (var i = 0; i < searchField.length; i++) {
                if (x[searchField[i]] && x[searchField[i]].toLowerCase().indexOf(searchText) >= 0)
                    return true;
            }
            return false;
        });
        return new observable_array_1.ObservableArray(filteredData);
    };
    Str.prototype.containsAny = function (str, substrings) {
        for (var i = 0; i != substrings.length; i++) {
            if (str.indexOf(substrings[i]) != -1)
                return true;
        }
        return false;
    };
    ///get all rows where an object has a specific value
    Str.prototype.getArrayItems = function (array, searchField, searchValue) {
        return array.filter(function (obj) {
            return obj[searchField] == searchValue;
        });
    };
    Str.prototype.getArrayItem = function (array, searchField, searchValue) {
        return this.getArrayItems(array, searchField, searchValue)[0];
    };
    ///convert an array to and observable array
    Str.prototype.observableArray = function (array) {
        return new observable_array_1.ObservableArray(array);
    };
    ///Extract objects from array 
    Str.prototype.getArrayObjects = function (array, objectName) {
        return array.map(function (x) { return x[objectName]; });
    };
    return Str;
}());
var Dt = (function () {
    function Dt() {
    }
    Dt.prototype.dateToStr = function (date) {
        if (!date) {
            return exports.moment().format('DD/MM/YYYY');
        }
        else {
            return exports.moment(date).format('DD/MM/YYYY');
        }
    };
    Dt.prototype.strToDate = function (date) {
        if (!date) {
            exports.moment().toDate();
        }
        else {
            return exports.moment(date, 'DD/MM/YYYY').toDate();
        }
    };
    Dt.prototype.strToMoment = function (date) {
        if (!date) {
            return exports.moment();
        }
        else {
            return exports.moment(date, 'DD/MM/YYYY');
        }
    };
    Dt.prototype.clarionDate = function (date) {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var startDate = new Date("December 28, 1800");
        var diffDays = Math.round(Math.abs((date.getTime() - startDate.getTime()) / (oneDay)));
        return diffDays;
    };
    return Dt;
}());
var ViewExt = (function () {
    function ViewExt() {
    }
    ViewExt.prototype.clearFocus = function (view) {
        if (!view)
            return;
        if (platform_1.isAndroid)
            if (view.android)
                view.android.clearFocus();
    };
    ViewExt.prototype.dismissSoftInput = function (view) {
        if (!view)
            return;
        try {
            view.dismissSoftInput();
        }
        catch (error) {
        }
    };
    return ViewExt;
}());
exports.tagging = new Tagging();
exports.str = new Str();
exports.sql = new Sql();
exports.dt = new Dt();
exports.viewExt = new ViewExt();
//# sourceMappingURL=index.js.map