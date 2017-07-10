"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sf = require('sf');
var application = require("application");
var moment = require("moment");
var observableModule = require("data/observable");
var fileSystemModule = require("file-system");
var phone = require("nativescript-phone");
var email = require("nativescript-email");
var http = require("http");
var autocompleteModule = require("nativescript-telerik-ui-pro/autocomplete");
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
        return exports.sf("convert(varchar,convert(datetime,{0}-36163),103)", field);
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
/** Extending Nativescript Autocomplete */
var TokenItem = (function (_super) {
    __extends(TokenItem, _super);
    function TokenItem(text, value, image) {
        var _this = _super.call(this, text, image || null) || this;
        _this.value = value;
        return _this;
    }
    return TokenItem;
}(autocompleteModule.TokenModel));
exports.TokenItem = TokenItem;
;
exports.tagging = new Tagging();
exports.str = new Str();
exports.sql = new Sql();
exports.dt = new Dt();
exports.viewExt = new ViewExt();
exports.file = new File();
exports.call = new Call();
exports.utils = new Utils();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFXLFFBQUEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU5Qix5Q0FBMkM7QUFDM0MsK0JBQWlDO0FBRWpDLGtEQUFvRDtBQUNwRCw4Q0FBZ0Q7QUFDaEQsMENBQTRDO0FBQzVDLDBDQUE0QztBQUM1QywyQkFBNkI7QUFDN0IsNkVBQStFO0FBRS9FLDBEQUF3RDtBQUN4RCxxQ0FBcUM7QUFDckMscUNBQWlDO0FBTWpDLHlCQUF5QjtBQUN6QjtJQUFBO0lBb0RBLENBQUM7SUFsREEseURBQXlEO0lBQ2xELHNDQUFzQixHQUE3QixVQUFpQyxPQUF1QixFQUFFLElBQVM7UUFDbEUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJELEdBQUcsQ0FBQyxDQUFDLElBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFB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SUFBSSxFQUFFLEVBQUUsQ0FBQztBQUNkLFFBQUEsT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDeEIsUUFBQSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixRQUFBLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2xCLFFBQUEsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdmFyIHNmID0gcmVxdWlyZSgnc2YnKTtcclxuXHJcbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gXCJhcHBsaWNhdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSBcIm1vbWVudFwiO1xyXG5pbXBvcnQgKiBhcyB2aWV3IGZyb20gXCJ1aS9jb3JlL3ZpZXdcIjtcclxuaW1wb3J0ICogYXMgb2JzZXJ2YWJsZU1vZHVsZSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlXCI7XHJcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW1Nb2R1bGUgZnJvbSBcImZpbGUtc3lzdGVtXCI7XHJcbmltcG9ydCAqIGFzIHBob25lIGZyb20gXCJuYXRpdmVzY3JpcHQtcGhvbmVcIjtcclxuaW1wb3J0ICogYXMgZW1haWwgZnJvbSBcIm5hdGl2ZXNjcmlwdC1lbWFpbFwiO1xyXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gXCJodHRwXCI7XHJcbmltcG9ydCAqIGFzIGF1dG9jb21wbGV0ZU1vZHVsZSBmcm9tICduYXRpdmVzY3JpcHQtdGVsZXJpay11aS1wcm8vYXV0b2NvbXBsZXRlJztcclxuXHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gXCJkYXRhL29ic2VydmFibGUtYXJyYXlcIjtcclxuaW1wb3J0IHsgaXNBbmRyb2lkIH0gZnJvbSBcInBsYXRmb3JtXCI7XHJcbmltcG9ydCB7IGlvcyB9IGZyb20gXCJ1dGlscy91dGlsc1wiXHJcblxyXG5kZWNsYXJlIHZhciBhbmRyb2lkOiBhbnk7XHJcbmRlY2xhcmUgdmFyIGphdmE6IGFueTtcclxuXHJcblxyXG4vL01pc2NlbGxhbmlvdXMgRnVuY3Rpb25zXHJcbmV4cG9ydCBjbGFzcyBVdGlscyB7XHJcblxyXG5cdC8vQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9iamVjdCBmcm9tIGFuIGV4aXN0aW5nIG9uZVxyXG5cdHB1YmxpYyBjcmVhdGVJbnN0YW5jZUZyb21Kc29uPFQ+KG9ialR5cGU6IHsgbmV3ICgpOiBUOyB9LCBqc29uOiBhbnkpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRjb25zdCBuZXdPYmogPSBuZXcgb2JqVHlwZSgpO1xyXG5cdFx0Y29uc3QgcmVsYXRpb25zaGlwcyA9IG9ialR5cGVbXCJyZWxhdGlvbnNoaXBzXCJdIHx8IHt9O1xyXG5cclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBqc29uKSB7XHJcblx0XHRcdGlmIChqc29uLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcblx0XHRcdFx0aWYgKG5ld09ialtwcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRpZiAocmVsYXRpb25zaGlwc1twcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdG5ld09ialtwcm9wXSA9IGpzb25bcHJvcF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0bmV3T2JqW3Byb3BdID0gbWUuY3JlYXRlSW5zdGFuY2VGcm9tSnNvbihyZWxhdGlvbnNoaXBzW3Byb3BdLCBqc29uW3Byb3BdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFByb3BlcnR5ICR7cHJvcH0gbm90IHNldCBiZWNhdXNlIGl0IGFscmVhZHkgZXhpc3RlZCBvbiB0aGUgb2JqZWN0LmApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXdPYmo7XHJcblx0fVxyXG5cclxuXHQvL2FkZHMgbWlzc2luZyBmdW5jdGlvbnMgdG8gb2JqZWN0XHJcblx0cHVibGljIGluaXRPYmplY3Q8VD4ob2JqVHlwZTogeyBuZXcgKCk6IFQ7IH0sIGpzb246IGFueSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGNvbnN0IG5ld09iaiA9IG5ldyBvYmpUeXBlKCk7XHJcblx0XHRjb25zdCByZWxhdGlvbnNoaXBzID0gb2JqVHlwZVtcInJlbGF0aW9uc2hpcHNcIl0gfHwge307XHJcblxyXG5cdFx0Zm9yIChjb25zdCBwcm9wIGluIG5ld09iaikge1xyXG5cdFx0XHRpZiAobmV3T2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKGBBZGQgJHtwcm9wfS5gKTtcclxuXHRcdFx0XHRpZiAoanNvbltwcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRpZiAocmVsYXRpb25zaGlwc1twcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGpzb25bcHJvcF0gPSBuZXdPYmpbcHJvcF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0anNvbltwcm9wXSA9IG1lLmNyZWF0ZUluc3RhbmNlRnJvbUpzb24ocmVsYXRpb25zaGlwc1twcm9wXSwgbmV3T2JqW3Byb3BdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFByb3BlcnR5ICR7cHJvcH0gbm90IHNldCBiZWNhdXNlIGl0IGFscmVhZHkgZXhpc3RlZCBvbiB0aGUgb2JqZWN0LmApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogVGFnZ2luZyBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFRhZ2dpbmcge1xyXG5cclxuXHQvKiogZGVmYXVsdCB0YWcgaWNvbiAqL1xyXG5cdHB1YmxpYyB0YWdJY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwNDYpO1xyXG5cdC8qKiBkZWZhdWx0IHVudGFnIGljb24gKi9cclxuXHRwdWJsaWMgdW5UYWdJY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwOTYpO1xyXG5cclxuXHQvKiogQ3JlYXRlIGEgbmV3IG9ic2VydmFibGUgdGFnIG9iamVjdFxyXG5cdCogSWYgaWNvbiBpcyBsZWZ0IGJsYW5rIHRoZSBkZWZhdWx0IGljb24gaXMgdXNlZCBcclxuXHQqL1xyXG5cdHB1YmxpYyBuZXdUYWcoaWNvbj86IHN0cmluZyk6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSB7XHJcblx0XHRpZiAoIWljb24pIGljb24gPSB0aGlzLnVuVGFnSWNvbjtcclxuXHRcdHZhciBhID0gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSgpO1xyXG5cdFx0YS5zZXQoXCJ2YWx1ZVwiLCBpY29uKTtcclxuXHRcdHJldHVybiBhO1xyXG5cdFx0Ly9cdFx0cmV0dXJuIG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoeyB2YWx1ZTogaWNvbiB9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBzZXQgYWxsIGFycmF5IG9iamVjdHMgdGFnIHByb3BlcnR5IHRvIHRoZSBkZWZhdWx0IHRhZ2dlZCBpY29uIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0YWdBbGwoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoIWFycmF5W2ldLnRhZykgYXJyYXlbaV0udGFnID0gdGFnZ2luZy5uZXdUYWcoKTtcclxuXHRcdFx0YXJyYXlbaV0udGFnLnNldChcInZhbHVlXCIsIHRhZ2dpbmcudGFnSWNvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cdC8qKiBzZXQgYWxsIGFycmF5IG9iamVjdHMgdGFnIHByb3BlcnR5IHRvIHRoZSBkZWZhdWx0IHVudGFnZ2VkIGljb24gb2JqZWN0ICovXHJcblx0cHVibGljIHVuVGFnQWxsKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICghYXJyYXlbaV0udGFnKSBhcnJheVtpXS50YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0XHRhcnJheVtpXS50YWcuc2V0KFwidmFsdWVcIiwgdGFnZ2luZy51blRhZ0ljb24pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHQvKiogZ2V0IHRoZSB0b2dnbGVkIHRhZyBpY29uICovXHJcblx0cHVibGljIHRvZ2dsZVRhZ0ljb24oaWNvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGlmIChpY29uID09IHRoaXMudGFnSWNvbikge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy51blRhZ0ljb247XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50YWdJY29uO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIFRvZ2dsZSB0YWcgb2JzZXJ2YWJsZSAqL1xyXG5cdHB1YmxpYyB0b2dnbGVUYWcodGFnOiBhbnkpOiBhbnkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghdGFnKSB0YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0dmFyIGljb24gPSB0YWdnaW5nLnRvZ2dsZVRhZ0ljb24odGFnLmdldChcInZhbHVlXCIpKTtcclxuXHRcdHRhZy5zZXQoXCJ2YWx1ZVwiLCBpY29uKTtcclxuXHRcdHJldHVybiB0YWc7XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRoZSByb3dzIHRhZyBwcm9wZXJ0eSAqL1xyXG5cdHB1YmxpYyB0b2dnbGVSb3cocm93OiBhbnkpOiBhbnkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghcm93KSByZXR1cm4gbnVsbDtcclxuXHRcdG1lLnRvZ2dsZVRhZyhyb3cudGFnKTtcclxuXHRcdHJldHVybiByb3c7XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRoZSBvYnNlcnZhYmxlIHRhZyBvYmplY3QgKi9cclxuXHRwdWJsaWMgdG9nZ2xlT2JzZXJ2YWJsZShvYmVydmFibGVUYWc6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSk6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5uZXdUYWcodGhpcy50b2dnbGVUYWdJY29uKG9iZXJ2YWJsZVRhZy5nZXQoXCJ2YWx1ZVwiKSkpO1xyXG5cdH1cclxuXHQvKiogVG9nZ2xlIHRoZSBvYnNlcnZhYmxlIHJvd3MgdGFnIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0b2dnbGVPYnNlcnZhYmxlUm93KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55PiwgaW5kZXg6IG51bWJlcik6IE9ic2VydmFibGVBcnJheTxhbnk+IHtcclxuXHRcdHZhciByb3cgPSB0aGlzLnRvZ2dsZVJvdyhhcnJheS5nZXRJdGVtKGluZGV4KSk7XHJcblx0XHRhcnJheS5zZXRJdGVtKGluZGV4LCByb3cpO1xyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGNvdW50KGFycmF5OiBhbnlbXSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gMDtcclxuXHRcdHJldHVybiBhcnJheS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiBnZXQgbnVtYmVyIG9mIHRhZ2dlZCBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnRUYWdnZWQoYXJyYXk6IGFueVtdKTogbnVtYmVyIHtcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiAwO1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGFnZ2VkUm93cyhhcnJheSkubGVuZ3RoO1xyXG5cdH1cclxuXHQvKiogZ2V0IG51bWJlciBvZiB1bnRhZ2dlZCBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnRVbnRhZ2dlZChhcnJheTogYW55W10pOiBudW1iZXIge1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIDA7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUYWdnZWRSb3dzKGFycmF5KS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiByZXR1cm4gdGhlIHRhZ2dlZCByb3dzIGZyb20gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGdldFRhZ2dlZFJvd3MoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiBudWxsO1xyXG5cdFx0dmFyIHRhZ2dlZFJvd3MgPSBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4LnRhZyAmJiB4LnRhZy5nZXQoXCJ2YWx1ZVwiKSA9PSBtZS50YWdJY29uKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRhZ2dlZFJvd3M7XHJcblx0fVxyXG5cdC8qKiByZXR1cm4gdGhlIHVudGFnZ2VkIHJvd3MgZnJvbSB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgZ2V0VW5UYWdnZWRSb3dzKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgdGFnZ2VkUm93cyA9IGFycmF5LmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cdFx0XHRyZXR1cm4gKHgudGFnICYmIHgudGFnLmdldChcInZhbHVlXCIpID09IG1lLnVuVGFnSWNvbik7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiB0YWdnZWRSb3dzO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogU3FsIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgU3FsIHtcclxuXHQvL290aGVyXHJcblx0LyoqIHJldHVybiBhIHNxbCBzbmlwcGVkIHRvIGZldGNoIGEgY2xhcmlvbiBkYXRlIGZyb20gdGhlIGRhdGFiYXNlIGFzIGEgc3RhbmRhcmQgZGF0ZSovXHJcblx0cHVibGljIGRhdGUoZmllbGQpIHtcclxuXHRcdHJldHVybiBzZihcImNvbnZlcnQodmFyY2hhcixjb252ZXJ0KGRhdGV0aW1lLHswfS0zNjE2MyksMTAzKVwiLCBmaWVsZCk7XHJcblx0fVxyXG59XHJcblxyXG4vKiogU3RyaW5nIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgU3RyIHtcclxuXHJcblx0cHVibGljIGNhcGl0YWxpc2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHR2YXIgcmV0dXJuVmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHdcXFMqL2csIGZ1bmN0aW9uICh0eHQpIHsgcmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTsgfSk7XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIFVSSSBlbmNvZGVkIHN0cmluZyAqL1xyXG5cdHB1YmxpYyBmaXhlZEVuY29kZVVSSUNvbXBvbmVudCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHVybCkucmVwbGFjZSgvWyEnKCkqXS9nLCBmdW5jdGlvbiAoYykge1xyXG5cdFx0XHRyZXR1cm4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIG9ic2VydmFibGUgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBmaWx0ZXJBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4W3NlYXJjaEZpZWxkXSAmJiB4W3NlYXJjaEZpZWxkXS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBuZXcgT2JzZXJ2YWJsZUFycmF5KGZpbHRlcmVkRGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgb2JzZXJ2YWJsZSBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGRzKHByb3BlcnRpZXMpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGZpbHRlckFycmF5QnlBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZ1tdLCBzZWFyY2hUZXh0OiBzdHJpbmcpIHtcclxuXHRcdHNlYXJjaFRleHQgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKClcclxuXHRcdHZhciBmaWx0ZXJlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hGaWVsZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh4W3NlYXJjaEZpZWxkW2ldXSAmJiB4W3NlYXJjaEZpZWxkW2ldXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmV3IE9ic2VydmFibGVBcnJheShmaWx0ZXJlZERhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiB0cnVlIGlmIHRlIHN0cmluZyBpcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgaW5MaXN0KHZhbHVlOiBzdHJpbmcsIGxpc3RBcnJheTogc3RyaW5nW10pOiBib29sZWFuIHtcclxuXHRcdGlmIChsaXN0QXJyYXkuaW5kZXhPZih2YWx1ZSkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIHRydWUgaWYgYSBzdHJpbmcgY29udGFpbnMgYW55IGl0ZW0gaW4gdGhlIHN1YnN0cmluZyBhcnJheSkgKi9cclxuXHRwdWJsaWMgY29udGFpbnNBbnkoc3RyOiBzdHJpbmcsIHN1YnN0cmluZ3M6IHN0cmluZ1tdKTogYm9vbGVhbiB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSAhPSBzdWJzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChzdHIuaW5kZXhPZihzdWJzdHJpbmdzW2ldKSAhPSAtIDEpIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqIGZpbmQgaW5kZXggaW4gYXJyYXkgb2Ygb2JqZWN0cyAqL1xyXG5cdHB1YmxpYyBhcnJheUluZGV4T2YoYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KTogbnVtYmVyIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpICE9IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBmaWVsZCA9IGFycmF5W2ldW3NlYXJjaEZpZWxkXTtcclxuXHRcdFx0aWYgKGZpZWxkID0gc2VhcmNoVmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIC0xO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZChwcm9wZXJ0eSkgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlJdGVtcyhhcnJheTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmcsIHNlYXJjaFZhbHVlOiBhbnkpIHtcclxuXHRcdHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKG9iaikge1xyXG5cdFx0XHRyZXR1cm4gb2JqW3NlYXJjaEZpZWxkXSA9PSBzZWFyY2hWYWx1ZTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGRzKHByb3BlcnRpZXMpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGdldEFycmF5SXRlbXNCeUFycmF5KGRhdGE6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nW10sIHNlYXJjaFRleHQ6IHN0cmluZykge1xyXG5cdFx0aWYgKCFzZWFyY2hUZXh0KSByZXR1cm4gZGF0YTtcclxuXHRcdHNlYXJjaFRleHQgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKClcclxuXHRcdHZhciBmaWx0ZXJlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hGaWVsZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh4W3NlYXJjaEZpZWxkW2ldXSAmJiB4W3NlYXJjaEZpZWxkW2ldXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gZmlsdGVyZWREYXRhO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgZmlyc3QgaXRlbSBmcm9tIGFuIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZChwcm9wZXJ0eSkgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlJdGVtKGFycmF5OiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVmFsdWU6IGFueSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXJyYXlJdGVtcyhhcnJheSwgc2VhcmNoRmllbGQsIHNlYXJjaFZhbHVlKVswXTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGFuIGFycmF5IHRvIGFuZCBvYnNlcnZhYmxlIGFycmF5ICovXHJcblx0cHVibGljIG9ic2VydmFibGVBcnJheTxUPihhcnJheT86IEFycmF5PGFueT4pOiBPYnNlcnZhYmxlQXJyYXk8VD4ge1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gbmV3IE9ic2VydmFibGVBcnJheShhcnJheSk7XHJcblx0XHRyZXR1cm5WYWx1ZS5zcGxpY2UoMCk7XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhbiBhcnJheSB0byBhbmQgb2JzZXJ2YWJsZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBvYnNlcnZhYmxlKG9iaikge1xyXG5cdFx0cmV0dXJuIG9ic2VydmFibGVNb2R1bGUuZnJvbU9iamVjdChvYmopO1xyXG5cdH1cclxuXHJcblx0LyoqIENyZWF0ZSBvYnNlcnZhYmxlZWQgcm93IGZpZWxkcyBhcyBPYnNlcnZhYmxlcyBvYmplY3RzIHRvIHBhcmVudCBhcyB0YWJsZW5hbWVfZmllbGRuYW1lICAqL1xyXG5cdHB1YmxpYyBvYmpUb09ic2VydmFibGUobWU6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSwgb2JqOiBvYmplY3QsIHByZWZpeD86IHN0cmluZykge1xyXG5cdFx0aWYgKCFtZSkgcmV0dXJuO1xyXG5cdFx0T2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdFx0bWUuc2V0KChwcmVmaXggfHwgJycpICsgXCJfXCIgKyBrZXksIG9ialtrZXldKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGNoZWNrIGlmIG9iamVjdCBpcyBlbXB0eSAgKi9cclxuXHRwdWJsaWMgaXNFbXB0eU9iamVjdChvYmopIHtcclxuXHRcdHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmxlbmd0aCA9PT0gMDtcclxuXHR9XHJcblxyXG5cdC8qKiBFeHRyYWN0IG9iamVjdHMgZnJvbSBhcnJheSAgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlPYmplY3RzKGFycmF5OiBBcnJheTxhbnk+LCBvYmplY3ROYW1lOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcclxuXHRcdHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHhbb2JqZWN0TmFtZV07IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHJlcGxhY2VzIGFuIGV4aXN0aW5nIG9ic2VydmFibGVBcnJheXMgZGF0YSB3aXRoIGEgbmV3IGFycmF5ICAqL1xyXG5cdHB1YmxpYyByZXBsYWNlQXJyYXkoYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCB3aXRoQXJyYXk6IGFueSkge1xyXG5cdFx0YXJyYXkuc3BsaWNlKDApO1xyXG5cdFx0dGhpcy5hcHBlbmRBcnJheShhcnJheSwgd2l0aEFycmF5KVxyXG5cdH1cclxuXHJcblx0LyoqIGFwcGVuZHMgYW4gZXhpc3Rpbmcgb2JzZXJ2YWJsZUFycmF5cyBkYXRhIHdpdGggYSBuZXcgYXJyYXkgICovXHJcblx0cHVibGljIGFwcGVuZEFycmF5KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55Piwgd2l0aEFycmF5OiBhbnkpIHtcclxuXHRcdC8vXHRvYnNlcnZhYmxlIGFycmF5IGNhdXNlcyBwcm9ibGVtcyBpZiB0aGUgYXJyYXkgaXRlbSBpcyBub3QgYW4gb2JzZXJ2YWJsZS5cclxuXHRcdC8vICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgd2l0aEFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xyXG5cdFx0Ly8gXHQgIGFycmF5LnB1c2god2l0aEFycmF5W2luZGV4XSk7XHJcblx0XHQvLyAgfVxyXG5cdFx0aWYgKCF3aXRoQXJyYXkpIHJldHVybjtcclxuXHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB3aXRoQXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XHJcblx0XHRcdHZhciByb3cgPSB3aXRoQXJyYXlbaW5kZXhdO1xyXG5cdFx0XHR2YXIgb1JvdyA9IG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoKTtcclxuXHRcdFx0T2JqZWN0LmtleXMocm93KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdFx0XHRvUm93LnNldChrZXksIHJvd1trZXldKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGFycmF5LnB1c2gob1Jvdyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgRW51bVRvQXJyYXkoRW51bU9iaik6IHN0cmluZ1tdIHtcclxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIga2V5IGluIEVudW1PYmopIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBFbnVtT2JqW2tleV0gPT09IFwic3RyaW5nXCIpIHJldHVyblZhbHVlLnB1c2goRW51bU9ialtrZXldLnJlcGxhY2UoL18vZywgXCIgXCIpKTtcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblx0fVxyXG5cclxuXHQvKiogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBLOlYgZnJvbSBhIGxpc3Qgb2Ygc3RyaW5ncyAqL1xyXG5cdHB1YmxpYyBzdHJFbnVtPFQgZXh0ZW5kcyBzdHJpbmc+KG86IEFycmF5PFQ+KToge1tLIGluIFRdOiBLIH0ge1xyXG5cdFx0cmV0dXJuIG8ucmVkdWNlKChyZXMsIGtleSkgPT4ge1xyXG5cdFx0XHRyZXNba2V5XSA9IGtleTtcclxuXHRcdFx0cmV0dXJuIHJlcztcclxuXHRcdH0sIE9iamVjdC5jcmVhdGUobnVsbCkpO1xyXG5cdH1cclxuXHJcblxyXG5cclxufVxyXG5cclxuLyoqIERhdGUgRnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBEdCB7XHJcblxyXG5cdHB1YmxpYyBtb21lbnQoZGF0ZT86IERhdGUpOiBtb21lbnQuTW9tZW50IHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly9ZZWFycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIHllYXIgdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGRZZWFycyhkYXk6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChkYXksICd5ZWFycycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHQvKiogc3RhcnQgb2YgeWVhciAqL1xyXG5cdHB1YmxpYyBkYXRlWWVhclN0YXJ0KGRhdGU/OiBEYXRlLCBhZGRZZWFycz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuc3RhcnRPZigneWVhcicpLmFkZChhZGRZZWFycyB8fCAwLCBcInllYXJzXCIpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGVuZCBvZiB5ZWFyICovXHJcblx0cHVibGljIGRhdGVZZWFyRW5kKGRhdGU/OiBEYXRlLCBhZGRZZWFycz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZW5kT2YoJ3llYXInKS5hZGQoYWRkWWVhcnMgfHwgMCwgXCJ5ZWFyc1wiKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vTW9udGhzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBtb250aCB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZE1vbnRocyhkYXk6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChkYXksICdtb250aHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblx0LyoqIHN0YXJ0IG9mIG1vbnRoICovXHJcblx0cHVibGljIGRhdGVNb250aFN0YXJ0KGRhdGU/OiBEYXRlLCBhZGRNb250aHM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ21vbnRoJykuYWRkKGFkZE1vbnRocyB8fCAwLCAnbW9udGhzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvKiogZW5kIG9mIG1vbnRoICovXHJcblx0cHVibGljIGRhdGVNb250aEVuZChkYXRlPzogRGF0ZSwgYWRkTW9udGhzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5lbmRPZignbW9udGgnKS5hZGQoYWRkTW9udGhzIHx8IDAsICdtb250aHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vRGF5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBkYXkgdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGREYXlzKGRheTogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGRheSwgJ2RheXMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vV2Vla3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBzdGFydCBvZiB3ZWVrICovXHJcblx0cHVibGljIGRhdGVXZWVrU3RhcnQoZGF0ZT86IERhdGUsIGFkZFdlZWtzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5zdGFydE9mKCdpc29XZWVrJykuYWRkKGFkZFdlZWtzIHx8IDAsICd3ZWVrcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHQvKiogZW5kIG9mIHdlZWsgKi9cclxuXHRwdWJsaWMgZGF0ZVdlZWtFbmQoZGF0ZT86IERhdGUsIGFkZFdlZWtzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5lbmRPZignaXNvV2VlaycpLmFkZChhZGRXZWVrcyB8fCAwLCAnd2Vla3MnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vSG91cnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgaG91ciB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZEhvdXJzKGhvdXI6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChob3VyLCAnaG91cnMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vTWludXRlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBtaW51dGVzIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQobWludXRlcywgJ21pbnV0ZXMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vY29udmVydCB0byBzdHJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoWVlZWS1NTS1ERCkgKi9cclxuXHRwdWJsaWMgZGF0ZVRvU3RyWU1EKGRhdGU/OiBEYXRlKTogc3RyaW5nIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChERC9NTS9ZWVlZKSAqL1xyXG5cdHB1YmxpYyBkYXRlVG9TdHIoZGF0ZT86IERhdGUsIGZvcm1hdD86ICdERC9NTS9ZWVknIHwgJ1lZWVktTU0tREQnIHwgJ0QgTU1NIFlZWVknIHwgJ0QgTU1NTSBZWVlZJyk6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0c3dpdGNoIChmb3JtYXQpIHtcclxuXHRcdFx0Y2FzZSBcIkQgTU1NTSBZWVlZXCI6XHJcblx0XHRcdFx0dmFyIGQgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XHJcblx0XHRcdFx0cmV0dXJuIGQuZ2V0RGF0ZSgpICsgJyAnICsgbWUubW9udGhOYW1lKGQuZ2V0TW9udGgoKSArIDEpICsgJyAnICsgZC5nZXRGdWxsWWVhcigpO1xyXG5cdFx0XHRjYXNlIFwiRCBNTU0gWVlZWVwiOlxyXG5cdFx0XHRcdHZhciBkID0gZGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG5cdFx0XHRcdHJldHVybiBkLmdldERhdGUoKSArICcgJyArIG1lLm1vbnRoU2hvcnROYW1lKGQuZ2V0TW9udGgoKSArIDEpICsgJyAnICsgZC5nZXRGdWxsWWVhcigpO1xyXG5cdFx0XHRjYXNlIFwiWVlZWS1NTS1ERFwiOlxyXG5cdFx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KGZvcm1hdCk7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIG1vbWVudChkYXRlKS5mb3JtYXQoJ0REL01NL1lZWVknKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoREQvTU0vWVlZWSkgKi9cclxuXHRwdWJsaWMgdGltZVRvU3RyKGRhdGU/OiBEYXRlKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KCdoaDptbSBBJyk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIHN0cmluZyB0byBhIGRhdGUgXHJcblx0ICoqIERlZmF1bHQgZm9ybWF0OiAgKEREL01NL1lZWVkpICBcclxuXHQqL1xyXG5cdHB1YmxpYyBzdHJUb0RhdGUoZGF0ZTogc3RyaW5nLCBmb3JtYXQ/OiBzdHJpbmcpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRtb21lbnQoKS50b0RhdGUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGlmIChmb3JtYXQpIGRhdGUgPSBkYXRlLnN1YnN0cigwLCBmb3JtYXQubGVuZ3RoKTtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKS50b0RhdGUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgbW9tZW50IG9iamVjdCAqL1xyXG5cdHB1YmxpYyBzdHJUb01vbWVudChkYXRlOiBzdHJpbmcpIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUsICdERC9NTS9ZWVlZJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBjbGFyaW9uRGF0ZShkYXRlPzogRGF0ZSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0dmFyIG9uZURheSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIGhvdXJzKm1pbnV0ZXMqc2Vjb25kcyptaWxsaXNlY29uZHNcclxuXHRcdHZhciBzdGFydERhdGUgPSBuZXcgRGF0ZShcIkRlY2VtYmVyIDI4LCAxODAwXCIpO1xyXG5cdFx0dmFyIGRpZmZEYXlzID0gTWF0aC5yb3VuZChNYXRoLmFicygoZGF0ZS5nZXRUaW1lKCkgLSBzdGFydERhdGUuZ2V0VGltZSgpKSAvIChvbmVEYXkpKSlcclxuXHRcdHJldHVybiBkaWZmRGF5c1xyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgY2xhcmlvbkRhdGVUb0RhdGUoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghY2xhcmlvbkRhdGUpIHJldHVybiBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXMuZGF0ZUFkZERheXMoY2xhcmlvbkRhdGUsIG5ldyBEYXRlKFwiRGVjZW1iZXIgMjgsIDE4MDBcIikpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIHNob3J0TW9udGgoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBkYXRlID0gbWUuY2xhcmlvbkRhdGVUb0RhdGUoY2xhcmlvbkRhdGUpO1xyXG5cdFx0cmV0dXJuIG1lLm1vbnRoU2hvcnROYW1lKGRhdGUuZ2V0TW9udGgoKSArIDEpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIG1vbnRoWWVhcihjbGFyaW9uRGF0ZT86IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGRhdGUgPSBtZS5jbGFyaW9uRGF0ZVRvRGF0ZShjbGFyaW9uRGF0ZSk7XHJcblx0XHRyZXR1cm4gbWUubW9udGhTaG9ydE5hbWUoZGF0ZS5nZXRNb250aCgpICsgMSkgKyAnYCcgKyBkYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKS5zdWJzdHIoMiwgMik7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHNob3J0IGRlc2NyaXB0aW9uIGZvciBtb250aCAqL1xyXG5cdHB1YmxpYyBtb250aFNob3J0TmFtZShtb250aDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdGlmICghbW9udGgpIHJldHVybiAnJztcclxuXHRcdHZhciBtb250aF9uYW1lc19zaG9ydCA9IFsnJywgJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ107XHJcblx0XHR2YXIgbW9udGhOYW1lID0gbW9udGhfbmFtZXNfc2hvcnRbbW9udGhdO1xyXG5cdFx0cmV0dXJuIG1vbnRoTmFtZTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgc2hvcnQgZGVzY3JpcHRpb24gZm9yIG1vbnRoICovXHJcblx0cHVibGljIG1vbnRoTmFtZShtb250aDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdGlmICghbW9udGgpIHJldHVybiAnJztcclxuXHRcdHZhciBtb250aF9uYW1lc19zaG9ydCA9IFsnJywgJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG92ZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcclxuXHRcdHZhciBtb250aE5hbWUgPSBtb250aF9uYW1lc19zaG9ydFttb250aF07XHJcblx0XHRyZXR1cm4gbW9udGhOYW1lO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBzaG9ydCBkZXNjcmlwdGlvbiBmb3IgbW9udGggKi9cclxuXHRwdWJsaWMgZGF5T2ZXZWVrKGRhdGU6IERhdGUsIG9wdGlvbj86IFwiU2hvcnRcIiB8IFwiTG9uZ1wiKTogc3RyaW5nIHtcclxuXHRcdGlmICghZGF0ZSkgcmV0dXJuICcnO1xyXG5cdFx0dmFyIGRheV9uYW1lc19zaG9ydCA9IFsnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXRlJywgJ1NhdHVyZGF5J107XHJcblx0XHR2YXIgZGF5X25hbWVzX2xvbmcgPSBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddO1xyXG5cdFx0aWYgKG9wdGlvbiA9PSBcIlNob3J0XCIpIHtcclxuXHRcdFx0cmV0dXJuIGRheV9uYW1lc19zaG9ydFtkYXRlLmdldERheSgpXVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGRheV9uYW1lc19sb25nW2RhdGUuZ2V0RGF5KCldXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgY2xhcmlvblRpbWUoZGF0ZT86IERhdGUpOiBudW1iZXIge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHZhciBtbXRNaWRuaWdodCA9IG1vbWVudChkYXRlKS5zdGFydE9mKCdkYXknKTtcclxuXHRcdHZhciBzZWNvbmRzID0gbW9tZW50KGRhdGUpLmRpZmYobW10TWlkbmlnaHQsICdzZWNvbmRzJykgKiAxMDA7XHJcblx0XHRyZXR1cm4gc2Vjb25kc1xyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIHRpbWUgKi9cclxuXHRwdWJsaWMgY2xhcmlvblRpbWVUb0RhdGUoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghY2xhcmlvbkRhdGUpIHJldHVybiBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChuZXcgRGF0ZShcIkRlY2VtYmVyIDI4LCAxODAwXCIpKS5hZGQoY2xhcmlvbkRhdGUgLyAxMDAsICdzZWNvbmRzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoREQvTU0vWVlZWSkgKi9cclxuXHRwdWJsaWMgZGlmZkRheXMoZnJvbURhdGU6IERhdGUsIHRvRGF0ZT86IERhdGUpOiBudW1iZXIge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBkYXRlID0gbW9tZW50KHRvRGF0ZSk7XHJcblx0XHR2YXIgcmV0dXJuVmFsdWUgPSBkYXRlLmRpZmYoZnJvbURhdGUsIFwiZGF5c1wiKTtcclxuXHRcdHJldHVybiBpc05hTihyZXR1cm5WYWx1ZSkgPyBudWxsIDogcmV0dXJuVmFsdWU7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqIGdldCB0aGUgZGF5cyBkaWZmZXJlbnQgaW4gd29yZHMgKi9cclxuXHRwdWJsaWMgZGlmZkRheXNXb3JkcyhkYXRlOiBEYXRlKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoIWRhdGUpIHJldHVybiAnJztcclxuXHRcdHZhciBkYXlzID0gbWUuZGlmZkRheXMoZGF0ZSk7XHJcblx0XHRzd2l0Y2ggKGRheXMpIHtcclxuXHRcdFx0Y2FzZSBudWxsOlxyXG5cdFx0XHRcdHJldHVybiAnJztcclxuXHRcdFx0Y2FzZSAtMTpcclxuXHRcdFx0XHRyZXR1cm4gJ3RvbW9ycm93JztcclxuXHRcdFx0Y2FzZSAwOlxyXG5cdFx0XHRcdHJldHVybiBkdC50aW1lVG9TdHIoZGF0ZSk7XHJcblx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRyZXR1cm4gJ3llc3RlcmRheSc7XHJcblx0XHRcdGNhc2UgMjpcclxuXHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRjYXNlIDQ6XHJcblx0XHRcdGNhc2UgNTpcclxuXHRcdFx0Y2FzZSA2OlxyXG5cdFx0XHRcdHJldHVybiBkdC5kYXlPZldlZWsoZGF0ZSk7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIGR0LmRhdGVUb1N0cihkYXRlLCBcIkQgTU1NTSBZWVlZXCIpXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogRXh0cmEgZnVuY3Rpb25zIHVzZWQgd2l0aCB2aWV3cyAqL1xyXG5leHBvcnQgY2xhc3MgVmlld0V4dCB7XHJcblxyXG5cdC8qKiByZW1vdmUgdGhlIGZvY3VzIGZyb20gYSB2aWV3IG9iamVjdCAqL1xyXG5cdHB1YmxpYyBjbGVhckFuZERpc21pc3Modmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHR0aGlzLmRpc21pc3NTb2Z0SW5wdXQodmlldyk7XHJcblx0XHR0aGlzLmNsZWFyRm9jdXModmlldyk7XHJcblx0fVxyXG5cclxuXHQvKiogcmVtb3ZlIHRoZSBmb2N1cyBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgY2xlYXJGb2N1cyh2aWV3OiB2aWV3LlZpZXdCYXNlKSB7XHJcblx0XHRpZiAoIXZpZXcpIHJldHVybjtcclxuXHRcdGlmIChpc0FuZHJvaWQpIGlmICh2aWV3LmFuZHJvaWQpIHZpZXcuYW5kcm9pZC5jbGVhckZvY3VzKCk7XHJcblx0fVxyXG5cclxuXHQvKiogaGlkZSB0aGUgc29mdCBrZXlib2FyZCBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgZGlzbWlzc1NvZnRJbnB1dCh2aWV3OiB2aWV3LlZpZXdCYXNlKSB7XHJcblx0XHRpZiAoIXZpZXcpIHJldHVybjtcclxuXHRcdHRyeSB7XHJcblx0XHRcdCg8YW55PnZpZXcpLmRpc21pc3NTb2Z0SW5wdXQoKTtcclxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVmFsdWVJdGVtIHtcclxuXHRWYWx1ZU1lbWJlcjogYW55O1xyXG5cdERpc3BsYXlNZW1iZXI6IHN0cmluZztcclxufVxyXG5cclxuLyoqIGEgdmFsdWUgbGlzdCBhcnJheSAqL1xyXG5leHBvcnQgY2xhc3MgVmFsdWVMaXN0IHtcclxuXHJcblx0LyoqIHRoaXMgYXJyYXkgb2YgdmFsdWUgaXRlbXMgKi9cclxuXHRwcml2YXRlIGl0ZW1zOiBBcnJheTxJVmFsdWVJdGVtPjtcclxuXHJcblx0LyoqIHRoZSBudW1iZXIgb2YgaXRlbXMgKi9cclxuXHRnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aDsgfVxyXG5cclxuXHRjb25zdHJ1Y3RvcihhcnJheT86IEFycmF5PElWYWx1ZUl0ZW0+KSB7XHJcblx0XHRpZiAoYXJyYXkpIHRoaXMuaXRlbXMgPSBhcnJheTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtKGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW1Gcm9udChpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnVuc2hpZnQoaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBsaXN0IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHVibGljIGdldEl0ZW1zKCk6IEFycmF5PElWYWx1ZUl0ZW0+IHtcclxuXHRcdHJldHVybiB0aGlzLml0ZW1zO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBhbiBpdGVtIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdHJldHVybiB0aGlzLmdldFRleHQoaW5kZXgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgZGlzcGxheSB2YWx1ZSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VGV4dChpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtc1tpbmRleF0uRGlzcGxheU1lbWJlcjtcclxuXHR9XHJcblx0LyoqIGdldCBhbiBhcnJheSBvZiB0aGUgaXRlbXMgdGV4dCBmaWVsZCAgKi9cclxuXHRwdWJsaWMgZ2V0VGV4dEFycmF5KCk6IEFycmF5PGFueT4ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBtZS5pdGVtcy5tYXAoZnVuY3Rpb24gKHg6IElWYWx1ZUl0ZW0pIHsgcmV0dXJuIHguRGlzcGxheU1lbWJlcjsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyB2YWx1ZSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VmFsdWUoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLml0ZW1zLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLml0ZW1zW2luZGV4XS5WYWx1ZU1lbWJlcjtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGluZGV4IGJ5IGl0cyB2YWx1ZSwgdXNlIGRlZmF1bHQgaW5kZXggaWYgbm90IGZvdW5kIGVsc2UgcmV0dXJuIC0xICovXHJcblxyXG5cdHB1YmxpYyBnZXRJbmRleCh2YWx1ZTogYW55LCBkZWZhdWx0SW5kZXg/OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICh0aGlzLmdldFZhbHVlKGkpID09IHZhbHVlKSByZXR1cm4gaTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBkZWZhdWx0SW5kZXggPT0gbnVsbCA/IC0xIDogZGVmYXVsdEluZGV4O1xyXG5cdH1cclxufVxyXG5cclxuLyoqIGEgdmFsdWUgbGlzdCBhcnJheSAqL1xyXG5leHBvcnQgY2xhc3MgRGljdGlvbmFyeSB7XHJcblxyXG5cdC8qKiB0aGlzIGFycmF5IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHJpdmF0ZSBfaXRlbXMgPSBbXTtcclxuXHQvKiogZ2V0IHRoZSBsaXN0IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHVibGljIGdldCBpdGVtcygpIHsgcmV0dXJuIHRoaXMuX2l0ZW1zIH1cclxuXHQvKiogc2V0IHRoZSBsaXN0IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHVibGljIHNldCBpdGVtcyhhcnJheSkgeyB0aGlzLl9pdGVtcyA9IGFycmF5IH1cclxuXHJcblx0cHVibGljIHZhbHVlTWVtYmVyTmFtZSA9IFwiVmFsdWVNZW1iZXJcIjtcclxuXHRwdWJsaWMgZGlzcGxheU1lbWJlck5hbWUgPSBcIkRpc3BsYXlNZW1iZXJcIjtcclxuXHJcblx0LyoqIHRoZSBudW1iZXIgb2YgaXRlbXMgKi9cclxuXHRwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGg7IH1cclxuXHJcblx0Y29uc3RydWN0b3IoYXJyYXk/OiBBcnJheTxhbnk+LCB2YWx1ZU1lbWJlck5hbWU/OiBzdHJpbmcsIGRpc3BsYXlNZW1iZXJOYW1lPzogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmFkZEl0ZW1zKGFycmF5LCB2YWx1ZU1lbWJlck5hbWUsIGRpc3BsYXlNZW1iZXJOYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtKGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtcyhhcnJheTogQXJyYXk8YW55PiwgdmFsdWVNZW1iZXJOYW1lOiBzdHJpbmcsIGRpc3BsYXlNZW1iZXJOYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoYXJyYXkpIG1lLml0ZW1zID0gYXJyYXk7XHJcblx0XHRpZiAodmFsdWVNZW1iZXJOYW1lKSB0aGlzLnZhbHVlTWVtYmVyTmFtZSA9IHZhbHVlTWVtYmVyTmFtZTtcclxuXHRcdGlmIChkaXNwbGF5TWVtYmVyTmFtZSkgdGhpcy5kaXNwbGF5TWVtYmVyTmFtZSA9IGRpc3BsYXlNZW1iZXJOYW1lO1xyXG5cdH1cclxuXHJcblx0LyoqIGFkZCBhIG5ldyBpdGVtIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbUZyb250KGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgYWRkSXRlbSA9IHt9O1xyXG5cdFx0YWRkSXRlbVttZS52YWx1ZU1lbWJlck5hbWVdID0gaXRlbS5WYWx1ZU1lbWJlcjtcclxuXHRcdGFkZEl0ZW1bbWUuZGlzcGxheU1lbWJlck5hbWVdID0gaXRlbS5EaXNwbGF5TWVtYmVyO1xyXG5cdFx0dGhpcy5pdGVtcy51bnNoaWZ0KGFkZEl0ZW0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKiBnZXQgYW4gaXRlbSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0SXRlbShpbmRleDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUZXh0KGluZGV4KTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGRpc3BsYXkgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFRleHQoaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBtZS5pdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWUuaXRlbXNbaW5kZXhdW21lLmRpc3BsYXlNZW1iZXJOYW1lXTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYW4gYXJyYXkgb2YgdGhlIGl0ZW1zIGRpc3BsYXkgbWVtYmVycyAgKi9cclxuXHRwdWJsaWMgZ2V0VGV4dEFycmF5KCk6IEFycmF5PGFueT4ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBtZS5pdGVtcy5tYXAoZnVuY3Rpb24gKHg6IElWYWx1ZUl0ZW0pIHsgcmV0dXJuIHhbbWUuZGlzcGxheU1lbWJlck5hbWVdOyB9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIHZhbHVlTWVtYmVyIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRWYWx1ZShpbmRleDogbnVtYmVyKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFtZS5pdGVtcyB8fCBtZS5pdGVtcy5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XHJcblx0XHRpZiAoaW5kZXggPT0gdW5kZWZpbmVkIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+PSBtZS5pdGVtcy5sZW5ndGgpIHJldHVybiBudWxsO1xyXG5cdFx0cmV0dXJuIG1lLml0ZW1zW2luZGV4XVttZS52YWx1ZU1lbWJlck5hbWVdO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgaW5kZXggYnkgaXRzIHZhbHVlTWVtZWJlciwgdXNlIGRlZmF1bHQgaW5kZXggaWYgbm90IGZvdW5kIGVsc2UgcmV0dXJuIC0xICovXHJcblx0cHVibGljIGdldEluZGV4KHZhbHVlOiBhbnksIGRlZmF1bHRJbmRleD86IG51bWJlcik6IG51bWJlciB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChtZS5nZXRWYWx1ZShpKSA9PSB2YWx1ZSkgcmV0dXJuIGk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGVmYXVsdEluZGV4ID09IG51bGwgPyAtMSA6IGRlZmF1bHRJbmRleDtcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vKiogRmlsZSBhY2Nlc3MgZnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBGaWxlIHtcclxuXHJcblx0cHVibGljIGRvY3VtZW50Rm9sZGVyID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XHJcblxyXG5cdHB1YmxpYyB0ZW1wRm9sZGVyID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMudGVtcCgpO1xyXG5cclxuXHRwdWJsaWMgZG93bmxvYWRGb2xkZXIgPSBpc0FuZHJvaWQgPyBhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZVB1YmxpY0RpcmVjdG9yeShhbmRyb2lkLm9zLkVudmlyb25tZW50LkRJUkVDVE9SWV9ET1dOTE9BRFMpLmdldEFic29sdXRlUGF0aCgpIDogJyc7XHJcblxyXG5cclxuXHQvKiogbG9hZCBqc29uIGZyb20gYSBmaWxlICovXHJcblx0cHVibGljIGV4aXN0cyhmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG1lLmRvY3VtZW50Rm9sZGVyLmNvbnRhaW5zKGZpbGVuYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKiBzYXZlIGpzb24gdG8gYSBmaWxlICovXHJcblx0cHVibGljIHNhdmVGaWxlKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGEpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHR2YXIgZmlsZSA9IG1lLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0XHRmaWxlLndyaXRlU3luYyhkYXRhLCBmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKiogbG9hZCBqc29uIGZyb20gYSBmaWxlICovXHJcblx0cHVibGljIGxvYWRKU09ORmlsZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS5yZWFkVGV4dCgpLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdFx0XHR2YXIgcmV0dXJuVmFsdWUgPSBudWxsO1xyXG5cdFx0XHRcdGlmIChjb250ZW50ICE9IFwiXCIpIHJldHVyblZhbHVlID0gSlNPTi5wYXJzZShjb250ZW50KTtcclxuXHRcdFx0XHRyZXNvbHZlKHJldHVyblZhbHVlKTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHNhdmUganNvbiB0byBhIGZpbGUgKi9cclxuXHRwdWJsaWMgc2F2ZUpTT05GaWxlKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGEpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHR2YXIgZmlsZSA9IG1lLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0XHRmaWxlLndyaXRlVGV4dChKU09OLnN0cmluZ2lmeShkYXRhKSkudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xyXG5cdFx0XHRcdHJlc29sdmUoY29udGVudCk7XHJcblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vKiogZW1wdHkgdGhlIGZpbGUgKi9cclxuXHRwdWJsaWMgY2xlYXJKU09ORmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgZmlsZSA9IHRoaXMuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRmaWxlLndyaXRlVGV4dChKU09OLnN0cmluZ2lmeSh7fSkpO1xyXG5cdH1cclxuXHJcblx0Ly8qKiBjcmVhdGUgYSBmdWxsIGZpbGVuYW1lIGluY2x1ZGluZyB0aGUgZm9sZGVyIGZvciB0aGUgY3VycmVudCBhcHAgKi9cclxuXHRwdWJsaWMgZ2V0RnVsbEZpbGVuYW1lKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5wYXRoLmpvaW4obWUuZG9jdW1lbnRGb2xkZXIucGF0aCwgZmlsZW5hbWUpO1xyXG5cdH1cclxuXHQvLyoqIGNyZWF0ZSBhIGZ1bGwgZmlsZW5hbWUgaW5jbHVkaW5nIHRoZSB0ZW1wIGZvbGRlciBmb3IgdGhlIGN1cnJlbnQgYXBwICovXHJcblx0cHVibGljIGdldEZ1bGxUZW1wRmlsZW5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBmaWxlU3lzdGVtTW9kdWxlLnBhdGguam9pbihtZS50ZW1wRm9sZGVyLnBhdGgsIGZpbGVuYW1lKTtcclxuXHR9XHJcblx0Ly8gcHVibGljIGRlbGV0ZUZpbGUocGFydHk6IHN0cmluZykge1xyXG5cdC8vIFx0dmFyIGZpbGUgPSBmaWxlU3lzdGVtTW9kdWxlLmtub3duRm9sZGVycy5kb2N1bWVudHMoKS5nZXRGaWxlKHBhcnR5KTtcclxuXHQvLyBcdGZpbGUuXHJcblx0Ly8gfVxyXG5cclxuXHJcblx0cHVibGljIGRvd25sb2FkVXJsKHVybCwgZmlsZVBhdGgpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cclxuXHRcdFx0aHR0cC5nZXRGaWxlKHVybCwgZmlsZVBhdGgpLnRoZW4oZnVuY3Rpb24gKHIpIHtcclxuXHRcdFx0XHR2YXIgZGF0YSA9IHIucmVhZFN5bmMoKTtcclxuXHRcdFx0XHRjYWxsLm9wZW5GaWxlKGZpbGVQYXRoKTtcclxuXHRcdFx0fSkudGhlbihmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdHZhciBlcnIgPSBuZXcgRXJyb3IoXCJFcnJvciBkb3dubG9hZGluZyAnXCIgKyBmaWxlUGF0aCArIFwiJy4gXCIgKyBlLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKGVyci5tZXNzYWdlKTtcclxuXHRcdFx0XHRhbGVydChlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEljb21wb3NlRW1haWwge1xyXG5cdHRvOiBzdHJpbmc7XHJcblx0c3ViamVjdD86IHN0cmluZztcclxuXHRib2R5Pzogc3RyaW5nO1xyXG5cdHNhbHV0YXRpb24/OiBzdHJpbmc7XHJcblx0ZGVhcj86IHN0cmluZztcclxuXHRyZWdhcmRzPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogY2FsbCB0aGlyZHBhcnR5IGFwcHMgKi9cclxuZXhwb3J0IGNsYXNzIENhbGwge1xyXG5cclxuXHQvKiogY29tcG9zZSBhbiBlbWFpbCAqL1xyXG5cdHB1YmxpYyBjb21wb3NlRW1haWwobWVzc2FnZTogSWNvbXBvc2VFbWFpbCkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBzdWJqZWN0ID0gKG1lc3NhZ2Uuc3ViamVjdCB8fCBcIlN1cHBvcnRcIik7XHJcblx0XHRpZiAoIW1lc3NhZ2UuYm9keSkge1xyXG5cdFx0XHRtZXNzYWdlLmJvZHkgPSAobWVzc2FnZS5zYWx1dGF0aW9uIHx8IChtZXNzYWdlLmRlYXIgPyBcIkRlYXIgXCIgKyBtZXNzYWdlLmRlYXIgOiBudWxsKSB8fCBcIkRlYXIgTWFkYW0vU2lyXCIpO1xyXG5cdFx0XHRpZiAobWVzc2FnZS5yZWdhcmRzKSBtZXNzYWdlLmJvZHkgKz0gXCI8QlI+PEJSPjxCUj5SZWdhcmRzPEJSPlwiICsgbWVzc2FnZS5yZWdhcmRzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVtYWlsLmF2YWlsYWJsZSgpLnRoZW4oZnVuY3Rpb24gKGF2YWlsKSB7XHJcblx0XHRcdGlmIChhdmFpbCkge1xyXG5cdFx0XHRcdHJldHVybiBlbWFpbC5jb21wb3NlKHtcclxuXHRcdFx0XHRcdHRvOiBbbWVzc2FnZS50b10sXHJcblx0XHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0LFxyXG5cdFx0XHRcdFx0Ym9keTogbWVzc2FnZS5ib2R5LFxyXG5cdFx0XHRcdFx0YXBwUGlja2VyVGl0bGU6ICdDb21wb3NlIHdpdGguLicgLy8gZm9yIEFuZHJvaWQsIGRlZmF1bHQ6ICdPcGVuIHdpdGguLidcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVtYWlsIG5vdCBhdmFpbGFibGVcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIkVtYWlsIGNvbXBvc2VyIGNsb3NlZFwiKTtcclxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0fSk7O1xyXG5cdH1cclxuXHJcblx0LyoqIG1ha2UgYSBwaG9uZSBjYWxsICovXHJcblx0cHVibGljIHBob25lRGlhbChQaG9uZU5vOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRwaG9uZS5kaWFsKFBob25lTm8sIHRydWUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9wZW5GaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZmlsZW5hbWUgPSBmaWxlUGF0aC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aWYgKGFuZHJvaWQpIHtcclxuXHRcdFx0XHRpZiAoZmlsZW5hbWUuc3Vic3RyKDAsIDcpICE9IFwiZmlsZTovL1wiIHx8IGZpbGVuYW1lLnN1YnN0cigwLCAxMCkgIT0gXCJjb250ZW50Oi8vXCIpIGZpbGVuYW1lID0gXCJmaWxlOi8vXCIgKyBmaWxlbmFtZTtcclxuXHRcdFx0XHRpZiAoYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OLlNES19JTlQgPiBhbmRyb2lkLm9zLkJ1aWxkLlZFUlNJT05fQ09ERVMuTSkgZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKFwiZmlsZTovL1wiLCBcImNvbnRlbnQ6Ly9cIik7XHJcblxyXG5cdFx0XHRcdHZhciB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoZmlsZW5hbWUudHJpbSgpKTtcclxuXHRcdFx0XHR2YXIgdHlwZSA9IFwiYXBwbGljYXRpb24vXCIgKyAoKGV4cG9ydHMuc3RyLmluTGlzdChmaWxlbmFtZS5zbGljZSgtNCksIFsnLnBkZicsICcuZG9jJywgJy54bWwnXSkpID8gZmlsZW5hbWUuc2xpY2UoLTMpIDogXCIqXCIpO1xyXG5cclxuXHRcdFx0XHQvL0NyZWF0ZSBpbnRlbnRcclxuXHRcdFx0XHR2YXIgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fVklFVyk7XHJcblx0XHRcdFx0aW50ZW50LnNldERhdGFBbmRUeXBlKHVyaSwgdHlwZSk7XHJcblx0XHRcdFx0aW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XHJcblx0XHRcdFx0YXBwbGljYXRpb24uYW5kcm9pZC5jdXJyZW50Q29udGV4dC5zdGFydEFjdGl2aXR5KGludGVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0aW9zLm9wZW5GaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRhbGVydCgnQ2Fubm90IG9wZW4gZmlsZSAnICsgZmlsZW5hbWUgKyAnLiAnICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcblxyXG4vKiogRXh0ZW5kaW5nIE5hdGl2ZXNjcmlwdCBBdXRvY29tcGxldGUgKi9cclxuZXhwb3J0IGNsYXNzIFRva2VuSXRlbSBleHRlbmRzIGF1dG9jb21wbGV0ZU1vZHVsZS5Ub2tlbk1vZGVsIHtcclxuXHR2YWx1ZTogbnVtYmVyO1xyXG5cdGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgdmFsdWU6IG51bWJlciwgaW1hZ2U/OiBzdHJpbmcpIHtcclxuXHRcdHN1cGVyKHRleHQsIGltYWdlIHx8IG51bGwpO1xyXG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xyXG5cdH1cclxuXHJcbn07XHJcblxyXG5leHBvcnQgdmFyIHRhZ2dpbmcgPSBuZXcgVGFnZ2luZygpO1xyXG5leHBvcnQgdmFyIHN0ciA9IG5ldyBTdHIoKTtcclxuZXhwb3J0IHZhciBzcWwgPSBuZXcgU3FsKCk7XHJcbmV4cG9ydCB2YXIgZHQgPSBuZXcgRHQoKTtcclxuZXhwb3J0IHZhciB2aWV3RXh0ID0gbmV3IFZpZXdFeHQoKTtcclxuZXhwb3J0IHZhciBmaWxlID0gbmV3IEZpbGUoKTtcclxuZXhwb3J0IHZhciBjYWxsID0gbmV3IENhbGwoKTtcclxuZXhwb3J0IHZhciB1dGlscyA9IG5ldyBVdGlscygpO1xyXG4iXX0=