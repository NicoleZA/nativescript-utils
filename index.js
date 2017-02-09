"use strict";
exports.sf = require('sf');
//export var moment = require("moment");
var observable_array_1 = require("data/observable-array");
var platform_1 = require("platform");
var moment = require("moment");
var observableModule = require("data/observable");
var fileSystemModule = require("file-system");
/** Tagging Functions */
var Tagging = (function () {
    function Tagging() {
        /** default tag icon */
        this.tagIcon = String.fromCharCode(0xf046);
        /** default untag icon */
        this.unTagIcon = String.fromCharCode(0xf096);
    }
    /** Create a new observable tag object
    * If icon is left blank the default icon is used
    */
    Tagging.prototype.newTag = function (icon) {
        if (!icon)
            icon = this.unTagIcon;
        var a = new observableModule.Observable();
        a.set("value", icon);
        return a;
        //		return new observableModule.Observable({ value: icon });
    };
    /** set all array objects tag property to the default tagged icon object */
    Tagging.prototype.tagAll = function (array) {
        for (var i = 0; i < array.length; i++) {
            if (!array[i].tag)
                array[i].tag = exports.tagging.newTag();
            array[i].tag.set("value", exports.tagging.tagIcon);
        }
        return array;
    };
    /** set all array objects tag property to the default untagged icon object */
    Tagging.prototype.unTagAll = function (array) {
        var me = this;
        for (var i = 0; i < array.length; i++) {
            if (!array[i].tag)
                array[i].tag = exports.tagging.newTag();
            array[i].tag.set("value", exports.tagging.unTagIcon);
        }
        return array;
    };
    /** get the toggled tag icon */
    Tagging.prototype.toggleTagIcon = function (icon) {
        if (icon == this.tagIcon) {
            return this.unTagIcon;
        }
        else {
            return this.tagIcon;
        }
    };
    /** Toggle tag observable */
    Tagging.prototype.toggleTag = function (tag) {
        var me = this;
        if (!tag)
            tag = exports.tagging.newTag();
        var icon = exports.tagging.toggleTagIcon(tag.get("value"));
        tag.set("value", icon);
        return tag;
    };
    /** Toggle the rows tag property */
    Tagging.prototype.toggleRow = function (row) {
        var me = this;
        if (!row)
            return null;
        me.toggleTag(row.tag);
        return row;
    };
    /** Toggle the observable tag object */
    Tagging.prototype.toggleObservable = function (obervableTag) {
        return this.newTag(this.toggleTagIcon(obervableTag.get("value")));
    };
    /** Toggle the observable rows tag object */
    Tagging.prototype.toggleObservableRow = function (array, index) {
        var row = this.toggleRow(array.getItem(index));
        array.setItem(index, row);
        return array;
    };
    /** get number of items in the array */
    Tagging.prototype.count = function (array) {
        if (!array)
            return 0;
        return array.length;
    };
    /** get number of tagged items in the array */
    Tagging.prototype.countTagged = function (array) {
        if (!array)
            return 0;
        return this.getTaggedRows(array).length;
    };
    /** get number of untagged items in the array */
    Tagging.prototype.countUntagged = function (array) {
        if (!array)
            return 0;
        return this.getTaggedRows(array).length;
    };
    /** return the tagged rows from the array */
    Tagging.prototype.getTaggedRows = function (array) {
        var me = this;
        if (!array)
            return null;
        var taggedRows = array.filter(function (x) {
            return (x.tag && x.tag.get("value") == me.tagIcon);
        });
        return taggedRows;
    };
    /** return the untagged rows from the array */
    Tagging.prototype.getUnTaggedRows = function (array) {
        var me = this;
        var taggedRows = array.filter(function (x) {
            return (x.tag && x.tag.get("value") == me.unTagIcon);
        });
        return taggedRows;
    };
    return Tagging;
}());
/** Sql Functions */
var Sql = (function () {
    function Sql() {
    }
    //other
    /** return a sql snipped to fetch a clarion date from the database as a standard date*/
    Sql.prototype.date = function (field) {
        return exports.sf("convert(varchar,convert(datetime,{0}-36163),103)", field);
    };
    return Sql;
}());
/** String Functions */
var Str = (function () {
    function Str() {
    }
    /** return a URI encoded string */
    Str.prototype.fixedEncodeURIComponent = function (url) {
        return encodeURIComponent(url).replace(/[!'()*]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    };
    /** return a filtered observable array where the named field(property) contains specific text (case insensitive) */
    Str.prototype.filterArray = function (data, searchField, searchText) {
        searchText = searchText.toLowerCase();
        var filteredData = data.filter(function (x) {
            return (x[searchField] && x[searchField].toLowerCase().indexOf(searchText) >= 0);
        });
        return new observable_array_1.ObservableArray(filteredData);
    };
    /** return a filtered observable array where the named fields(properties) contains specific text (case insensitive) */
    Str.prototype.filterArrayByArray = function (data, searchField, searchText) {
        searchText = searchText.toLowerCase();
        var filteredData = data.filter(function (x) {
            for (var i = 0; i < searchField.length; i++) {
                if (x[searchField[i]] && x[searchField[i]].toString().toLowerCase().indexOf(searchText) >= 0)
                    return true;
            }
            return false;
        });
        return new observable_array_1.ObservableArray(filteredData);
    };
    /** return true if a string contains any item in the substring array) */
    Str.prototype.containsAny = function (str, substrings) {
        for (var i = 0; i != substrings.length; i++) {
            if (str.indexOf(substrings[i]) != -1)
                return true;
        }
        return false;
    };
    /** return a filtered array where the named field(property) contains specific text (case insensitive) */
    Str.prototype.getArrayItems = function (array, searchField, searchValue) {
        return array.filter(function (obj) {
            return obj[searchField] == searchValue;
        });
    };
    /** return a filtered array where the named fields(properties) contains specific text (case insensitive) */
    Str.prototype.getArrayItemsByArray = function (data, searchField, searchText) {
        if (!searchText)
            return data;
        searchText = searchText.toLowerCase();
        var filteredData = data.filter(function (x) {
            for (var i = 0; i < searchField.length; i++) {
                if (x[searchField[i]] && x[searchField[i]].toString().toLowerCase().indexOf(searchText) >= 0)
                    return true;
            }
            return false;
        });
        return filteredData;
    };
    /** get the first item from an array where the named field(property) contains specific text (case insensitive) */
    Str.prototype.getArrayItem = function (array, searchField, searchValue) {
        return this.getArrayItems(array, searchField, searchValue)[0];
    };
    /** convert an array to and observable array */
    Str.prototype.observableArray = function (array) {
        return new observable_array_1.ObservableArray(array);
    };
    /** Extract objects from array  */
    Str.prototype.getArrayObjects = function (array, objectName) {
        return array.map(function (x) { return x[objectName]; });
    };
    /** replaces an existing observableArrays data with a new array  */
    Str.prototype.replaceArray = function (array, withArray) {
        array.splice(0);
        this.appendArray(array, withArray);
    };
    /** appends an existing observableArrays data with a new array  */
    Str.prototype.appendArray = function (array, withArray) {
        //	observable array causes problems if the array item is not an observable.
        //  for (var index = 0; index < withArray.length; index++) {
        // 	  array.push(withArray[index]);
        //  }
        if (!withArray)
            return;
        for (var index = 0; index < withArray.length; index++) {
            var row = withArray[index];
            var oRow = new observableModule.Observable();
            Object.keys(row).forEach(function (key) {
                oRow.set(key, row[key]);
            });
            array.push(oRow);
        }
    };
    Str.prototype.EnumToArray = function (EnumObj) {
        var returnValue = [];
        for (var key in EnumObj) {
            if (typeof EnumObj[key] === "string")
                returnValue.push(EnumObj[key].replace(/_/g, " "));
        }
        ;
        return returnValue;
    };
    return Str;
}());
/** Date Functions */
var Dt = (function () {
    function Dt() {
    }
    Dt.prototype.moment = function (date) {
        if (!date) {
            return moment();
        }
        else {
            return moment(date);
        }
    };
    //Years -------------------------------------------------------------------------------
    /** add a year to a date */
    Dt.prototype.dateAddYears = function (day, date) {
        if (!date)
            date = new Date();
        return moment(date).add(day, 'years').toDate();
    };
    /** start of year */
    Dt.prototype.dateYearStart = function (date, addYears) {
        if (!date)
            date = new Date();
        return moment(date).startOf('year').add(addYears || 0, "years").toDate();
    };
    /** end of year */
    Dt.prototype.dateYearEnd = function (date, addYears) {
        if (!date)
            date = new Date();
        return moment(date).endOf('year').add(addYears || 0, "years").toDate();
    };
    //Months ------------------------------------------------------------------------------
    /** add a month to a date */
    Dt.prototype.dateAddMonths = function (day, date) {
        if (!date)
            date = new Date();
        return moment(date).add(day, 'months').toDate();
    };
    /** start of month */
    Dt.prototype.dateMonthStart = function (date, addMonths) {
        if (!date)
            date = new Date();
        return moment(date).startOf('month').add(addMonths || 0, 'months').toDate();
    };
    /** end of month */
    Dt.prototype.dateMonthEnd = function (date, addMonths) {
        if (!date)
            date = new Date();
        return moment(date).endOf('month').add(addMonths || 0, 'months').toDate();
    };
    //Days --------------------------------------------------------------------------------
    /** add a day to a date */
    Dt.prototype.dateAddDays = function (day, date) {
        if (!date)
            date = new Date();
        return moment(date).add(day, 'days').toDate();
    };
    //Weeks -------------------------------------------------------------------------------
    /** start of week */
    Dt.prototype.dateWeekStart = function (date, addWeeks) {
        if (!date)
            date = new Date();
        return moment(date).startOf('isoWeek').add(addWeeks || 0, 'weeks').toDate();
    };
    /** end of week */
    Dt.prototype.dateWeekEnd = function (date, addWeeks) {
        if (!date)
            date = new Date();
        return moment(date).endOf('isoWeek').add(addWeeks || 0, 'weeks').toDate();
    };
    //convert to string -------------------------------------------------------------------------------
    /** convert a date to a string (YYYY-MM-DD) */
    Dt.prototype.dateToStrYMD = function (date) {
        if (!date) {
            return moment().format('YYYY-MM-DD');
        }
        else {
            return moment(date).format('YYYY-MM-DD');
        }
    };
    /** convert a date to a string (DD/MM/YYYY) */
    Dt.prototype.dateToStr = function (date) {
        if (!date) {
            return moment().format('DD/MM/YYYY');
        }
        else {
            return moment(date).format('DD/MM/YYYY');
        }
    };
    /** convert a string (DD/MM/YYYY) to a date */
    Dt.prototype.strToDate = function (date) {
        if (!date) {
            moment().toDate();
        }
        else {
            return moment(date, 'DD/MM/YYYY').toDate();
        }
    };
    /** convert a date to a moment object */
    Dt.prototype.strToMoment = function (date) {
        if (!date) {
            return moment();
        }
        else {
            return moment(date, 'DD/MM/YYYY');
        }
    };
    /** convert a date to a clarion date */
    Dt.prototype.clarionDate = function (date) {
        if (!date)
            date = new Date();
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
    /** remove the focus from a view object */
    ViewExt.prototype.clearAndDismiss = function (view) {
        if (!view)
            return;
        this.dismissSoftInput(view);
        this.clearFocus(view);
    };
    /** remove the focus from a view object */
    ViewExt.prototype.clearFocus = function (view) {
        if (!view)
            return;
        if (platform_1.isAndroid)
            if (view.android)
                view.android.clearFocus();
    };
    /** hide the soft keyboard from a view object */
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
/** a value list array */
var ValueList = (function () {
    function ValueList(array) {
        this.items = array;
    }
    Object.defineProperty(ValueList.prototype, "length", {
        /** the number of items */
        get: function () { return this.items.length; },
        enumerable: true,
        configurable: true
    });
    /** add a new item to the list */
    ValueList.prototype.addItem = function (item) {
        this.items.push(item);
    };
    /** add a new item to the beginning of the list */
    ValueList.prototype.addItemFront = function (item) {
        this.items.unshift(item);
    };
    /** get the list of value items */
    ValueList.prototype.getItems = function () {
        return this.items;
    };
    /** get an item by its index */
    ValueList.prototype.getItem = function (index) {
        if (index < 0 || index >= this.items.length) {
            return null;
        }
        return this.items[index];
    };
    /** get the items display value by its index */
    ValueList.prototype.getText = function (index) {
        if (index < 0 || index >= this.items.length) {
            return "";
        }
        return this.items[index].DisplayMember;
    };
    /** get an array of the items text field  */
    ValueList.prototype.getTextArray = function () {
        var me = this;
        return me.items.map(function (x) { return x.DisplayMember; });
    };
    /** get the items value by its index */
    ValueList.prototype.getValue = function (index) {
        if (index < 0 || index >= this.items.length) {
            return null;
        }
        return this.items[index].ValueMember;
    };
    /** get the items index by its value, use default index if not found else return -1 */
    ValueList.prototype.getIndex = function (value, defaultIndex) {
        var loop;
        for (loop = 0; loop < this.items.length; loop++) {
            if (this.getValue(loop) == value) {
                return loop;
            }
        }
        return defaultIndex == null ? -1 : defaultIndex;
    };
    return ValueList;
}());
exports.ValueList = ValueList;
var File = (function () {
    function File() {
        this.folder = fileSystemModule.knownFolders.documents();
        // public deleteFile(party: string) {
        // 	var file = fileSystemModule.knownFolders.documents().getFile(party);
        // 	file.
        // }
    }
    /** load json from a file */
    File.prototype.exists = function (filename) {
        var me = this;
        return me.folder.contains(filename);
    };
    /** load json from a file */
    File.prototype.loadJSONFile = function (filename) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var file = me.folder.getFile(filename);
            file.readText().then(function (content) {
                var returnValue = null;
                if (content != "")
                    returnValue = JSON.parse(content);
                resolve(returnValue);
            })["catch"](function (err) {
                reject(err);
            });
        });
    };
    /** save json to a file */
    File.prototype.saveJSONFile = function (filename, data) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var file = me.folder.getFile(filename);
            file.writeText(JSON.stringify(data)).then(function (content) {
                resolve(content);
            })["catch"](function (err) {
                reject(err);
            });
        });
    };
    //** empty the file */
    File.prototype.clearJSONFile = function (filename, data) {
        var file = this.folder.getFile(filename);
        file.writeText(JSON.stringify({}));
    };
    //** create a full filename including the folder for the current app */
    File.prototype.getFullFilename = function (party) {
        var me = this;
        return fileSystemModule.path.join(me.folder.path, party);
    };
    return File;
}());
exports.tagging = new Tagging();
exports.str = new Str();
exports.sql = new Sql();
exports.dt = new Dt();
exports.viewExt = new ViewExt();
exports.file = new File();
