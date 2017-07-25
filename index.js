"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var application = require("application");
var moment = require("moment");
var observableModule = require("data/observable");
var fileSystemModule = require("file-system");
var frame_1 = require("ui/frame");
var phone = require("nativescript-phone");
var email = require("nativescript-email");
var http = require("http");
//import * as autocompleteModule from 'nativescript-telerik-ui-pro/autocomplete';
var observable_array_1 = require("data/observable-array");
var platform_1 = require("platform");
var utils_1 = require("utils/utils");
//Miscellanious Functions
var Utils = (function () {
    function Utils() {
    }
    //Create a new instance of an object from an existing one
    Utils.prototype.createInstanceFromJson = function (objType, json) {
        var me = this;
        var newObj = new objType();
        var relationships = objType["relationships"] || {};
        for (var prop in json) {
            if (json.hasOwnProperty(prop)) {
                if (newObj[prop] == null) {
                    if (relationships[prop] == null) {
                        newObj[prop] = json[prop];
                    }
                    else {
                        newObj[prop] = me.createInstanceFromJson(relationships[prop], json[prop]);
                    }
                }
                else {
                    console.warn("Property " + prop + " not set because it already existed on the object.");
                }
            }
        }
        return newObj;
    };
    //adds missing functions to object
    Utils.prototype.initObject = function (objType, json) {
        var me = this;
        var newObj = new objType();
        var relationships = objType["relationships"] || {};
        for (var prop in newObj) {
            if (newObj.hasOwnProperty(prop)) {
                console.warn("Add " + prop + ".");
                if (json[prop] == null) {
                    if (relationships[prop] == null) {
                        json[prop] = newObj[prop];
                    }
                    else {
                        json[prop] = me.createInstanceFromJson(relationships[prop], newObj[prop]);
                    }
                }
                else {
                    console.warn("Property " + prop + " not set because it already existed on the object.");
                }
            }
        }
    };
    return Utils;
}());
exports.Utils = Utils;
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
exports.Tagging = Tagging;
/** Sql Functions */
var Sql = (function () {
    function Sql() {
    }
    //other
    /** return a sql snipped to fetch a clarion date from the database as a standard date*/
    Sql.prototype.date = function (field) {
        return "convert(varchar,convert(datetime," + field + "-36163),103)";
    };
    return Sql;
}());
exports.Sql = Sql;
/** String Functions */
var Str = (function () {
    function Str() {
    }
    Str.prototype.capitalise = function (value) {
        var returnValue = value.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        return returnValue;
    };
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
    /** return true if te string is in the array */
    Str.prototype.inList = function (value, listArray) {
        if (listArray.indexOf(value) >= 0)
            return true;
        return false;
    };
    /** return true if a string contains any item in the substring array) */
    Str.prototype.containsAny = function (str, substrings) {
        for (var i = 0; i != substrings.length; i++) {
            if (str.indexOf(substrings[i]) != -1)
                return true;
        }
        return false;
    };
    /** find index in array of objects */
    Str.prototype.arrayIndexOf = function (array, searchField, searchValue) {
        for (var i = 0; i != array.length; i++) {
            var field = array[i][searchField];
            if (field = searchValue)
                return i;
        }
        return -1;
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
        var returnValue = new observable_array_1.ObservableArray(array);
        returnValue.splice(0);
        return returnValue;
    };
    /** convert an array to and observable array */
    Str.prototype.observable = function (obj) {
        return observableModule.fromObject(obj);
    };
    /** Create observableed row fields as Observables objects to parent as tablename_fieldname  */
    Str.prototype.objToObservable = function (me, obj, prefix) {
        if (!me)
            return;
        Object.keys(obj).forEach(function (key) {
            me.set((prefix || '') + "_" + key, obj[key]);
        });
    };
    /** check if object is empty  */
    Str.prototype.isEmptyObject = function (obj) {
        return Object.getOwnPropertyNames(obj).length === 0;
    };
    /** get a column array from an object  */
    Str.prototype.getItemArrayFromObject = function (array, objectName) {
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
    /** Utility function to create a K:V from a list of strings */
    Str.prototype.strEnum = function (o) {
        return o.reduce(function (res, key) {
            res[key] = key;
            return res;
        }, Object.create(null));
    };
    return Str;
}());
exports.Str = Str;
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
    //Hours --------------------------------------------------------------------------------
    /** add a hour to a date */
    Dt.prototype.dateAddHours = function (hour, date) {
        if (!date)
            date = new Date();
        return moment(date).add(hour, 'hours').toDate();
    };
    //Minutes --------------------------------------------------------------------------------
    /** add a minutes to a date */
    Dt.prototype.dateAddMinutes = function (minutes, date) {
        if (!date)
            date = new Date();
        return moment(date).add(minutes, 'minutes').toDate();
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
    Dt.prototype.dateToStr = function (date, format) {
        var me = this;
        switch (format) {
            case "D MMMM YYYY":
                var d = date || new Date();
                return d.getDate() + ' ' + me.monthName(d.getMonth() + 1) + ' ' + d.getFullYear();
            case "D MMM YYYY":
                var d = date || new Date();
                return d.getDate() + ' ' + me.monthShortName(d.getMonth() + 1) + ' ' + d.getFullYear();
            case "YYYY-MM-DD":
                return moment(date).format(format);
            default:
                return moment(date).format('DD/MM/YYYY');
        }
    };
    /** convert a date to a string (DD/MM/YYYY) */
    Dt.prototype.timeToStr = function (date) {
        return moment(date).format('hh:mm A');
    };
    /** convert a string to a date
     ** Default format:  (DD/MM/YYYY)
    */
    Dt.prototype.strToDate = function (date, format) {
        if (!date) {
            moment().toDate();
        }
        else {
            if (format)
                date = date.substr(0, format.length);
            return moment(date, format || 'DD/MM/YYYY').toDate();
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
    /** convert a date to a clarion date */
    Dt.prototype.clarionDateToDate = function (clarionDate) {
        if (!clarionDate)
            return new Date();
        return this.dateAddDays(clarionDate, new Date("December 28, 1800"));
    };
    /** convert a date to a clarion date */
    Dt.prototype.shortMonth = function (clarionDate) {
        var me = this;
        var date = me.clarionDateToDate(clarionDate);
        return me.monthShortName(date.getMonth() + 1);
    };
    /** convert a date to a clarion date */
    Dt.prototype.monthYear = function (clarionDate) {
        var me = this;
        var date = me.clarionDateToDate(clarionDate);
        return me.monthShortName(date.getMonth() + 1) + '`' + date.getFullYear().toString().substr(2, 2);
    };
    /** get short description for month */
    Dt.prototype.monthShortName = function (month) {
        if (!month)
            return '';
        var month_names_short = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var monthName = month_names_short[month];
        return monthName;
    };
    /** get short description for month */
    Dt.prototype.monthName = function (month) {
        if (!month)
            return '';
        var month_names_short = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octover', 'November', 'December'];
        var monthName = month_names_short[month];
        return monthName;
    };
    /** get short description for month */
    Dt.prototype.dayOfWeek = function (date, option) {
        if (!date)
            return '';
        var day_names_short = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Fridate', 'Saturday'];
        var day_names_long = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (option == "Short") {
            return day_names_short[date.getDay()];
        }
        else {
            return day_names_long[date.getDay()];
        }
    };
    /** convert a date to a clarion date */
    Dt.prototype.clarionTime = function (date) {
        if (!date)
            date = new Date();
        var mmtMidnight = moment(date).startOf('day');
        var seconds = moment(date).diff(mmtMidnight, 'seconds') * 100;
        return seconds;
    };
    /** convert a date to a clarion time */
    Dt.prototype.clarionTimeToDate = function (clarionDate) {
        if (!clarionDate)
            return new Date();
        return moment(new Date("December 28, 1800")).add(clarionDate / 100, 'seconds').toDate();
    };
    /** convert a date to a string (DD/MM/YYYY) */
    Dt.prototype.diffDays = function (fromDate, toDate) {
        var me = this;
        var date = moment(toDate);
        var returnValue = date.diff(fromDate, "days");
        return isNaN(returnValue) ? null : returnValue;
    };
    /** get the days different in words */
    Dt.prototype.diffDaysWords = function (date) {
        var me = this;
        if (!date)
            return '';
        var days = me.diffDays(date);
        switch (days) {
            case null:
                return '';
            case -1:
                return 'tomorrow';
            case 0:
                return exports.dt.timeToStr(date);
            case 1:
                return 'yesterday';
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                return exports.dt.dayOfWeek(date);
            default:
                return exports.dt.dateToStr(date, "D MMMM YYYY");
        }
    };
    return Dt;
}());
exports.Dt = Dt;
/** Extra functions used with views */
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
exports.ViewExt = ViewExt;
/** a value list array */
var ValueList = (function () {
    function ValueList(array) {
        if (array)
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
        return this.getText(index);
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
        for (var i = 0; i < this.items.length; i++) {
            if (this.getValue(i) == value)
                return i;
        }
        return defaultIndex == null ? -1 : defaultIndex;
    };
    return ValueList;
}());
exports.ValueList = ValueList;
/** a value list array */
var Dictionary = (function () {
    function Dictionary(array, valueMemberName, displayMemberName) {
        /** this array of value items */
        this._items = [];
        this.valueMemberName = "ValueMember";
        this.displayMemberName = "DisplayMember";
        this.addItems(array, valueMemberName, displayMemberName);
    }
    Object.defineProperty(Dictionary.prototype, "items", {
        /** get the list of value items */
        get: function () { return this._items; },
        /** set the list of value items */
        set: function (array) { this._items = array; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dictionary.prototype, "length", {
        /** the number of items */
        get: function () { return this.items.length; },
        enumerable: true,
        configurable: true
    });
    /** add a new item to the list */
    Dictionary.prototype.addItem = function (item) {
        this.items.push(item);
    };
    /** add a new item to the list */
    Dictionary.prototype.addItems = function (array, valueMemberName, displayMemberName) {
        var me = this;
        if (array)
            me.items = array;
        if (valueMemberName)
            this.valueMemberName = valueMemberName;
        if (displayMemberName)
            this.displayMemberName = displayMemberName;
    };
    /** add a new item to the beginning of the list */
    Dictionary.prototype.addItemFront = function (item) {
        var me = this;
        var addItem = {};
        addItem[me.valueMemberName] = item.ValueMember;
        addItem[me.displayMemberName] = item.DisplayMember;
        this.items.unshift(addItem);
    };
    /** get an item by its index */
    Dictionary.prototype.getItem = function (index) {
        return this.getText(index);
    };
    /** get the items display value by its index */
    Dictionary.prototype.getText = function (index) {
        var me = this;
        if (index < 0 || index >= me.items.length) {
            return "";
        }
        return me.items[index][me.displayMemberName];
    };
    /** get an array of the items display members  */
    Dictionary.prototype.getTextArray = function () {
        var me = this;
        return me.items.map(function (x) { return x[me.displayMemberName]; });
    };
    /** get the items valueMember by its index */
    Dictionary.prototype.getValue = function (index) {
        var me = this;
        if (!me.items || me.items.length == 0)
            return null;
        if (index == undefined || index < 0 || index >= me.items.length)
            return null;
        return me.items[index][me.valueMemberName];
    };
    /** get the items index by its valueMemeber, use default index if not found else return -1 */
    Dictionary.prototype.getIndex = function (value, defaultIndex) {
        var me = this;
        for (var i = 0; i < this.items.length; i++) {
            if (me.getValue(i) == value)
                return i;
        }
        return defaultIndex == null ? -1 : defaultIndex;
    };
    return Dictionary;
}());
exports.Dictionary = Dictionary;
/** File access functions */
var File = (function () {
    function File() {
        this.documentFolder = fileSystemModule.knownFolders.documents();
        this.tempFolder = fileSystemModule.knownFolders.temp();
        this.downloadFolder = platform_1.isAndroid ? android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() : '';
    }
    /** load json from a file */
    File.prototype.exists = function (filename) {
        var me = this;
        return me.documentFolder.contains(filename);
    };
    /** save json to a file */
    File.prototype.saveFile = function (filename, data) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var file = me.documentFolder.getFile(filename);
            file.writeSync(data, function (err) {
                reject(err);
                return;
            });
            resolve();
        });
    };
    /** load json from a file */
    File.prototype.loadJSONFile = function (filename) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var file = me.documentFolder.getFile(filename);
            file.readText().then(function (content) {
                var returnValue = null;
                if (content != "")
                    returnValue = JSON.parse(content);
                resolve(returnValue);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    /** save json to a file */
    File.prototype.saveJSONFile = function (filename, data) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var file = me.documentFolder.getFile(filename);
            file.writeText(JSON.stringify(data)).then(function (content) {
                resolve(content);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    //** empty the file */
    File.prototype.clearJSONFile = function (filename, data) {
        var file = this.documentFolder.getFile(filename);
        file.writeText(JSON.stringify({}));
    };
    //** create a full filename including the folder for the current app */
    File.prototype.getFullFilename = function (filename) {
        var me = this;
        return fileSystemModule.path.join(me.documentFolder.path, filename);
    };
    //** create a full filename including the temp folder for the current app */
    File.prototype.getFullTempFilename = function (filename) {
        var me = this;
        return fileSystemModule.path.join(me.tempFolder.path, filename);
    };
    // public deleteFile(party: string) {
    // 	var file = fileSystemModule.knownFolders.documents().getFile(party);
    // 	file.
    // }
    File.prototype.downloadUrl = function (url, filePath) {
        var me = this;
        return new Promise(function (resolve, reject) {
            http.getFile(url, filePath).then(function (r) {
                var data = r.readSync();
                exports.call.openFile(filePath);
            }).then(function () {
                resolve();
            }).catch(function (e) {
                var err = new Error("Error downloading '" + filePath + "'. " + e.message);
                console.log(err.message);
                alert(err.message);
                reject(err);
            });
        });
    };
    return File;
}());
exports.File = File;
/** call thirdparty apps */
var Call = (function () {
    function Call() {
    }
    /** compose an email */
    Call.prototype.composeEmail = function (message) {
        var me = this;
        var subject = (message.subject || "Support");
        if (!message.body) {
            message.body = (message.salutation || (message.dear ? "Dear " + message.dear : null) || "Dear Madam/Sir");
            if (message.regards)
                message.body += "<BR><BR><BR>Regards<BR>" + message.regards;
        }
        email.available().then(function (avail) {
            if (avail) {
                return email.compose({
                    to: [message.to],
                    subject: subject,
                    body: message.body,
                    appPickerTitle: 'Compose with..' // for Android, default: 'Open with..'
                });
            }
            else {
                throw new Error("Email not available");
            }
        }).then(function () {
            console.log("Email composer closed");
        }).catch(function (err) {
            alert(err.message);
        });
        ;
    };
    /** make a phone call */
    Call.prototype.phoneDial = function (PhoneNo) {
        var me = this;
        phone.dial(PhoneNo, true);
    };
    Call.prototype.openFile = function (filePath) {
        var me = this;
        var filename = filePath.toLowerCase();
        try {
            if (android) {
                if (filename.substr(0, 7) != "file://" || filename.substr(0, 10) != "content://")
                    filename = "file://" + filename;
                if (android.os.Build.VERSION.SDK_INT > android.os.Build.VERSION_CODES.M)
                    filename = filename.replace("file://", "content://");
                var uri = android.net.Uri.parse(filename.trim());
                var type = "application/" + ((exports.str.inList(filename.slice(-4), ['.pdf', '.doc', '.xml'])) ? filename.slice(-3) : "*");
                //Create intent
                var intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                intent.setDataAndType(uri, type);
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                application.android.currentContext.startActivity(intent);
            }
            else {
                utils_1.ios.openFile(filename);
            }
        }
        catch (e) {
            alert('Cannot open file ' + filename + '. ' + e.message);
        }
    };
    return Call;
}());
exports.Call = Call;
// /** Extending Nativescript Autocomplete */
// export class TokenItem extends autocompleteModule.TokenModel {
// 	value: number;
// 	constructor(text: string, value: number, image?: string) {
// 		super(text, image || null);
// 		this.value = value;
// 	}
// };
var Form = (function () {
    function Form() {
    }
    Form.prototype.showPage = function (me, pageName, context) {
        if (me)
            me.childPage = pageName;
        var data = {
            moduleName: pageName + '/' + pageName,
            context: context || {},
            animated: true,
            transition: { name: "slide", duration: 380, curve: "easeIn" },
            clearHistory: false,
            backstackVisible: true
        };
        frame_1.topmost().navigate(data);
    };
    Form.prototype.goBack = function () {
        frame_1.topmost().goBack();
    };
    ;
    Form.prototype.showModal = function (path, params, fullscreen) {
        var me = this;
        return new Promise(function (resolve, reject) {
            frame_1.topmost().currentPage.showModal(path, params, function (args) {
                resolve(args);
            }, fullscreen);
        });
    };
    return Form;
}());
exports.Form = Form;
exports.form = new Form();
exports.tagging = new Tagging();
exports.str = new Str();
exports.sql = new Sql();
exports.dt = new Dt();
exports.viewExt = new ViewExt();
exports.file = new File();
exports.call = new Call();
exports.utils = new Utils();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUEyQztBQUMzQywrQkFBaUM7QUFFakMsa0RBQW9EO0FBQ3BELDhDQUFnRDtBQUNoRCxrQ0FBbUM7QUFFbkMsMENBQTRDO0FBQzVDLDBDQUE0QztBQUM1QywyQkFBNkI7QUFDN0IsaUZBQWlGO0FBRWpGLDBEQUF3RDtBQUN4RCxxQ0FBNEM7QUFDNUMscUNBQWlDO0FBTWpDLHlCQUF5QjtBQUN6QjtJQUFBO0lBb0RBLENBQUM7SUFsREEseURBQXlEO0lBQ2xELHNDQUFzQixHQUE3QixVQUFpQyxPQUFzQixFQUFFLElBQVM7UUFDakUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJELEdBQUcsQ0FBQyxDQUFDLElBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztnQkFDRixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBWSxJQUFJLHVEQUFvRCxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsa0NBQWtDO0lBQzNCLDBCQUFVLEdBQWpCLFVBQXFCLE9BQXNCLEVBQUUsSUFBUztRQUNyRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzdCLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFckQsR0FBRyxDQUFDLENBQUMsSUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFPLElBQUksTUFBRyxDQUFDLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN4QixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztnQkFDRixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBWSxJQUFJLHVEQUFvRCxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFHRixZQUFDO0FBQUQsQ0FBQyxBQXBERCxJQW9EQztBQXBEWSxzQkFBSztBQXNEbEIsd0JBQXdCO0FBQ3hCO0lBQUE7UUFFQyx1QkFBdUI7UUFDaEIsWUFBTyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MseUJBQXlCO1FBQ2xCLGNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBcUdoRCxDQUFDO0lBbkdBOztNQUVFO0lBQ0ssd0JBQU0sR0FBYixVQUFjLElBQWE7UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDVCw0REFBNEQ7SUFDN0QsQ0FBQztJQUVELDJFQUEyRTtJQUNwRSx3QkFBTSxHQUFiLFVBQWMsS0FBWTtRQUN6QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxlQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkQsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7SUFDRCw2RUFBNkU7SUFDdEUsMEJBQVEsR0FBZixVQUFnQixLQUFZO1FBQzNCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuRCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUNELCtCQUErQjtJQUN4QiwrQkFBYSxHQUFwQixVQUFxQixJQUFZO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO0lBQ0YsQ0FBQztJQUVELDRCQUE0QjtJQUNyQiwyQkFBUyxHQUFoQixVQUFpQixHQUFRO1FBQ3hCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsR0FBRyxHQUFHLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqQyxJQUFJLElBQUksR0FBRyxlQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuRCxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVELG1DQUFtQztJQUM1QiwyQkFBUyxHQUFoQixVQUFpQixHQUFRO1FBQ3hCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN0QixFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVELHVDQUF1QztJQUNoQyxrQ0FBZ0IsR0FBdkIsVUFBd0IsWUFBeUM7UUFDaEUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsNENBQTRDO0lBQ3JDLHFDQUFtQixHQUExQixVQUEyQixLQUEyQixFQUFFLEtBQWE7UUFDcEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCx1Q0FBdUM7SUFDaEMsdUJBQUssR0FBWixVQUFhLEtBQVk7UUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCw4Q0FBOEM7SUFDdkMsNkJBQVcsR0FBbEIsVUFBbUIsS0FBWTtRQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pDLENBQUM7SUFDRCxnREFBZ0Q7SUFDekMsK0JBQWEsR0FBcEIsVUFBcUIsS0FBWTtRQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pDLENBQUM7SUFDRCw0Q0FBNEM7SUFDckMsK0JBQWEsR0FBcEIsVUFBcUIsS0FBWTtRQUNoQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ25CLENBQUM7SUFDRCw4Q0FBOEM7SUFDdkMsaUNBQWUsR0FBdEIsVUFBdUIsS0FBWTtRQUNsQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDbkIsQ0FBQztJQUdGLGNBQUM7QUFBRCxDQUFDLEFBMUdELElBMEdDO0FBMUdZLDBCQUFPO0FBNEdwQixvQkFBb0I7QUFDcEI7SUFBQTtJQU1BLENBQUM7SUFMQSxPQUFPO0lBQ1AsdUZBQXVGO0lBQ2hGLGtCQUFJLEdBQVgsVUFBWSxLQUFLO1FBQ2hCLE1BQU0sQ0FBQyxzQ0FBb0MsS0FBSyxpQkFBYyxDQUFDO0lBQ2hFLENBQUM7SUFDRixVQUFDO0FBQUQsQ0FBQyxBQU5ELElBTUM7QUFOWSxrQkFBRztBQVFoQix1QkFBdUI7QUFDdkI7SUFBQTtJQWdLQSxDQUFDO0lBOUpPLHdCQUFVLEdBQWpCLFVBQWtCLEtBQWE7UUFDOUIsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hJLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFFcEIsQ0FBQztJQUVELGtDQUFrQztJQUMzQixxQ0FBdUIsR0FBOUIsVUFBK0IsR0FBVztRQUN6QyxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7WUFDN0QsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxtSEFBbUg7SUFDNUcseUJBQVcsR0FBbEIsVUFBbUIsSUFBVyxFQUFFLFdBQW1CLEVBQUUsVUFBa0I7UUFDdEUsVUFBVSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNyQyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUN6QyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLGtDQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELHNIQUFzSDtJQUMvRyxnQ0FBa0IsR0FBekIsVUFBMEIsSUFBVyxFQUFFLFdBQXFCLEVBQUUsVUFBa0I7UUFDL0UsVUFBVSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtRQUNyQyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUV6QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDN0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDM0csQ0FBQztZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFFZCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLGtDQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELCtDQUErQztJQUN4QyxvQkFBTSxHQUFiLFVBQWMsS0FBYSxFQUFFLFNBQW1CO1FBQy9DLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMvQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELHdFQUF3RTtJQUNqRSx5QkFBVyxHQUFsQixVQUFtQixHQUFXLEVBQUUsVUFBb0I7UUFDbkQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0MsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3BELENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELHFDQUFxQztJQUM5QiwwQkFBWSxHQUFuQixVQUFvQixLQUFZLEVBQUUsV0FBbUIsRUFBRSxXQUFnQjtRQUN0RSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN4QyxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQztnQkFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsd0dBQXdHO0lBQ2pHLDJCQUFhLEdBQXBCLFVBQXFCLEtBQVksRUFBRSxXQUFtQixFQUFFLFdBQWdCO1FBQ3ZFLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRztZQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRCwyR0FBMkc7SUFDcEcsa0NBQW9CLEdBQTNCLFVBQTRCLElBQVcsRUFBRSxXQUFxQixFQUFFLFVBQWtCO1FBQ2pGLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUM3QixVQUFVLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3JDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBRXpDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMzRyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUVkLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNyQixDQUFDO0lBRUQsaUhBQWlIO0lBQzFHLDBCQUFZLEdBQW5CLFVBQW9CLEtBQVksRUFBRSxXQUFtQixFQUFFLFdBQWdCO1FBQ3RFLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELCtDQUErQztJQUN4Qyw2QkFBZSxHQUF0QixVQUEwQixLQUFrQjtRQUMzQyxJQUFJLFdBQVcsR0FBRyxJQUFJLGtDQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3BCLENBQUM7SUFFRCwrQ0FBK0M7SUFDeEMsd0JBQVUsR0FBakIsVUFBa0IsR0FBRztRQUNwQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCw4RkFBOEY7SUFDdkYsNkJBQWUsR0FBdEIsVUFBdUIsRUFBK0IsRUFBRSxHQUFXLEVBQUUsTUFBZTtRQUNuRixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUc7WUFDckMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELGdDQUFnQztJQUN6QiwyQkFBYSxHQUFwQixVQUFxQixHQUFHO1FBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQseUNBQXlDO0lBQ2xDLG9DQUFzQixHQUE3QixVQUE4QixLQUFpQixFQUFFLFVBQWtCO1FBQ2xFLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsbUVBQW1FO0lBQzVELDBCQUFZLEdBQW5CLFVBQW9CLEtBQTJCLEVBQUUsU0FBYztRQUM5RCxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFRCxrRUFBa0U7SUFDM0QseUJBQVcsR0FBbEIsVUFBbUIsS0FBMkIsRUFBRSxTQUFjO1FBQzdELDJFQUEyRTtRQUMzRSw0REFBNEQ7UUFDNUQsbUNBQW1DO1FBQ25DLEtBQUs7UUFDTCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUN2RCxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUc7Z0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDO0lBQ0YsQ0FBQztJQUVNLHlCQUFXLEdBQWxCLFVBQW1CLE9BQU87UUFDekIsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUSxDQUFDO2dCQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBQUEsQ0FBQztRQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQUVELDhEQUE4RDtJQUN2RCxxQkFBTyxHQUFkLFVBQWlDLENBQVc7UUFDM0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxHQUFHLEVBQUUsR0FBRztZQUN4QixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNaLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUlGLFVBQUM7QUFBRCxDQUFDLEFBaEtELElBZ0tDO0FBaEtZLGtCQUFHO0FBa0toQixxQkFBcUI7QUFDckI7SUFBQTtJQTZPQSxDQUFDO0lBM09PLG1CQUFNLEdBQWIsVUFBYyxJQUFXO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNYLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDRixDQUFDO0lBRUQsdUZBQXVGO0lBQ3ZGLDJCQUEyQjtJQUNwQix5QkFBWSxHQUFuQixVQUFvQixHQUFXLEVBQUUsSUFBVztRQUMzQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBQ0Qsb0JBQW9CO0lBQ2IsMEJBQWEsR0FBcEIsVUFBcUIsSUFBVyxFQUFFLFFBQWlCO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDMUUsQ0FBQztJQUVELGtCQUFrQjtJQUNYLHdCQUFXLEdBQWxCLFVBQW1CLElBQVcsRUFBRSxRQUFpQjtRQUNoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3hFLENBQUM7SUFFRCx1RkFBdUY7SUFDdkYsNEJBQTRCO0lBQ3JCLDBCQUFhLEdBQXBCLFVBQXFCLEdBQVcsRUFBRSxJQUFXO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFDRCxxQkFBcUI7SUFDZCwyQkFBYyxHQUFyQixVQUFzQixJQUFXLEVBQUUsU0FBa0I7UUFDcEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3RSxDQUFDO0lBRUQsbUJBQW1CO0lBQ1oseUJBQVksR0FBbkIsVUFBb0IsSUFBVyxFQUFFLFNBQWtCO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0UsQ0FBQztJQUVELHVGQUF1RjtJQUN2RiwwQkFBMEI7SUFDbkIsd0JBQVcsR0FBbEIsVUFBbUIsR0FBVyxFQUFFLElBQVc7UUFDMUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELHVGQUF1RjtJQUN2RixvQkFBb0I7SUFDYiwwQkFBYSxHQUFwQixVQUFxQixJQUFXLEVBQUUsUUFBaUI7UUFDbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3RSxDQUFDO0lBQ0Qsa0JBQWtCO0lBQ1gsd0JBQVcsR0FBbEIsVUFBbUIsSUFBVyxFQUFFLFFBQWlCO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0UsQ0FBQztJQUVELHdGQUF3RjtJQUN4RiwyQkFBMkI7SUFDcEIseUJBQVksR0FBbkIsVUFBb0IsSUFBWSxFQUFFLElBQVc7UUFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDakQsQ0FBQztJQUVELDBGQUEwRjtJQUMxRiw4QkFBOEI7SUFDdkIsMkJBQWMsR0FBckIsVUFBc0IsT0FBZSxFQUFFLElBQVc7UUFDakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUVELG1HQUFtRztJQUNuRyw4Q0FBOEM7SUFDdkMseUJBQVksR0FBbkIsVUFBb0IsSUFBVztRQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUM7SUFDRixDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLHNCQUFTLEdBQWhCLFVBQWlCLElBQVcsRUFBRSxNQUFrRTtRQUMvRixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEtBQUssYUFBYTtnQkFDakIsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkYsS0FBSyxZQUFZO2dCQUNoQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4RixLQUFLLFlBQVk7Z0JBQ2hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BDO2dCQUNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDRixDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLHNCQUFTLEdBQWhCLFVBQWlCLElBQVc7UUFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOztNQUVFO0lBQ0ssc0JBQVMsR0FBaEIsVUFBaUIsSUFBWSxFQUFFLE1BQWU7UUFDN0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RELENBQUM7SUFDRixDQUFDO0lBQ0Qsd0NBQXdDO0lBQ2pDLHdCQUFXLEdBQWxCLFVBQW1CLElBQVk7UUFDOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDRixDQUFDO0lBQ0QsdUNBQXVDO0lBQ2hDLHdCQUFXLEdBQWxCLFVBQW1CLElBQVc7UUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxxQ0FBcUM7UUFDdkUsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEYsTUFBTSxDQUFDLFFBQVEsQ0FBQTtJQUNoQixDQUFDO0lBQ0QsdUNBQXVDO0lBQ2hDLDhCQUFpQixHQUF4QixVQUF5QixXQUFvQjtRQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELHVDQUF1QztJQUNoQyx1QkFBVSxHQUFqQixVQUFrQixXQUFvQjtRQUNyQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCx1Q0FBdUM7SUFDaEMsc0JBQVMsR0FBaEIsVUFBaUIsV0FBb0I7UUFDcEMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVELHNDQUFzQztJQUMvQiwyQkFBYyxHQUFyQixVQUFzQixLQUFhO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUN0QixJQUFJLGlCQUFpQixHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakgsSUFBSSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQsc0NBQXNDO0lBQy9CLHNCQUFTLEdBQWhCLFVBQWlCLEtBQWE7UUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3RCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2SixJQUFJLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQ0FBc0M7SUFDL0Isc0JBQVMsR0FBaEIsVUFBaUIsSUFBVSxFQUFFLE1BQXlCO1FBQ3JELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLGVBQWUsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksY0FBYyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkUsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQ3JDLENBQUM7SUFDRixDQUFDO0lBRUQsdUNBQXVDO0lBQ2hDLHdCQUFXLEdBQWxCLFVBQW1CLElBQVc7UUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM5RCxNQUFNLENBQUMsT0FBTyxDQUFBO0lBQ2YsQ0FBQztJQUNELHVDQUF1QztJQUNoQyw4QkFBaUIsR0FBeEIsVUFBeUIsV0FBb0I7UUFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6RixDQUFDO0lBSUQsOENBQThDO0lBQ3ZDLHFCQUFRLEdBQWYsVUFBZ0IsUUFBYyxFQUFFLE1BQWE7UUFDNUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQztJQUNoRCxDQUFDO0lBR0Qsc0NBQXNDO0lBQy9CLDBCQUFhLEdBQXBCLFVBQXFCLElBQVU7UUFDOUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNkLEtBQUssSUFBSTtnQkFDUixNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ1gsS0FBSyxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUNuQixLQUFLLENBQUM7Z0JBQ0wsTUFBTSxDQUFDLFVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsS0FBSyxDQUFDO2dCQUNMLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDcEIsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUMsQ0FBQztZQUNQLEtBQUssQ0FBQyxDQUFDO1lBQ1AsS0FBSyxDQUFDLENBQUM7WUFDUCxLQUFLLENBQUM7Z0JBQ0wsTUFBTSxDQUFDLFVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0I7Z0JBQ0MsTUFBTSxDQUFDLFVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQzFDLENBQUM7SUFFRixDQUFDO0lBR0YsU0FBQztBQUFELENBQUMsQUE3T0QsSUE2T0M7QUE3T1ksZ0JBQUU7QUErT2Ysc0NBQXNDO0FBQ3RDO0lBQUE7SUF3QkEsQ0FBQztJQXRCQSwwQ0FBMEM7SUFDbkMsaUNBQWUsR0FBdEIsVUFBdUIsSUFBbUI7UUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELDBDQUEwQztJQUNuQyw0QkFBVSxHQUFqQixVQUFrQixJQUFtQjtRQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNsQixFQUFFLENBQUMsQ0FBQyxvQkFBUyxDQUFDO1lBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzVELENBQUM7SUFFRCxnREFBZ0Q7SUFDekMsa0NBQWdCLEdBQXZCLFVBQXdCLElBQW1CO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2xCLElBQUksQ0FBQztZQUNFLElBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWpCLENBQUM7SUFDRixDQUFDO0lBQ0YsY0FBQztBQUFELENBQUMsQUF4QkQsSUF3QkM7QUF4QlksMEJBQU87QUErQnBCLHlCQUF5QjtBQUN6QjtJQVFDLG1CQUFZLEtBQXlCO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQy9CLENBQUM7SUFKRCxzQkFBSSw2QkFBTTtRQURWLDBCQUEwQjthQUMxQixjQUF1QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQU1sRCxpQ0FBaUM7SUFDMUIsMkJBQU8sR0FBZCxVQUFlLElBQWdCO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxrREFBa0Q7SUFDM0MsZ0NBQVksR0FBbkIsVUFBb0IsSUFBZ0I7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELGtDQUFrQztJQUMzQiw0QkFBUSxHQUFmO1FBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDbkIsQ0FBQztJQUVELCtCQUErQjtJQUN4QiwyQkFBTyxHQUFkLFVBQWUsS0FBYTtRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsK0NBQStDO0lBQ3hDLDJCQUFPLEdBQWQsVUFBZSxLQUFhO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsNENBQTRDO0lBQ3JDLGdDQUFZLEdBQW5CO1FBQ0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBYSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELHVDQUF1QztJQUNoQyw0QkFBUSxHQUFmLFVBQWdCLEtBQWE7UUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxzRkFBc0Y7SUFFL0UsNEJBQVEsR0FBZixVQUFnQixLQUFVLEVBQUUsWUFBcUI7UUFDaEQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztJQUNqRCxDQUFDO0lBQ0YsZ0JBQUM7QUFBRCxDQUFDLEFBN0RELElBNkRDO0FBN0RZLDhCQUFTO0FBK0R0Qix5QkFBeUI7QUFDekI7SUFlQyxvQkFBWSxLQUFrQixFQUFFLGVBQXdCLEVBQUUsaUJBQTBCO1FBYnBGLGdDQUFnQztRQUN4QixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBTWIsb0JBQWUsR0FBRyxhQUFhLENBQUM7UUFDaEMsc0JBQWlCLEdBQUcsZUFBZSxDQUFDO1FBTTFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFaRCxzQkFBVyw2QkFBSztRQURoQixrQ0FBa0M7YUFDbEMsY0FBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUEsQ0FBQyxDQUFDO1FBQ3pDLGtDQUFrQzthQUNsQyxVQUFpQixLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBQyxDQUFDOzs7T0FGTjtJQVF6QyxzQkFBVyw4QkFBTTtRQURqQiwwQkFBMEI7YUFDMUIsY0FBOEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFNekQsaUNBQWlDO0lBQzFCLDRCQUFPLEdBQWQsVUFBZSxJQUFnQjtRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsaUNBQWlDO0lBQzFCLDZCQUFRLEdBQWYsVUFBZ0IsS0FBaUIsRUFBRSxlQUF1QixFQUFFLGlCQUF5QjtRQUNwRixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUM7WUFBQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUM1RCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztZQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUNuRSxDQUFDO0lBRUQsa0RBQWtEO0lBQzNDLGlDQUFZLEdBQW5CLFVBQW9CLElBQWdCO1FBQ25DLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDL0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUdELCtCQUErQjtJQUN4Qiw0QkFBTyxHQUFkLFVBQWUsS0FBYTtRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsK0NBQStDO0lBQ3hDLDRCQUFPLEdBQWQsVUFBZSxLQUFhO1FBQzNCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNELE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxpREFBaUQ7SUFDMUMsaUNBQVksR0FBbkI7UUFDQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFhLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRCw2Q0FBNkM7SUFDdEMsNkJBQVEsR0FBZixVQUFnQixLQUFhO1FBQzVCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ25ELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxTQUFTLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsNkZBQTZGO0lBQ3RGLDZCQUFRLEdBQWYsVUFBZ0IsS0FBVSxFQUFFLFlBQXFCO1FBQ2hELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM1QyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQztnQkFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxNQUFNLENBQUMsWUFBWSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDakQsQ0FBQztJQUNGLGlCQUFDO0FBQUQsQ0FBQyxBQTlFRCxJQThFQztBQTlFWSxnQ0FBVTtBQWdGdkIsNEJBQTRCO0FBQzVCO0lBQUE7UUFFUSxtQkFBYyxHQUFHLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUUzRCxlQUFVLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWxELG1CQUFjLEdBQUcsb0JBQVMsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQTJGakssQ0FBQztJQXhGQSw0QkFBNEI7SUFDckIscUJBQU0sR0FBYixVQUFjLFFBQWdCO1FBQzdCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsMEJBQTBCO0lBQ25CLHVCQUFRLEdBQWYsVUFBZ0IsUUFBZ0IsRUFBRSxJQUFJO1FBQ3JDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1lBQzNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsR0FBRztnQkFDakMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNaLE1BQU0sQ0FBQztZQUNSLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCw0QkFBNEI7SUFDckIsMkJBQVksR0FBbkIsVUFBb0IsUUFBZ0I7UUFDbkMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07WUFDM0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLE9BQU87Z0JBQ3JDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDdkIsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztvQkFBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUc7Z0JBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsMEJBQTBCO0lBQ25CLDJCQUFZLEdBQW5CLFVBQW9CLFFBQWdCLEVBQUUsSUFBSTtRQUN6QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUMzQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxPQUFPO2dCQUMxRCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRztnQkFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxzQkFBc0I7SUFDZiw0QkFBYSxHQUFwQixVQUFxQixRQUFnQixFQUFFLElBQUk7UUFDMUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELHVFQUF1RTtJQUNoRSw4QkFBZSxHQUF0QixVQUF1QixRQUFnQjtRQUN0QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0QsNEVBQTRFO0lBQ3JFLGtDQUFtQixHQUExQixVQUEyQixRQUFnQjtRQUMxQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0QscUNBQXFDO0lBQ3JDLHdFQUF3RTtJQUN4RSxTQUFTO0lBQ1QsSUFBSTtJQUdHLDBCQUFXLEdBQWxCLFVBQW1CLEdBQUcsRUFBRSxRQUFRO1FBQy9CLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1lBRTNDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQzNDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDeEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ1AsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2dCQUNuQixJQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0YsV0FBQztBQUFELENBQUMsQUFqR0QsSUFpR0M7QUFqR1ksb0JBQUk7QUE0R2pCLDJCQUEyQjtBQUMzQjtJQUFBO0lBNERBLENBQUM7SUExREEsdUJBQXVCO0lBQ2hCLDJCQUFZLEdBQW5CLFVBQW9CLE9BQXNCO1FBQ3pDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLElBQUksT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQztRQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQUMsT0FBTyxDQUFDLElBQUksSUFBSSx5QkFBeUIsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSztZQUNyQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO29CQUNwQixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNoQixPQUFPLEVBQUUsT0FBTztvQkFDaEIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO29CQUNsQixjQUFjLEVBQUUsZ0JBQWdCLENBQUMsc0NBQXNDO2lCQUN2RSxDQUFDLENBQUE7WUFDSCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRztZQUNyQixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQUEsQ0FBQztJQUNMLENBQUM7SUFFRCx3QkFBd0I7SUFDakIsd0JBQVMsR0FBaEIsVUFBaUIsT0FBZTtRQUMvQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRU0sdUJBQVEsR0FBZixVQUFnQixRQUFnQjtRQUMvQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDYixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksWUFBWSxDQUFDO29CQUFDLFFBQVEsR0FBRyxTQUFTLEdBQUcsUUFBUSxDQUFDO2dCQUNsSCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUU5SCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2pELElBQUksSUFBSSxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUU1SCxlQUFlO2dCQUNmLElBQUksTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzVFLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQy9ELFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUM7Z0JBQ0wsV0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QixDQUFDO1FBQ0YsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWixLQUFLLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUQsQ0FBQztJQUNGLENBQUM7SUFFRixXQUFDO0FBQUQsQ0FBQyxBQTVERCxJQTREQztBQTVEWSxvQkFBSTtBQThEakIsNkNBQTZDO0FBQzdDLGlFQUFpRTtBQUNqRSxrQkFBa0I7QUFDbEIsOERBQThEO0FBQzlELGdDQUFnQztBQUNoQyx3QkFBd0I7QUFDeEIsS0FBSztBQUVMLEtBQUs7QUFHTDtJQUFBO0lBOEJBLENBQUM7SUE1Qk8sdUJBQVEsR0FBZixVQUFnQixFQUFFLEVBQUUsUUFBZ0IsRUFBRSxPQUFhO1FBRWxELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ2hDLElBQUksSUFBSSxHQUFHO1lBQ1YsVUFBVSxFQUFFLFFBQVEsR0FBRyxHQUFHLEdBQUcsUUFBUTtZQUNyQyxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUU7WUFDdEIsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtZQUM3RCxZQUFZLEVBQUUsS0FBSztZQUNuQixnQkFBZ0IsRUFBRSxJQUFJO1NBQ3RCLENBQUM7UUFDRixlQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVNLHFCQUFNLEdBQWI7UUFDQyxlQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBQUEsQ0FBQztJQUVLLHdCQUFTLEdBQWhCLFVBQWlCLElBQVksRUFBRSxNQUFPLEVBQUUsVUFBb0I7UUFDM0QsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07WUFDM0MsZUFBTyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsSUFBSTtnQkFDM0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0YsV0FBQztBQUFELENBQUMsQUE5QkQsSUE4QkM7QUE5Qlksb0JBQUk7QUFnQ04sUUFBQSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixRQUFBLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFFBQUEsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFBLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2QsUUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QixRQUFBLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2xCLFFBQUEsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsUUFBQSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gXCJhcHBsaWNhdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSBcIm1vbWVudFwiO1xyXG5pbXBvcnQgKiBhcyB2aWV3IGZyb20gXCJ1aS9jb3JlL3ZpZXdcIjtcclxuaW1wb3J0ICogYXMgb2JzZXJ2YWJsZU1vZHVsZSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlXCI7XHJcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW1Nb2R1bGUgZnJvbSBcImZpbGUtc3lzdGVtXCI7XHJcbmltcG9ydCB7IHRvcG1vc3QgfSBmcm9tICd1aS9mcmFtZSc7XHJcblxyXG5pbXBvcnQgKiBhcyBwaG9uZSBmcm9tIFwibmF0aXZlc2NyaXB0LXBob25lXCI7XHJcbmltcG9ydCAqIGFzIGVtYWlsIGZyb20gXCJuYXRpdmVzY3JpcHQtZW1haWxcIjtcclxuaW1wb3J0ICogYXMgaHR0cCBmcm9tIFwiaHR0cFwiO1xyXG4vL2ltcG9ydCAqIGFzIGF1dG9jb21wbGV0ZU1vZHVsZSBmcm9tICduYXRpdmVzY3JpcHQtdGVsZXJpay11aS1wcm8vYXV0b2NvbXBsZXRlJztcclxuXHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gXCJkYXRhL29ic2VydmFibGUtYXJyYXlcIjtcclxuaW1wb3J0IHsgaXNBbmRyb2lkLCBpc0lPUyB9IGZyb20gXCJwbGF0Zm9ybVwiO1xyXG5pbXBvcnQgeyBpb3MgfSBmcm9tIFwidXRpbHMvdXRpbHNcIlxyXG5cclxuZGVjbGFyZSB2YXIgYW5kcm9pZDogYW55O1xyXG5kZWNsYXJlIHZhciBqYXZhOiBhbnk7XHJcblxyXG5cclxuLy9NaXNjZWxsYW5pb3VzIEZ1bmN0aW9uc1xyXG5leHBvcnQgY2xhc3MgVXRpbHMge1xyXG5cclxuXHQvL0NyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvYmplY3QgZnJvbSBhbiBleGlzdGluZyBvbmVcclxuXHRwdWJsaWMgY3JlYXRlSW5zdGFuY2VGcm9tSnNvbjxUPihvYmpUeXBlOiB7IG5ldygpOiBUOyB9LCBqc29uOiBhbnkpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRjb25zdCBuZXdPYmogPSBuZXcgb2JqVHlwZSgpO1xyXG5cdFx0Y29uc3QgcmVsYXRpb25zaGlwcyA9IG9ialR5cGVbXCJyZWxhdGlvbnNoaXBzXCJdIHx8IHt9O1xyXG5cclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBqc29uKSB7XHJcblx0XHRcdGlmIChqc29uLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcblx0XHRcdFx0aWYgKG5ld09ialtwcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRpZiAocmVsYXRpb25zaGlwc1twcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdG5ld09ialtwcm9wXSA9IGpzb25bcHJvcF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0bmV3T2JqW3Byb3BdID0gbWUuY3JlYXRlSW5zdGFuY2VGcm9tSnNvbihyZWxhdGlvbnNoaXBzW3Byb3BdLCBqc29uW3Byb3BdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFByb3BlcnR5ICR7cHJvcH0gbm90IHNldCBiZWNhdXNlIGl0IGFscmVhZHkgZXhpc3RlZCBvbiB0aGUgb2JqZWN0LmApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXdPYmo7XHJcblx0fVxyXG5cclxuXHQvL2FkZHMgbWlzc2luZyBmdW5jdGlvbnMgdG8gb2JqZWN0XHJcblx0cHVibGljIGluaXRPYmplY3Q8VD4ob2JqVHlwZTogeyBuZXcoKTogVDsgfSwganNvbjogYW55KSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Y29uc3QgbmV3T2JqID0gbmV3IG9ialR5cGUoKTtcclxuXHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBvYmpUeXBlW1wicmVsYXRpb25zaGlwc1wiXSB8fCB7fTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4gbmV3T2JqKSB7XHJcblx0XHRcdGlmIChuZXdPYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuXHRcdFx0XHRjb25zb2xlLndhcm4oYEFkZCAke3Byb3B9LmApO1xyXG5cdFx0XHRcdGlmIChqc29uW3Byb3BdID09IG51bGwpIHtcclxuXHRcdFx0XHRcdGlmIChyZWxhdGlvbnNoaXBzW3Byb3BdID09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0anNvbltwcm9wXSA9IG5ld09ialtwcm9wXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRqc29uW3Byb3BdID0gbWUuY3JlYXRlSW5zdGFuY2VGcm9tSnNvbihyZWxhdGlvbnNoaXBzW3Byb3BdLCBuZXdPYmpbcHJvcF0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgUHJvcGVydHkgJHtwcm9wfSBub3Qgc2V0IGJlY2F1c2UgaXQgYWxyZWFkeSBleGlzdGVkIG9uIHRoZSBvYmplY3QuYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBUYWdnaW5nIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgVGFnZ2luZyB7XHJcblxyXG5cdC8qKiBkZWZhdWx0IHRhZyBpY29uICovXHJcblx0cHVibGljIHRhZ0ljb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA0Nik7XHJcblx0LyoqIGRlZmF1bHQgdW50YWcgaWNvbiAqL1xyXG5cdHB1YmxpYyB1blRhZ0ljb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA5Nik7XHJcblxyXG5cdC8qKiBDcmVhdGUgYSBuZXcgb2JzZXJ2YWJsZSB0YWcgb2JqZWN0XHJcblx0KiBJZiBpY29uIGlzIGxlZnQgYmxhbmsgdGhlIGRlZmF1bHQgaWNvbiBpcyB1c2VkIFxyXG5cdCovXHJcblx0cHVibGljIG5ld1RhZyhpY29uPzogc3RyaW5nKTogb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlIHtcclxuXHRcdGlmICghaWNvbikgaWNvbiA9IHRoaXMudW5UYWdJY29uO1xyXG5cdFx0dmFyIGEgPSBuZXcgb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlKCk7XHJcblx0XHRhLnNldChcInZhbHVlXCIsIGljb24pO1xyXG5cdFx0cmV0dXJuIGE7XHJcblx0XHQvL1x0XHRyZXR1cm4gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSh7IHZhbHVlOiBpY29uIH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHNldCBhbGwgYXJyYXkgb2JqZWN0cyB0YWcgcHJvcGVydHkgdG8gdGhlIGRlZmF1bHQgdGFnZ2VkIGljb24gb2JqZWN0ICovXHJcblx0cHVibGljIHRhZ0FsbChhcnJheTogYW55W10pOiBhbnlbXSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICghYXJyYXlbaV0udGFnKSBhcnJheVtpXS50YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0XHRhcnJheVtpXS50YWcuc2V0KFwidmFsdWVcIiwgdGFnZ2luZy50YWdJY29uKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBhcnJheTtcclxuXHR9XHJcblx0LyoqIHNldCBhbGwgYXJyYXkgb2JqZWN0cyB0YWcgcHJvcGVydHkgdG8gdGhlIGRlZmF1bHQgdW50YWdnZWQgaWNvbiBvYmplY3QgKi9cclxuXHRwdWJsaWMgdW5UYWdBbGwoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKCFhcnJheVtpXS50YWcpIGFycmF5W2ldLnRhZyA9IHRhZ2dpbmcubmV3VGFnKCk7XHJcblx0XHRcdGFycmF5W2ldLnRhZy5zZXQoXCJ2YWx1ZVwiLCB0YWdnaW5nLnVuVGFnSWNvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cdC8qKiBnZXQgdGhlIHRvZ2dsZWQgdGFnIGljb24gKi9cclxuXHRwdWJsaWMgdG9nZ2xlVGFnSWNvbihpY29uOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0aWYgKGljb24gPT0gdGhpcy50YWdJY29uKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnVuVGFnSWNvbjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnRhZ0ljb247XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRhZyBvYnNlcnZhYmxlICovXHJcblx0cHVibGljIHRvZ2dsZVRhZyh0YWc6IGFueSk6IGFueSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCF0YWcpIHRhZyA9IHRhZ2dpbmcubmV3VGFnKCk7XHJcblx0XHR2YXIgaWNvbiA9IHRhZ2dpbmcudG9nZ2xlVGFnSWNvbih0YWcuZ2V0KFwidmFsdWVcIikpO1xyXG5cdFx0dGFnLnNldChcInZhbHVlXCIsIGljb24pO1xyXG5cdFx0cmV0dXJuIHRhZztcclxuXHR9XHJcblxyXG5cdC8qKiBUb2dnbGUgdGhlIHJvd3MgdGFnIHByb3BlcnR5ICovXHJcblx0cHVibGljIHRvZ2dsZVJvdyhyb3c6IGFueSk6IGFueSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFyb3cpIHJldHVybiBudWxsO1xyXG5cdFx0bWUudG9nZ2xlVGFnKHJvdy50YWcpO1xyXG5cdFx0cmV0dXJuIHJvdztcclxuXHR9XHJcblxyXG5cdC8qKiBUb2dnbGUgdGhlIG9ic2VydmFibGUgdGFnIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0b2dnbGVPYnNlcnZhYmxlKG9iZXJ2YWJsZVRhZzogb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlKTogb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlIHtcclxuXHRcdHJldHVybiB0aGlzLm5ld1RhZyh0aGlzLnRvZ2dsZVRhZ0ljb24ob2JlcnZhYmxlVGFnLmdldChcInZhbHVlXCIpKSk7XHJcblx0fVxyXG5cdC8qKiBUb2dnbGUgdGhlIG9ic2VydmFibGUgcm93cyB0YWcgb2JqZWN0ICovXHJcblx0cHVibGljIHRvZ2dsZU9ic2VydmFibGVSb3coYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCBpbmRleDogbnVtYmVyKTogT2JzZXJ2YWJsZUFycmF5PGFueT4ge1xyXG5cdFx0dmFyIHJvdyA9IHRoaXMudG9nZ2xlUm93KGFycmF5LmdldEl0ZW0oaW5kZXgpKTtcclxuXHRcdGFycmF5LnNldEl0ZW0oaW5kZXgsIHJvdyk7XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IG51bWJlciBvZiBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnQoYXJyYXk6IGFueVtdKTogbnVtYmVyIHtcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiAwO1xyXG5cdFx0cmV0dXJuIGFycmF5Lmxlbmd0aDtcclxuXHR9XHJcblx0LyoqIGdldCBudW1iZXIgb2YgdGFnZ2VkIGl0ZW1zIGluIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBjb3VudFRhZ2dlZChhcnJheTogYW55W10pOiBudW1iZXIge1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIDA7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUYWdnZWRSb3dzKGFycmF5KS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiBnZXQgbnVtYmVyIG9mIHVudGFnZ2VkIGl0ZW1zIGluIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBjb3VudFVudGFnZ2VkKGFycmF5OiBhbnlbXSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gMDtcclxuXHRcdHJldHVybiB0aGlzLmdldFRhZ2dlZFJvd3MoYXJyYXkpLmxlbmd0aDtcclxuXHR9XHJcblx0LyoqIHJldHVybiB0aGUgdGFnZ2VkIHJvd3MgZnJvbSB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgZ2V0VGFnZ2VkUm93cyhhcnJheTogYW55W10pOiBhbnlbXSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIG51bGw7XHJcblx0XHR2YXIgdGFnZ2VkUm93cyA9IGFycmF5LmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cdFx0XHRyZXR1cm4gKHgudGFnICYmIHgudGFnLmdldChcInZhbHVlXCIpID09IG1lLnRhZ0ljb24pO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdGFnZ2VkUm93cztcclxuXHR9XHJcblx0LyoqIHJldHVybiB0aGUgdW50YWdnZWQgcm93cyBmcm9tIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBnZXRVblRhZ2dlZFJvd3MoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciB0YWdnZWRSb3dzID0gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblx0XHRcdHJldHVybiAoeC50YWcgJiYgeC50YWcuZ2V0KFwidmFsdWVcIikgPT0gbWUudW5UYWdJY29uKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRhZ2dlZFJvd3M7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBTcWwgRnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBTcWwge1xyXG5cdC8vb3RoZXJcclxuXHQvKiogcmV0dXJuIGEgc3FsIHNuaXBwZWQgdG8gZmV0Y2ggYSBjbGFyaW9uIGRhdGUgZnJvbSB0aGUgZGF0YWJhc2UgYXMgYSBzdGFuZGFyZCBkYXRlKi9cclxuXHRwdWJsaWMgZGF0ZShmaWVsZCkge1xyXG5cdFx0cmV0dXJuIGBjb252ZXJ0KHZhcmNoYXIsY29udmVydChkYXRldGltZSwke2ZpZWxkfS0zNjE2MyksMTAzKWA7XHJcblx0fVxyXG59XHJcblxyXG4vKiogU3RyaW5nIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgU3RyIHtcclxuXHJcblx0cHVibGljIGNhcGl0YWxpc2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHR2YXIgcmV0dXJuVmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHdcXFMqL2csIGZ1bmN0aW9uICh0eHQpIHsgcmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTsgfSk7XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIFVSSSBlbmNvZGVkIHN0cmluZyAqL1xyXG5cdHB1YmxpYyBmaXhlZEVuY29kZVVSSUNvbXBvbmVudCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHVybCkucmVwbGFjZSgvWyEnKCkqXS9nLCBmdW5jdGlvbiAoYykge1xyXG5cdFx0XHRyZXR1cm4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIG9ic2VydmFibGUgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBmaWx0ZXJBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4W3NlYXJjaEZpZWxkXSAmJiB4W3NlYXJjaEZpZWxkXS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBuZXcgT2JzZXJ2YWJsZUFycmF5KGZpbHRlcmVkRGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgb2JzZXJ2YWJsZSBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGRzKHByb3BlcnRpZXMpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGZpbHRlckFycmF5QnlBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZ1tdLCBzZWFyY2hUZXh0OiBzdHJpbmcpIHtcclxuXHRcdHNlYXJjaFRleHQgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKClcclxuXHRcdHZhciBmaWx0ZXJlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hGaWVsZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh4W3NlYXJjaEZpZWxkW2ldXSAmJiB4W3NlYXJjaEZpZWxkW2ldXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmV3IE9ic2VydmFibGVBcnJheShmaWx0ZXJlZERhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiB0cnVlIGlmIHRlIHN0cmluZyBpcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgaW5MaXN0KHZhbHVlOiBzdHJpbmcsIGxpc3RBcnJheTogc3RyaW5nW10pOiBib29sZWFuIHtcclxuXHRcdGlmIChsaXN0QXJyYXkuaW5kZXhPZih2YWx1ZSkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIHRydWUgaWYgYSBzdHJpbmcgY29udGFpbnMgYW55IGl0ZW0gaW4gdGhlIHN1YnN0cmluZyBhcnJheSkgKi9cclxuXHRwdWJsaWMgY29udGFpbnNBbnkoc3RyOiBzdHJpbmcsIHN1YnN0cmluZ3M6IHN0cmluZ1tdKTogYm9vbGVhbiB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSAhPSBzdWJzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChzdHIuaW5kZXhPZihzdWJzdHJpbmdzW2ldKSAhPSAtIDEpIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqIGZpbmQgaW5kZXggaW4gYXJyYXkgb2Ygb2JqZWN0cyAqL1xyXG5cdHB1YmxpYyBhcnJheUluZGV4T2YoYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KTogbnVtYmVyIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpICE9IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBmaWVsZCA9IGFycmF5W2ldW3NlYXJjaEZpZWxkXTtcclxuXHRcdFx0aWYgKGZpZWxkID0gc2VhcmNoVmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIC0xO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZChwcm9wZXJ0eSkgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlJdGVtcyhhcnJheTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmcsIHNlYXJjaFZhbHVlOiBhbnkpIHtcclxuXHRcdHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKG9iaikge1xyXG5cdFx0XHRyZXR1cm4gb2JqW3NlYXJjaEZpZWxkXSA9PSBzZWFyY2hWYWx1ZTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGRzKHByb3BlcnRpZXMpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGdldEFycmF5SXRlbXNCeUFycmF5KGRhdGE6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nW10sIHNlYXJjaFRleHQ6IHN0cmluZykge1xyXG5cdFx0aWYgKCFzZWFyY2hUZXh0KSByZXR1cm4gZGF0YTtcclxuXHRcdHNlYXJjaFRleHQgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKClcclxuXHRcdHZhciBmaWx0ZXJlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hGaWVsZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh4W3NlYXJjaEZpZWxkW2ldXSAmJiB4W3NlYXJjaEZpZWxkW2ldXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gZmlsdGVyZWREYXRhO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgZmlyc3QgaXRlbSBmcm9tIGFuIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZChwcm9wZXJ0eSkgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlJdGVtKGFycmF5OiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVmFsdWU6IGFueSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXJyYXlJdGVtcyhhcnJheSwgc2VhcmNoRmllbGQsIHNlYXJjaFZhbHVlKVswXTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGFuIGFycmF5IHRvIGFuZCBvYnNlcnZhYmxlIGFycmF5ICovXHJcblx0cHVibGljIG9ic2VydmFibGVBcnJheTxUPihhcnJheT86IEFycmF5PGFueT4pOiBPYnNlcnZhYmxlQXJyYXk8VD4ge1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gbmV3IE9ic2VydmFibGVBcnJheShhcnJheSk7XHJcblx0XHRyZXR1cm5WYWx1ZS5zcGxpY2UoMCk7XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhbiBhcnJheSB0byBhbmQgb2JzZXJ2YWJsZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBvYnNlcnZhYmxlKG9iaikge1xyXG5cdFx0cmV0dXJuIG9ic2VydmFibGVNb2R1bGUuZnJvbU9iamVjdChvYmopO1xyXG5cdH1cclxuXHJcblx0LyoqIENyZWF0ZSBvYnNlcnZhYmxlZWQgcm93IGZpZWxkcyBhcyBPYnNlcnZhYmxlcyBvYmplY3RzIHRvIHBhcmVudCBhcyB0YWJsZW5hbWVfZmllbGRuYW1lICAqL1xyXG5cdHB1YmxpYyBvYmpUb09ic2VydmFibGUobWU6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSwgb2JqOiBvYmplY3QsIHByZWZpeD86IHN0cmluZykge1xyXG5cdFx0aWYgKCFtZSkgcmV0dXJuO1xyXG5cdFx0T2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdFx0bWUuc2V0KChwcmVmaXggfHwgJycpICsgXCJfXCIgKyBrZXksIG9ialtrZXldKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGNoZWNrIGlmIG9iamVjdCBpcyBlbXB0eSAgKi9cclxuXHRwdWJsaWMgaXNFbXB0eU9iamVjdChvYmopIHtcclxuXHRcdHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmxlbmd0aCA9PT0gMDtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYSBjb2x1bW4gYXJyYXkgZnJvbSBhbiBvYmplY3QgICovXHJcblx0cHVibGljIGdldEl0ZW1BcnJheUZyb21PYmplY3QoYXJyYXk6IEFycmF5PGFueT4sIG9iamVjdE5hbWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xyXG5cdFx0cmV0dXJuIGFycmF5Lm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geFtvYmplY3ROYW1lXTsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmVwbGFjZXMgYW4gZXhpc3Rpbmcgb2JzZXJ2YWJsZUFycmF5cyBkYXRhIHdpdGggYSBuZXcgYXJyYXkgICovXHJcblx0cHVibGljIHJlcGxhY2VBcnJheShhcnJheTogT2JzZXJ2YWJsZUFycmF5PGFueT4sIHdpdGhBcnJheTogYW55KSB7XHJcblx0XHRhcnJheS5zcGxpY2UoMCk7XHJcblx0XHR0aGlzLmFwcGVuZEFycmF5KGFycmF5LCB3aXRoQXJyYXkpXHJcblx0fVxyXG5cclxuXHQvKiogYXBwZW5kcyBhbiBleGlzdGluZyBvYnNlcnZhYmxlQXJyYXlzIGRhdGEgd2l0aCBhIG5ldyBhcnJheSAgKi9cclxuXHRwdWJsaWMgYXBwZW5kQXJyYXkoYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCB3aXRoQXJyYXk6IGFueSkge1xyXG5cdFx0Ly9cdG9ic2VydmFibGUgYXJyYXkgY2F1c2VzIHByb2JsZW1zIGlmIHRoZSBhcnJheSBpdGVtIGlzIG5vdCBhbiBvYnNlcnZhYmxlLlxyXG5cdFx0Ly8gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB3aXRoQXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XHJcblx0XHQvLyBcdCAgYXJyYXkucHVzaCh3aXRoQXJyYXlbaW5kZXhdKTtcclxuXHRcdC8vICB9XHJcblx0XHRpZiAoIXdpdGhBcnJheSkgcmV0dXJuO1xyXG5cdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHdpdGhBcnJheS5sZW5ndGg7IGluZGV4KyspIHtcclxuXHRcdFx0dmFyIHJvdyA9IHdpdGhBcnJheVtpbmRleF07XHJcblx0XHRcdHZhciBvUm93ID0gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSgpO1xyXG5cdFx0XHRPYmplY3Qua2V5cyhyb3cpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG5cdFx0XHRcdG9Sb3cuc2V0KGtleSwgcm93W2tleV0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0YXJyYXkucHVzaChvUm93KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBFbnVtVG9BcnJheShFbnVtT2JqKTogc3RyaW5nW10ge1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gW107XHJcblx0XHRmb3IgKHZhciBrZXkgaW4gRW51bU9iaikge1xyXG5cdFx0XHRpZiAodHlwZW9mIEVudW1PYmpba2V5XSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuVmFsdWUucHVzaChFbnVtT2JqW2tleV0ucmVwbGFjZSgvXy9nLCBcIiBcIikpO1xyXG5cdFx0fTtcclxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcclxuXHR9XHJcblxyXG5cdC8qKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIEs6ViBmcm9tIGEgbGlzdCBvZiBzdHJpbmdzICovXHJcblx0cHVibGljIHN0ckVudW08VCBleHRlbmRzIHN0cmluZz4obzogQXJyYXk8VD4pOiB7W0sgaW4gVF06IEsgfSB7XHJcblx0XHRyZXR1cm4gby5yZWR1Y2UoKHJlcywga2V5KSA9PiB7XHJcblx0XHRcdHJlc1trZXldID0ga2V5O1xyXG5cdFx0XHRyZXR1cm4gcmVzO1xyXG5cdFx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XHJcblx0fVxyXG5cclxuXHJcblxyXG59XHJcblxyXG4vKiogRGF0ZSBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIER0IHtcclxuXHJcblx0cHVibGljIG1vbWVudChkYXRlPzogRGF0ZSk6IG1vbWVudC5Nb21lbnQge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvL1llYXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgeWVhciB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZFllYXJzKGRheTogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGRheSwgJ3llYXJzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cdC8qKiBzdGFydCBvZiB5ZWFyICovXHJcblx0cHVibGljIGRhdGVZZWFyU3RhcnQoZGF0ZT86IERhdGUsIGFkZFllYXJzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5zdGFydE9mKCd5ZWFyJykuYWRkKGFkZFllYXJzIHx8IDAsIFwieWVhcnNcIikudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvKiogZW5kIG9mIHllYXIgKi9cclxuXHRwdWJsaWMgZGF0ZVllYXJFbmQoZGF0ZT86IERhdGUsIGFkZFllYXJzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5lbmRPZigneWVhcicpLmFkZChhZGRZZWFycyB8fCAwLCBcInllYXJzXCIpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9Nb250aHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIG1vbnRoIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkTW9udGhzKGRheTogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGRheSwgJ21vbnRocycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHQvKiogc3RhcnQgb2YgbW9udGggKi9cclxuXHRwdWJsaWMgZGF0ZU1vbnRoU3RhcnQoZGF0ZT86IERhdGUsIGFkZE1vbnRocz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuc3RhcnRPZignbW9udGgnKS5hZGQoYWRkTW9udGhzIHx8IDAsICdtb250aHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8qKiBlbmQgb2YgbW9udGggKi9cclxuXHRwdWJsaWMgZGF0ZU1vbnRoRW5kKGRhdGU/OiBEYXRlLCBhZGRNb250aHM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmVuZE9mKCdtb250aCcpLmFkZChhZGRNb250aHMgfHwgMCwgJ21vbnRocycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9EYXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIGRheSB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZERheXMoZGF5OiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoZGF5LCAnZGF5cycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9XZWVrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIHN0YXJ0IG9mIHdlZWsgKi9cclxuXHRwdWJsaWMgZGF0ZVdlZWtTdGFydChkYXRlPzogRGF0ZSwgYWRkV2Vla3M/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ2lzb1dlZWsnKS5hZGQoYWRkV2Vla3MgfHwgMCwgJ3dlZWtzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cdC8qKiBlbmQgb2Ygd2VlayAqL1xyXG5cdHB1YmxpYyBkYXRlV2Vla0VuZChkYXRlPzogRGF0ZSwgYWRkV2Vla3M/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmVuZE9mKCdpc29XZWVrJykuYWRkKGFkZFdlZWtzIHx8IDAsICd3ZWVrcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9Ib3VycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBob3VyIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkSG91cnMoaG91cjogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGhvdXIsICdob3VycycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9NaW51dGVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIG1pbnV0ZXMgdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGRNaW51dGVzKG1pbnV0ZXM6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChtaW51dGVzLCAnbWludXRlcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9jb252ZXJ0IHRvIHN0cmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChZWVlZLU1NLUREKSAqL1xyXG5cdHB1YmxpYyBkYXRlVG9TdHJZTUQoZGF0ZT86IERhdGUpOiBzdHJpbmcge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKEREL01NL1lZWVkpICovXHJcblx0cHVibGljIGRhdGVUb1N0cihkYXRlPzogRGF0ZSwgZm9ybWF0PzogJ0REL01NL1lZWScgfCAnWVlZWS1NTS1ERCcgfCAnRCBNTU0gWVlZWScgfCAnRCBNTU1NIFlZWVknKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRzd2l0Y2ggKGZvcm1hdCkge1xyXG5cdFx0XHRjYXNlIFwiRCBNTU1NIFlZWVlcIjpcclxuXHRcdFx0XHR2YXIgZCA9IGRhdGUgfHwgbmV3IERhdGUoKTtcclxuXHRcdFx0XHRyZXR1cm4gZC5nZXREYXRlKCkgKyAnICcgKyBtZS5tb250aE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdGNhc2UgXCJEIE1NTSBZWVlZXCI6XHJcblx0XHRcdFx0dmFyIGQgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XHJcblx0XHRcdFx0cmV0dXJuIGQuZ2V0RGF0ZSgpICsgJyAnICsgbWUubW9udGhTaG9ydE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdGNhc2UgXCJZWVlZLU1NLUREXCI6XHJcblx0XHRcdFx0cmV0dXJuIG1vbWVudChkYXRlKS5mb3JtYXQoZm9ybWF0KTtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnREQvTU0vWVlZWScpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChERC9NTS9ZWVlZKSAqL1xyXG5cdHB1YmxpYyB0aW1lVG9TdHIoZGF0ZT86IERhdGUpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5mb3JtYXQoJ2hoOm1tIEEnKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgc3RyaW5nIHRvIGEgZGF0ZSBcclxuXHQgKiogRGVmYXVsdCBmb3JtYXQ6ICAoREQvTU0vWVlZWSkgIFxyXG5cdCovXHJcblx0cHVibGljIHN0clRvRGF0ZShkYXRlOiBzdHJpbmcsIGZvcm1hdD86IHN0cmluZyk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdG1vbWVudCgpLnRvRGF0ZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKGZvcm1hdCkgZGF0ZSA9IGRhdGUuc3Vic3RyKDAsIGZvcm1hdC5sZW5ndGgpO1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUsIGZvcm1hdCB8fCAnREQvTU0vWVlZWScpLnRvRGF0ZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBtb21lbnQgb2JqZWN0ICovXHJcblx0cHVibGljIHN0clRvTW9tZW50KGRhdGU6IHN0cmluZykge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSwgJ0REL01NL1lZWVknKTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25EYXRlKGRhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHR2YXIgb25lRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMDsgLy8gaG91cnMqbWludXRlcypzZWNvbmRzKm1pbGxpc2Vjb25kc1xyXG5cdFx0dmFyIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKFwiRGVjZW1iZXIgMjgsIDE4MDBcIik7XHJcblx0XHR2YXIgZGlmZkRheXMgPSBNYXRoLnJvdW5kKE1hdGguYWJzKChkYXRlLmdldFRpbWUoKSAtIHN0YXJ0RGF0ZS5nZXRUaW1lKCkpIC8gKG9uZURheSkpKVxyXG5cdFx0cmV0dXJuIGRpZmZEYXlzXHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBjbGFyaW9uRGF0ZVRvRGF0ZShjbGFyaW9uRGF0ZT86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFjbGFyaW9uRGF0ZSkgcmV0dXJuIG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5kYXRlQWRkRGF5cyhjbGFyaW9uRGF0ZSwgbmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKSk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgc2hvcnRNb250aChjbGFyaW9uRGF0ZT86IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGRhdGUgPSBtZS5jbGFyaW9uRGF0ZVRvRGF0ZShjbGFyaW9uRGF0ZSk7XHJcblx0XHRyZXR1cm4gbWUubW9udGhTaG9ydE5hbWUoZGF0ZS5nZXRNb250aCgpICsgMSk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgbW9udGhZZWFyKGNsYXJpb25EYXRlPzogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZGF0ZSA9IG1lLmNsYXJpb25EYXRlVG9EYXRlKGNsYXJpb25EYXRlKTtcclxuXHRcdHJldHVybiBtZS5tb250aFNob3J0TmFtZShkYXRlLmdldE1vbnRoKCkgKyAxKSArICdgJyArIGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpLnN1YnN0cigyLCAyKTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgc2hvcnQgZGVzY3JpcHRpb24gZm9yIG1vbnRoICovXHJcblx0cHVibGljIG1vbnRoU2hvcnROYW1lKG1vbnRoOiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0aWYgKCFtb250aCkgcmV0dXJuICcnO1xyXG5cdFx0dmFyIG1vbnRoX25hbWVzX3Nob3J0ID0gWycnLCAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXTtcclxuXHRcdHZhciBtb250aE5hbWUgPSBtb250aF9uYW1lc19zaG9ydFttb250aF07XHJcblx0XHRyZXR1cm4gbW9udGhOYW1lO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBzaG9ydCBkZXNjcmlwdGlvbiBmb3IgbW9udGggKi9cclxuXHRwdWJsaWMgbW9udGhOYW1lKG1vbnRoOiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0aWYgKCFtb250aCkgcmV0dXJuICcnO1xyXG5cdFx0dmFyIG1vbnRoX25hbWVzX3Nob3J0ID0gWycnLCAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b3ZlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddO1xyXG5cdFx0dmFyIG1vbnRoTmFtZSA9IG1vbnRoX25hbWVzX3Nob3J0W21vbnRoXTtcclxuXHRcdHJldHVybiBtb250aE5hbWU7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHNob3J0IGRlc2NyaXB0aW9uIGZvciBtb250aCAqL1xyXG5cdHB1YmxpYyBkYXlPZldlZWsoZGF0ZTogRGF0ZSwgb3B0aW9uPzogXCJTaG9ydFwiIHwgXCJMb25nXCIpOiBzdHJpbmcge1xyXG5cdFx0aWYgKCFkYXRlKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgZGF5X25hbWVzX3Nob3J0ID0gWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRhdGUnLCAnU2F0dXJkYXknXTtcclxuXHRcdHZhciBkYXlfbmFtZXNfbG9uZyA9IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J107XHJcblx0XHRpZiAob3B0aW9uID09IFwiU2hvcnRcIikge1xyXG5cdFx0XHRyZXR1cm4gZGF5X25hbWVzX3Nob3J0W2RhdGUuZ2V0RGF5KCldXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gZGF5X25hbWVzX2xvbmdbZGF0ZS5nZXREYXkoKV1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBjbGFyaW9uVGltZShkYXRlPzogRGF0ZSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0dmFyIG1tdE1pZG5pZ2h0ID0gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ2RheScpO1xyXG5cdFx0dmFyIHNlY29uZHMgPSBtb21lbnQoZGF0ZSkuZGlmZihtbXRNaWRuaWdodCwgJ3NlY29uZHMnKSAqIDEwMDtcclxuXHRcdHJldHVybiBzZWNvbmRzXHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gdGltZSAqL1xyXG5cdHB1YmxpYyBjbGFyaW9uVGltZVRvRGF0ZShjbGFyaW9uRGF0ZT86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFjbGFyaW9uRGF0ZSkgcmV0dXJuIG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KG5ldyBEYXRlKFwiRGVjZW1iZXIgMjgsIDE4MDBcIikpLmFkZChjbGFyaW9uRGF0ZSAvIDEwMCwgJ3NlY29uZHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChERC9NTS9ZWVlZKSAqL1xyXG5cdHB1YmxpYyBkaWZmRGF5cyhmcm9tRGF0ZTogRGF0ZSwgdG9EYXRlPzogRGF0ZSk6IG51bWJlciB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGRhdGUgPSBtb21lbnQodG9EYXRlKTtcclxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IGRhdGUuZGlmZihmcm9tRGF0ZSwgXCJkYXlzXCIpO1xyXG5cdFx0cmV0dXJuIGlzTmFOKHJldHVyblZhbHVlKSA/IG51bGwgOiByZXR1cm5WYWx1ZTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogZ2V0IHRoZSBkYXlzIGRpZmZlcmVudCBpbiB3b3JkcyAqL1xyXG5cdHB1YmxpYyBkaWZmRGF5c1dvcmRzKGRhdGU6IERhdGUpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghZGF0ZSkgcmV0dXJuICcnO1xyXG5cdFx0dmFyIGRheXMgPSBtZS5kaWZmRGF5cyhkYXRlKTtcclxuXHRcdHN3aXRjaCAoZGF5cykge1xyXG5cdFx0XHRjYXNlIG51bGw6XHJcblx0XHRcdFx0cmV0dXJuICcnO1xyXG5cdFx0XHRjYXNlIC0xOlxyXG5cdFx0XHRcdHJldHVybiAndG9tb3Jyb3cnO1xyXG5cdFx0XHRjYXNlIDA6XHJcblx0XHRcdFx0cmV0dXJuIGR0LnRpbWVUb1N0cihkYXRlKTtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHJldHVybiAneWVzdGVyZGF5JztcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRjYXNlIDM6XHJcblx0XHRcdGNhc2UgNDpcclxuXHRcdFx0Y2FzZSA1OlxyXG5cdFx0XHRjYXNlIDY6XHJcblx0XHRcdFx0cmV0dXJuIGR0LmRheU9mV2VlayhkYXRlKTtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRyZXR1cm4gZHQuZGF0ZVRvU3RyKGRhdGUsIFwiRCBNTU1NIFlZWVlcIilcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBFeHRyYSBmdW5jdGlvbnMgdXNlZCB3aXRoIHZpZXdzICovXHJcbmV4cG9ydCBjbGFzcyBWaWV3RXh0IHtcclxuXHJcblx0LyoqIHJlbW92ZSB0aGUgZm9jdXMgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGNsZWFyQW5kRGlzbWlzcyh2aWV3OiB2aWV3LlZpZXdCYXNlKSB7XHJcblx0XHRpZiAoIXZpZXcpIHJldHVybjtcclxuXHRcdHRoaXMuZGlzbWlzc1NvZnRJbnB1dCh2aWV3KTtcclxuXHRcdHRoaXMuY2xlYXJGb2N1cyh2aWV3KTtcclxuXHR9XHJcblxyXG5cdC8qKiByZW1vdmUgdGhlIGZvY3VzIGZyb20gYSB2aWV3IG9iamVjdCAqL1xyXG5cdHB1YmxpYyBjbGVhckZvY3VzKHZpZXc6IHZpZXcuVmlld0Jhc2UpIHtcclxuXHRcdGlmICghdmlldykgcmV0dXJuO1xyXG5cdFx0aWYgKGlzQW5kcm9pZCkgaWYgKHZpZXcuYW5kcm9pZCkgdmlldy5hbmRyb2lkLmNsZWFyRm9jdXMoKTtcclxuXHR9XHJcblxyXG5cdC8qKiBoaWRlIHRoZSBzb2Z0IGtleWJvYXJkIGZyb20gYSB2aWV3IG9iamVjdCAqL1xyXG5cdHB1YmxpYyBkaXNtaXNzU29mdElucHV0KHZpZXc6IHZpZXcuVmlld0Jhc2UpIHtcclxuXHRcdGlmICghdmlldykgcmV0dXJuO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0KDxhbnk+dmlldykuZGlzbWlzc1NvZnRJbnB1dCgpO1xyXG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElWYWx1ZUl0ZW0ge1xyXG5cdFZhbHVlTWVtYmVyOiBhbnk7XHJcblx0RGlzcGxheU1lbWJlcjogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogYSB2YWx1ZSBsaXN0IGFycmF5ICovXHJcbmV4cG9ydCBjbGFzcyBWYWx1ZUxpc3Qge1xyXG5cclxuXHQvKiogdGhpcyBhcnJheSBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHByaXZhdGUgaXRlbXM6IEFycmF5PElWYWx1ZUl0ZW0+O1xyXG5cclxuXHQvKiogdGhlIG51bWJlciBvZiBpdGVtcyAqL1xyXG5cdGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuaXRlbXMubGVuZ3RoOyB9XHJcblxyXG5cdGNvbnN0cnVjdG9yKGFycmF5PzogQXJyYXk8SVZhbHVlSXRlbT4pIHtcclxuXHRcdGlmIChhcnJheSkgdGhpcy5pdGVtcyA9IGFycmF5O1xyXG5cdH1cclxuXHJcblx0LyoqIGFkZCBhIG5ldyBpdGVtIHRvIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW0oaXRlbTogSVZhbHVlSXRlbSkge1xyXG5cdFx0dGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGFkZCBhIG5ldyBpdGVtIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbUZyb250KGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHRoaXMuaXRlbXMudW5zaGlmdChpdGVtKTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGxpc3Qgb2YgdmFsdWUgaXRlbXMgKi9cclxuXHRwdWJsaWMgZ2V0SXRlbXMoKTogQXJyYXk8SVZhbHVlSXRlbT4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuaXRlbXM7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IGFuIGl0ZW0gYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldEl0ZW0oaW5kZXg6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGV4dChpbmRleCk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBkaXNwbGF5IHZhbHVlIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0KGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLml0ZW1zLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gXCJcIjtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLml0ZW1zW2luZGV4XS5EaXNwbGF5TWVtYmVyO1xyXG5cdH1cclxuXHQvKiogZ2V0IGFuIGFycmF5IG9mIHRoZSBpdGVtcyB0ZXh0IGZpZWxkICAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0QXJyYXkoKTogQXJyYXk8YW55PiB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG1lLml0ZW1zLm1hcChmdW5jdGlvbiAoeDogSVZhbHVlSXRlbSkgeyByZXR1cm4geC5EaXNwbGF5TWVtYmVyOyB9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIHZhbHVlIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRWYWx1ZShpbmRleDogbnVtYmVyKSB7XHJcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdLlZhbHVlTWVtYmVyO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgaW5kZXggYnkgaXRzIHZhbHVlLCB1c2UgZGVmYXVsdCBpbmRleCBpZiBub3QgZm91bmQgZWxzZSByZXR1cm4gLTEgKi9cclxuXHJcblx0cHVibGljIGdldEluZGV4KHZhbHVlOiBhbnksIGRlZmF1bHRJbmRleD86IG51bWJlcik6IG51bWJlciB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKHRoaXMuZ2V0VmFsdWUoaSkgPT0gdmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlZmF1bHRJbmRleCA9PSBudWxsID8gLTEgOiBkZWZhdWx0SW5kZXg7XHJcblx0fVxyXG59XHJcblxyXG4vKiogYSB2YWx1ZSBsaXN0IGFycmF5ICovXHJcbmV4cG9ydCBjbGFzcyBEaWN0aW9uYXJ5IHtcclxuXHJcblx0LyoqIHRoaXMgYXJyYXkgb2YgdmFsdWUgaXRlbXMgKi9cclxuXHRwcml2YXRlIF9pdGVtcyA9IFtdO1xyXG5cdC8qKiBnZXQgdGhlIGxpc3Qgb2YgdmFsdWUgaXRlbXMgKi9cclxuXHRwdWJsaWMgZ2V0IGl0ZW1zKCkgeyByZXR1cm4gdGhpcy5faXRlbXMgfVxyXG5cdC8qKiBzZXQgdGhlIGxpc3Qgb2YgdmFsdWUgaXRlbXMgKi9cclxuXHRwdWJsaWMgc2V0IGl0ZW1zKGFycmF5KSB7IHRoaXMuX2l0ZW1zID0gYXJyYXkgfVxyXG5cclxuXHRwdWJsaWMgdmFsdWVNZW1iZXJOYW1lID0gXCJWYWx1ZU1lbWJlclwiO1xyXG5cdHB1YmxpYyBkaXNwbGF5TWVtYmVyTmFtZSA9IFwiRGlzcGxheU1lbWJlclwiO1xyXG5cclxuXHQvKiogdGhlIG51bWJlciBvZiBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aDsgfVxyXG5cclxuXHRjb25zdHJ1Y3RvcihhcnJheT86IEFycmF5PGFueT4sIHZhbHVlTWVtYmVyTmFtZT86IHN0cmluZywgZGlzcGxheU1lbWJlck5hbWU/OiBzdHJpbmcpIHtcclxuXHRcdHRoaXMuYWRkSXRlbXMoYXJyYXksIHZhbHVlTWVtYmVyTmFtZSwgZGlzcGxheU1lbWJlck5hbWUpO1xyXG5cdH1cclxuXHJcblx0LyoqIGFkZCBhIG5ldyBpdGVtIHRvIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW0oaXRlbTogSVZhbHVlSXRlbSkge1xyXG5cdFx0dGhpcy5pdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGFkZCBhIG5ldyBpdGVtIHRvIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW1zKGFycmF5OiBBcnJheTxhbnk+LCB2YWx1ZU1lbWJlck5hbWU6IHN0cmluZywgZGlzcGxheU1lbWJlck5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmIChhcnJheSkgbWUuaXRlbXMgPSBhcnJheTtcclxuXHRcdGlmICh2YWx1ZU1lbWJlck5hbWUpIHRoaXMudmFsdWVNZW1iZXJOYW1lID0gdmFsdWVNZW1iZXJOYW1lO1xyXG5cdFx0aWYgKGRpc3BsYXlNZW1iZXJOYW1lKSB0aGlzLmRpc3BsYXlNZW1iZXJOYW1lID0gZGlzcGxheU1lbWJlck5hbWU7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtRnJvbnQoaXRlbTogSVZhbHVlSXRlbSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBhZGRJdGVtID0ge307XHJcblx0XHRhZGRJdGVtW21lLnZhbHVlTWVtYmVyTmFtZV0gPSBpdGVtLlZhbHVlTWVtYmVyO1xyXG5cdFx0YWRkSXRlbVttZS5kaXNwbGF5TWVtYmVyTmFtZV0gPSBpdGVtLkRpc3BsYXlNZW1iZXI7XHJcblx0XHR0aGlzLml0ZW1zLnVuc2hpZnQoYWRkSXRlbSk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqIGdldCBhbiBpdGVtIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdHJldHVybiB0aGlzLmdldFRleHQoaW5kZXgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgZGlzcGxheSB2YWx1ZSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VGV4dChpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IG1lLml0ZW1zLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gXCJcIjtcclxuXHRcdH1cclxuXHRcdHJldHVybiBtZS5pdGVtc1tpbmRleF1bbWUuZGlzcGxheU1lbWJlck5hbWVdO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBhbiBhcnJheSBvZiB0aGUgaXRlbXMgZGlzcGxheSBtZW1iZXJzICAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0QXJyYXkoKTogQXJyYXk8YW55PiB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG1lLml0ZW1zLm1hcChmdW5jdGlvbiAoeDogSVZhbHVlSXRlbSkgeyByZXR1cm4geFttZS5kaXNwbGF5TWVtYmVyTmFtZV07IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgdmFsdWVNZW1iZXIgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFZhbHVlKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoIW1lLml0ZW1zIHx8IG1lLml0ZW1zLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcclxuXHRcdGlmIChpbmRleCA9PSB1bmRlZmluZWQgfHwgaW5kZXggPCAwIHx8IGluZGV4ID49IG1lLml0ZW1zLmxlbmd0aCkgcmV0dXJuIG51bGw7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXNbaW5kZXhdW21lLnZhbHVlTWVtYmVyTmFtZV07XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBpbmRleCBieSBpdHMgdmFsdWVNZW1lYmVyLCB1c2UgZGVmYXVsdCBpbmRleCBpZiBub3QgZm91bmQgZWxzZSByZXR1cm4gLTEgKi9cclxuXHRwdWJsaWMgZ2V0SW5kZXgodmFsdWU6IGFueSwgZGVmYXVsdEluZGV4PzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKG1lLmdldFZhbHVlKGkpID09IHZhbHVlKSByZXR1cm4gaTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBkZWZhdWx0SW5kZXggPT0gbnVsbCA/IC0xIDogZGVmYXVsdEluZGV4O1xyXG5cdH1cclxufVxyXG5cclxuLyoqIEZpbGUgYWNjZXNzIGZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgRmlsZSB7XHJcblxyXG5cdHB1YmxpYyBkb2N1bWVudEZvbGRlciA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmRvY3VtZW50cygpO1xyXG5cclxuXHRwdWJsaWMgdGVtcEZvbGRlciA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLnRlbXAoKTtcclxuXHJcblx0cHVibGljIGRvd25sb2FkRm9sZGVyID0gaXNBbmRyb2lkID8gYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VQdWJsaWNEaXJlY3RvcnkoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5ESVJFQ1RPUllfRE9XTkxPQURTKS5nZXRBYnNvbHV0ZVBhdGgoKSA6ICcnO1xyXG5cclxuXHJcblx0LyoqIGxvYWQganNvbiBmcm9tIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBleGlzdHMoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBtZS5kb2N1bWVudEZvbGRlci5jb250YWlucyhmaWxlbmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKiogc2F2ZSBqc29uIHRvIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBzYXZlRmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS53cml0ZVN5bmMoZGF0YSwgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJlc29sdmUoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGxvYWQganNvbiBmcm9tIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBsb2FkSlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUucmVhZFRleHQoKS50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHRcdFx0dmFyIHJldHVyblZhbHVlID0gbnVsbDtcclxuXHRcdFx0XHRpZiAoY29udGVudCAhPSBcIlwiKSByZXR1cm5WYWx1ZSA9IEpTT04ucGFyc2UoY29udGVudCk7XHJcblx0XHRcdFx0cmVzb2x2ZShyZXR1cm5WYWx1ZSk7XHJcblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBzYXZlIGpzb24gdG8gYSBmaWxlICovXHJcblx0cHVibGljIHNhdmVKU09ORmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS53cml0ZVRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdFx0XHRyZXNvbHZlKGNvbnRlbnQpO1xyXG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyoqIGVtcHR5IHRoZSBmaWxlICovXHJcblx0cHVibGljIGNsZWFySlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIGZpbGUgPSB0aGlzLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0ZmlsZS53cml0ZVRleHQoSlNPTi5zdHJpbmdpZnkoe30pKTtcclxuXHR9XHJcblxyXG5cdC8vKiogY3JlYXRlIGEgZnVsbCBmaWxlbmFtZSBpbmNsdWRpbmcgdGhlIGZvbGRlciBmb3IgdGhlIGN1cnJlbnQgYXBwICovXHJcblx0cHVibGljIGdldEZ1bGxGaWxlbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUucGF0aC5qb2luKG1lLmRvY3VtZW50Rm9sZGVyLnBhdGgsIGZpbGVuYW1lKTtcclxuXHR9XHJcblx0Ly8qKiBjcmVhdGUgYSBmdWxsIGZpbGVuYW1lIGluY2x1ZGluZyB0aGUgdGVtcCBmb2xkZXIgZm9yIHRoZSBjdXJyZW50IGFwcCAqL1xyXG5cdHB1YmxpYyBnZXRGdWxsVGVtcEZpbGVuYW1lKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5wYXRoLmpvaW4obWUudGVtcEZvbGRlci5wYXRoLCBmaWxlbmFtZSk7XHJcblx0fVxyXG5cdC8vIHB1YmxpYyBkZWxldGVGaWxlKHBhcnR5OiBzdHJpbmcpIHtcclxuXHQvLyBcdHZhciBmaWxlID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCkuZ2V0RmlsZShwYXJ0eSk7XHJcblx0Ly8gXHRmaWxlLlxyXG5cdC8vIH1cclxuXHJcblxyXG5cdHB1YmxpYyBkb3dubG9hZFVybCh1cmwsIGZpbGVQYXRoKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHJcblx0XHRcdGh0dHAuZ2V0RmlsZSh1cmwsIGZpbGVQYXRoKS50aGVuKGZ1bmN0aW9uIChyKSB7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSByLnJlYWRTeW5jKCk7XHJcblx0XHRcdFx0Y2FsbC5vcGVuRmlsZShmaWxlUGF0aCk7XHJcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gbmV3IEVycm9yKFwiRXJyb3IgZG93bmxvYWRpbmcgJ1wiICsgZmlsZVBhdGggKyBcIicuIFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEljb21wb3NlRW1haWwge1xyXG5cdHRvOiBzdHJpbmc7XHJcblx0c3ViamVjdD86IHN0cmluZztcclxuXHRib2R5Pzogc3RyaW5nO1xyXG5cdHNhbHV0YXRpb24/OiBzdHJpbmc7XHJcblx0ZGVhcj86IHN0cmluZztcclxuXHRyZWdhcmRzPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogY2FsbCB0aGlyZHBhcnR5IGFwcHMgKi9cclxuZXhwb3J0IGNsYXNzIENhbGwge1xyXG5cclxuXHQvKiogY29tcG9zZSBhbiBlbWFpbCAqL1xyXG5cdHB1YmxpYyBjb21wb3NlRW1haWwobWVzc2FnZTogSWNvbXBvc2VFbWFpbCkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBzdWJqZWN0ID0gKG1lc3NhZ2Uuc3ViamVjdCB8fCBcIlN1cHBvcnRcIik7XHJcblx0XHRpZiAoIW1lc3NhZ2UuYm9keSkge1xyXG5cdFx0XHRtZXNzYWdlLmJvZHkgPSAobWVzc2FnZS5zYWx1dGF0aW9uIHx8IChtZXNzYWdlLmRlYXIgPyBcIkRlYXIgXCIgKyBtZXNzYWdlLmRlYXIgOiBudWxsKSB8fCBcIkRlYXIgTWFkYW0vU2lyXCIpO1xyXG5cdFx0XHRpZiAobWVzc2FnZS5yZWdhcmRzKSBtZXNzYWdlLmJvZHkgKz0gXCI8QlI+PEJSPjxCUj5SZWdhcmRzPEJSPlwiICsgbWVzc2FnZS5yZWdhcmRzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVtYWlsLmF2YWlsYWJsZSgpLnRoZW4oZnVuY3Rpb24gKGF2YWlsKSB7XHJcblx0XHRcdGlmIChhdmFpbCkge1xyXG5cdFx0XHRcdHJldHVybiBlbWFpbC5jb21wb3NlKHtcclxuXHRcdFx0XHRcdHRvOiBbbWVzc2FnZS50b10sXHJcblx0XHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0LFxyXG5cdFx0XHRcdFx0Ym9keTogbWVzc2FnZS5ib2R5LFxyXG5cdFx0XHRcdFx0YXBwUGlja2VyVGl0bGU6ICdDb21wb3NlIHdpdGguLicgLy8gZm9yIEFuZHJvaWQsIGRlZmF1bHQ6ICdPcGVuIHdpdGguLidcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVtYWlsIG5vdCBhdmFpbGFibGVcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIkVtYWlsIGNvbXBvc2VyIGNsb3NlZFwiKTtcclxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0fSk7O1xyXG5cdH1cclxuXHJcblx0LyoqIG1ha2UgYSBwaG9uZSBjYWxsICovXHJcblx0cHVibGljIHBob25lRGlhbChQaG9uZU5vOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRwaG9uZS5kaWFsKFBob25lTm8sIHRydWUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9wZW5GaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZmlsZW5hbWUgPSBmaWxlUGF0aC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aWYgKGFuZHJvaWQpIHtcclxuXHRcdFx0XHRpZiAoZmlsZW5hbWUuc3Vic3RyKDAsIDcpICE9IFwiZmlsZTovL1wiIHx8IGZpbGVuYW1lLnN1YnN0cigwLCAxMCkgIT0gXCJjb250ZW50Oi8vXCIpIGZpbGVuYW1lID0gXCJmaWxlOi8vXCIgKyBmaWxlbmFtZTtcclxuXHRcdFx0XHRpZiAoYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OLlNES19JTlQgPiBhbmRyb2lkLm9zLkJ1aWxkLlZFUlNJT05fQ09ERVMuTSkgZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKFwiZmlsZTovL1wiLCBcImNvbnRlbnQ6Ly9cIik7XHJcblxyXG5cdFx0XHRcdHZhciB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoZmlsZW5hbWUudHJpbSgpKTtcclxuXHRcdFx0XHR2YXIgdHlwZSA9IFwiYXBwbGljYXRpb24vXCIgKyAoKGV4cG9ydHMuc3RyLmluTGlzdChmaWxlbmFtZS5zbGljZSgtNCksIFsnLnBkZicsICcuZG9jJywgJy54bWwnXSkpID8gZmlsZW5hbWUuc2xpY2UoLTMpIDogXCIqXCIpO1xyXG5cclxuXHRcdFx0XHQvL0NyZWF0ZSBpbnRlbnRcclxuXHRcdFx0XHR2YXIgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fVklFVyk7XHJcblx0XHRcdFx0aW50ZW50LnNldERhdGFBbmRUeXBlKHVyaSwgdHlwZSk7XHJcblx0XHRcdFx0aW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XHJcblx0XHRcdFx0YXBwbGljYXRpb24uYW5kcm9pZC5jdXJyZW50Q29udGV4dC5zdGFydEFjdGl2aXR5KGludGVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0aW9zLm9wZW5GaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRhbGVydCgnQ2Fubm90IG9wZW4gZmlsZSAnICsgZmlsZW5hbWUgKyAnLiAnICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcblxyXG4vLyAvKiogRXh0ZW5kaW5nIE5hdGl2ZXNjcmlwdCBBdXRvY29tcGxldGUgKi9cclxuLy8gZXhwb3J0IGNsYXNzIFRva2VuSXRlbSBleHRlbmRzIGF1dG9jb21wbGV0ZU1vZHVsZS5Ub2tlbk1vZGVsIHtcclxuLy8gXHR2YWx1ZTogbnVtYmVyO1xyXG4vLyBcdGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgdmFsdWU6IG51bWJlciwgaW1hZ2U/OiBzdHJpbmcpIHtcclxuLy8gXHRcdHN1cGVyKHRleHQsIGltYWdlIHx8IG51bGwpO1xyXG4vLyBcdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4vLyBcdH1cclxuXHJcbi8vIH07XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm0ge1xyXG5cclxuXHRwdWJsaWMgc2hvd1BhZ2UobWUsIHBhZ2VOYW1lOiBzdHJpbmcsIGNvbnRleHQ/OiBhbnkpIHtcclxuXHJcblx0XHRpZiAobWUpIG1lLmNoaWxkUGFnZSA9IHBhZ2VOYW1lO1xyXG5cdFx0dmFyIGRhdGEgPSB7XHJcblx0XHRcdG1vZHVsZU5hbWU6IHBhZ2VOYW1lICsgJy8nICsgcGFnZU5hbWUsXHJcblx0XHRcdGNvbnRleHQ6IGNvbnRleHQgfHwge30sXHJcblx0XHRcdGFuaW1hdGVkOiB0cnVlLFxyXG5cdFx0XHR0cmFuc2l0aW9uOiB7IG5hbWU6IFwic2xpZGVcIiwgZHVyYXRpb246IDM4MCwgY3VydmU6IFwiZWFzZUluXCIgfSxcclxuXHRcdFx0Y2xlYXJIaXN0b3J5OiBmYWxzZSxcclxuXHRcdFx0YmFja3N0YWNrVmlzaWJsZTogdHJ1ZVxyXG5cdFx0fTtcclxuXHRcdHRvcG1vc3QoKS5uYXZpZ2F0ZShkYXRhKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBnb0JhY2soKSB7XHJcblx0XHR0b3Btb3N0KCkuZ29CYWNrKCk7XHJcblx0fTtcclxuXHJcblx0cHVibGljIHNob3dNb2RhbChwYXRoOiBzdHJpbmcsIHBhcmFtcz8sIGZ1bGxzY3JlZW4/OiBib29sZWFuKTogUHJvbWlzZTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHR0b3Btb3N0KCkuY3VycmVudFBhZ2Uuc2hvd01vZGFsKHBhdGgsIHBhcmFtcywgZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHRcdFx0XHRyZXNvbHZlKGFyZ3MpO1xyXG5cdFx0XHR9LCBmdWxsc2NyZWVuKVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgZm9ybSA9IG5ldyBGb3JtKCk7XHJcbmV4cG9ydCB2YXIgdGFnZ2luZyA9IG5ldyBUYWdnaW5nKCk7XHJcbmV4cG9ydCB2YXIgc3RyID0gbmV3IFN0cigpO1xyXG5leHBvcnQgdmFyIHNxbCA9IG5ldyBTcWwoKTtcclxuZXhwb3J0IHZhciBkdCA9IG5ldyBEdCgpO1xyXG5leHBvcnQgdmFyIHZpZXdFeHQgPSBuZXcgVmlld0V4dCgpO1xyXG5leHBvcnQgdmFyIGZpbGUgPSBuZXcgRmlsZSgpO1xyXG5leHBvcnQgdmFyIGNhbGwgPSBuZXcgQ2FsbCgpO1xyXG5leHBvcnQgdmFyIHV0aWxzID0gbmV3IFV0aWxzKCk7XHJcbiJdfQ==