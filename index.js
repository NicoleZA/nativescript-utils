"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var application = require("application");
var moment = require("moment");
var observableModule = require("data/observable");
var fileSystemModule = require("file-system");
var CryptoJS = require("crypto-js");
var frame_1 = require("ui/frame");
var buffer_1 = require("buffer");
var phone = require("nativescript-phone");
var email = require("nativescript-email");
var http = require("tns-core-modules/http");
//import * as autocompleteModule from 'nativescript-telerik-ui-pro/autocomplete';
var observable_array_1 = require("data/observable-array");
var platform_1 = require("platform");
var utils_1 = require("utils/utils");
//Miscellanious Functions
var Utils = /** @class */ (function () {
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
var Tagging = /** @class */ (function () {
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
var Sql = /** @class */ (function () {
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
var Str = /** @class */ (function () {
    function Str() {
    }
    Str.prototype.capitalise = function (value) {
        var returnValue = value.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        return returnValue;
    };
    /**
     * HmacSHA256
     */
    Str.prototype.HmacSHA256 = function (message, secret) {
        var result = CryptoJS.HmacSHA256(message, secret).toString().toUpperCase();
        return result;
    };
    /**
     * stringToByte
     */
    Str.prototype.stringToByte = function (string) {
        var bytes = []; // char codes
        var bytesv2 = []; // char codes
        for (var i = 0; i < string.length; ++i) {
            var code = string.charCodeAt(i);
            bytes = bytes.concat([code]);
            bytesv2 = bytesv2.concat([code & 0xff, code / 256 >>> 0]);
        }
        return bytes;
    };
    Str.prototype.base64EncodeString = function (string) {
        var result = new buffer_1.Buffer(string).toString('base64');
        return result;
    };
    Str.prototype.bufferByteLength = function (data) {
        return buffer_1.Buffer.byteLength(data);
    };
    Str.prototype.base64Encode = function (bytes) {
        try {
            if (platform_1.isAndroid) {
                return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP);
            }
            else if (platform_1.isIOS) {
                return bytes.base64EncodedStringWithOptions(0);
            }
        }
        catch (error) {
            throw (error);
        }
    };
    Str.prototype.base64Decode = function (string) {
        if (platform_1.isAndroid) {
            return android.util.Base64.decode(string, android.util.Base64.DEFAULT);
        }
        else if (platform_1.isIOS) {
            return NSData.alloc().initWithBase64Encoding(string);
            ;
        }
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
            if (field == searchValue)
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
        return observableModule.fromObject(obj || {});
    };
    /** Create observableed row fields as Observables objects to parent as tablename_fieldname  */
    Str.prototype.objToObservable = function (me, obj, prefix) {
        if (!me || !obj)
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
var Dt = /** @class */ (function () {
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
    Dt.prototype.Duration = function (seconds) {
        var me = this;
        var seconds = Math.floor(seconds);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds - (hours * 3600)) / 60);
        var seconds = seconds - (hours * 3600) - (minutes * 60);
        var hoursStr = (hours < 10 ? '0' : '') + hours.toString();
        var minutesStr = (minutes < 10 ? '0' : '') + minutes.toString();
        var secondsStr = (seconds < 10 ? '0' : '') + seconds.toString();
        return (hours ? hoursStr + ':' : '') + minutesStr + ':' + secondsStr;
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
        var d = date || new Date();
        switch (format) {
            case "D MMMM YYYY":
                return d.getDate() + ' ' + me.monthName(d.getMonth() + 1) + ' ' + d.getFullYear();
            case "D MMM YYYY hh:mm":
                return d.getDate() + ' ' + me.monthShortName(d.getMonth() + 1) + ' ' + d.getFullYear() + ' ' + moment(d).format('hh:mm A');
            case "D MMM YYYY":
                return d.getDate() + ' ' + me.monthShortName(d.getMonth() + 1) + ' ' + d.getFullYear();
            default:
                return moment(d).format(format || 'DD/MM/YYYY');
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
var ViewExt = /** @class */ (function () {
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
var ValueList = /** @class */ (function () {
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
var Dictionary = /** @class */ (function () {
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
var File = /** @class */ (function () {
    function File() {
        this.documentFolder = fileSystemModule.knownFolders.documents();
        this.tempFolder = fileSystemModule.knownFolders.temp();
        this.downloadFolder = platform_1.isAndroid ? android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() : '';
    }
    /** get an application folder */
    File.prototype.getAppFolder = function (folder) {
        return fileSystemModule.knownFolders.currentApp().getFolder(folder);
    };
    ;
    /** get an application folder */
    File.prototype.getAppFolderPath = function (folder) {
        return fileSystemModule.knownFolders.currentApp().getFolder(folder).path;
    };
    ;
    /** get an application full filename */
    File.prototype.getAppFilename = function (filename, folder) {
        return fileSystemModule.knownFolders.currentApp().getFolder(folder).path + '/' + filename;
    };
    ;
    /** get an application full filename */
    File.prototype.getAppFileExists = function (filename, folder) {
        return fileSystemModule.knownFolders.currentApp().getFolder(folder).contains(filename);
    };
    ;
    /** return an application file */
    File.prototype.getAppFile = function (filename, folder) {
        return fileSystemModule.knownFolders.currentApp().getFolder(folder).getFile(filename);
    };
    ;
    /** extract file from path */
    File.prototype.getFilename = function (path) {
        if (!path)
            return '';
        if (path.indexOf("/") == -1)
            return path;
        return path.split("/").pop();
    };
    ;
    /** check if media file exists */
    File.prototype.mediaFileExists = function (filename) {
        var me = this;
        filename = me.getFilename(filename);
        return me.getAppFileExists(filename, "media");
    };
    /** get a media file object */
    File.prototype.mediaGetFile = function (filename) {
        var me = this;
        filename = me.getFilename(filename);
        return exports.file.getAppFolder("media").getFile(filename);
    };
    /** get fullname for media file */
    File.prototype.mediaGetFullName = function (filename) {
        var me = this;
        filename = me.getFilename(filename);
        return me.getAppFolderPath("media") + ("/" + filename);
    };
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
            http.getFile(url, filePath).then(function () {
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
var Call = /** @class */ (function () {
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
    /** start the contacts app */
    Call.prototype.showContacts = function () {
        var me = this;
        try {
            if (android) {
                var uri = android.provider.ContactsContract.Contacts.CONTENT_URI;
                var type = android.provider.ContactsContract.CommonDataKinds.Phone.CONTENT_TYPE;
                var intent = new android.content.Intent(android.content.Intent.ACTION_DEFAULT, uri);
                application.android.currentContext.startActivity(intent);
            }
            else {
                //ios.(filename);
            }
        }
        catch (err) {
            alert("Cannot show contacts. " + err);
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
var Form = /** @class */ (function () {
    function Form() {
    }
    Object.defineProperty(Form.prototype, "currentPage", {
        get: function () {
            return frame_1.topmost().currentPage;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Form.prototype.showPage = function (pageName, context, folder) {
        if (this.currentPage.bindingContext)
            this.currentPage.bindingContext.childPage = pageName;
        var data = {
            moduleName: (folder || '') + pageName + '/' + pageName,
            context: context || {},
            animated: true,
            transition: { name: "slide", duration: 380, curve: "easeIn" },
            clearHistory: false,
            backstackVisible: true
        };
        frame_1.topmost().navigate(data);
    };
    Form.prototype.device = function () {
        if (platform_1.isAndroid)
            return "android";
        if (platform_1.isIOS)
            return "ios";
        return "";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUEyQztBQUMzQywrQkFBaUM7QUFFakMsa0RBQW9EO0FBQ3BELDhDQUFnRDtBQUNoRCxvQ0FBc0M7QUFFdEMsa0NBQW1DO0FBRW5DLGlDQUFnQztBQUVoQywwQ0FBNEM7QUFDNUMsMENBQTRDO0FBQzVDLDRDQUE4QztBQUM5QyxpRkFBaUY7QUFFakYsMERBQXdEO0FBQ3hELHFDQUE0QztBQUM1QyxxQ0FBaUM7QUFNakMseUJBQXlCO0FBQ3pCO0lBQUE7SUFvREEsQ0FBQztJQWxEQSx5REFBeUQ7SUFDbEQsc0NBQXNCLEdBQTdCLFVBQWlDLE9BQXNCLEVBQUUsSUFBUztRQUNqRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzdCLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFckQsR0FBRyxDQUFDLENBQUMsSUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzFCLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMzQixDQUFDO29CQUNELElBQUksQ0FBQyxDQUFDO3dCQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFD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QUUsVUFBb0I7UUFDM0QsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07WUFDM0MsZUFBTyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFVBQVUsSUFBSTtnQkFDM0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0YsV0FBQztBQUFELENBQUMsQUF2Q0QsSUF1Q0M7QUF2Q1ksb0JBQUk7QUF5Q04sUUFBQSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixRQUFBLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFFBQUEsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFBLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2QsUUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QixRQUFBLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2xCLFFBQUEsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsUUFBQSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gXCJhcHBsaWNhdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSBcIm1vbWVudFwiO1xyXG5pbXBvcnQgKiBhcyB2aWV3IGZyb20gXCJ1aS9jb3JlL3ZpZXdcIjtcclxuaW1wb3J0ICogYXMgb2JzZXJ2YWJsZU1vZHVsZSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlXCI7XHJcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW1Nb2R1bGUgZnJvbSBcImZpbGUtc3lzdGVtXCI7XHJcbmltcG9ydCAqIGFzIENyeXB0b0pTIGZyb20gXCJjcnlwdG8tanNcIjtcclxuXHJcbmltcG9ydCB7IHRvcG1vc3QgfSBmcm9tICd1aS9mcmFtZSc7XHJcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd1aS9wYWdlJztcclxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyJztcclxuXHJcbmltcG9ydCAqIGFzIHBob25lIGZyb20gXCJuYXRpdmVzY3JpcHQtcGhvbmVcIjtcclxuaW1wb3J0ICogYXMgZW1haWwgZnJvbSBcIm5hdGl2ZXNjcmlwdC1lbWFpbFwiO1xyXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2h0dHBcIjtcclxuLy9pbXBvcnQgKiBhcyBhdXRvY29tcGxldGVNb2R1bGUgZnJvbSAnbmF0aXZlc2NyaXB0LXRlbGVyaWstdWktcHJvL2F1dG9jb21wbGV0ZSc7XHJcblxyXG5pbXBvcnQgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlLWFycmF5XCI7XHJcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcclxuaW1wb3J0IHsgaW9zIH0gZnJvbSBcInV0aWxzL3V0aWxzXCJcclxuXHJcbmRlY2xhcmUgdmFyIGFuZHJvaWQ6IGFueTtcclxuZGVjbGFyZSB2YXIgamF2YTogYW55O1xyXG5kZWNsYXJlIHZhciBOU0RhdGE6IGFueTtcclxuXHJcbi8vTWlzY2VsbGFuaW91cyBGdW5jdGlvbnNcclxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcclxuXHJcblx0Ly9DcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IGZyb20gYW4gZXhpc3Rpbmcgb25lXHJcblx0cHVibGljIGNyZWF0ZUluc3RhbmNlRnJvbUpzb248VD4ob2JqVHlwZTogeyBuZXcoKTogVDsgfSwganNvbjogYW55KSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Y29uc3QgbmV3T2JqID0gbmV3IG9ialR5cGUoKTtcclxuXHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBvYmpUeXBlW1wicmVsYXRpb25zaGlwc1wiXSB8fCB7fTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4ganNvbikge1xyXG5cdFx0XHRpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG5cdFx0XHRcdGlmIChuZXdPYmpbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0aWYgKHJlbGF0aW9uc2hpcHNbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRuZXdPYmpbcHJvcF0gPSBqc29uW3Byb3BdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdG5ld09ialtwcm9wXSA9IG1lLmNyZWF0ZUluc3RhbmNlRnJvbUpzb24ocmVsYXRpb25zaGlwc1twcm9wXSwganNvbltwcm9wXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBQcm9wZXJ0eSAke3Byb3B9IG5vdCBzZXQgYmVjYXVzZSBpdCBhbHJlYWR5IGV4aXN0ZWQgb24gdGhlIG9iamVjdC5gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3T2JqO1xyXG5cdH1cclxuXHJcblx0Ly9hZGRzIG1pc3NpbmcgZnVuY3Rpb25zIHRvIG9iamVjdFxyXG5cdHB1YmxpYyBpbml0T2JqZWN0PFQ+KG9ialR5cGU6IHsgbmV3KCk6IFQ7IH0sIGpzb246IGFueSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGNvbnN0IG5ld09iaiA9IG5ldyBvYmpUeXBlKCk7XHJcblx0XHRjb25zdCByZWxhdGlvbnNoaXBzID0gb2JqVHlwZVtcInJlbGF0aW9uc2hpcHNcIl0gfHwge307XHJcblxyXG5cdFx0Zm9yIChjb25zdCBwcm9wIGluIG5ld09iaikge1xyXG5cdFx0XHRpZiAobmV3T2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKGBBZGQgJHtwcm9wfS5gKTtcclxuXHRcdFx0XHRpZiAoanNvbltwcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRpZiAocmVsYXRpb25zaGlwc1twcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGpzb25bcHJvcF0gPSBuZXdPYmpbcHJvcF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0anNvbltwcm9wXSA9IG1lLmNyZWF0ZUluc3RhbmNlRnJvbUpzb24ocmVsYXRpb25zaGlwc1twcm9wXSwgbmV3T2JqW3Byb3BdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFByb3BlcnR5ICR7cHJvcH0gbm90IHNldCBiZWNhdXNlIGl0IGFscmVhZHkgZXhpc3RlZCBvbiB0aGUgb2JqZWN0LmApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogVGFnZ2luZyBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFRhZ2dpbmcge1xyXG5cclxuXHQvKiogZGVmYXVsdCB0YWcgaWNvbiAqL1xyXG5cdHB1YmxpYyB0YWdJY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwNDYpO1xyXG5cdC8qKiBkZWZhdWx0IHVudGFnIGljb24gKi9cclxuXHRwdWJsaWMgdW5UYWdJY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwOTYpO1xyXG5cclxuXHQvKiogQ3JlYXRlIGEgbmV3IG9ic2VydmFibGUgdGFnIG9iamVjdFxyXG5cdCogSWYgaWNvbiBpcyBsZWZ0IGJsYW5rIHRoZSBkZWZhdWx0IGljb24gaXMgdXNlZCBcclxuXHQqL1xyXG5cdHB1YmxpYyBuZXdUYWcoaWNvbj86IHN0cmluZyk6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSB7XHJcblx0XHRpZiAoIWljb24pIGljb24gPSB0aGlzLnVuVGFnSWNvbjtcclxuXHRcdHZhciBhID0gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSgpO1xyXG5cdFx0YS5zZXQoXCJ2YWx1ZVwiLCBpY29uKTtcclxuXHRcdHJldHVybiBhO1xyXG5cdFx0Ly9cdFx0cmV0dXJuIG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoeyB2YWx1ZTogaWNvbiB9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBzZXQgYWxsIGFycmF5IG9iamVjdHMgdGFnIHByb3BlcnR5IHRvIHRoZSBkZWZhdWx0IHRhZ2dlZCBpY29uIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0YWdBbGwoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoIWFycmF5W2ldLnRhZykgYXJyYXlbaV0udGFnID0gdGFnZ2luZy5uZXdUYWcoKTtcclxuXHRcdFx0YXJyYXlbaV0udGFnLnNldChcInZhbHVlXCIsIHRhZ2dpbmcudGFnSWNvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cdC8qKiBzZXQgYWxsIGFycmF5IG9iamVjdHMgdGFnIHByb3BlcnR5IHRvIHRoZSBkZWZhdWx0IHVudGFnZ2VkIGljb24gb2JqZWN0ICovXHJcblx0cHVibGljIHVuVGFnQWxsKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICghYXJyYXlbaV0udGFnKSBhcnJheVtpXS50YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0XHRhcnJheVtpXS50YWcuc2V0KFwidmFsdWVcIiwgdGFnZ2luZy51blRhZ0ljb24pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHQvKiogZ2V0IHRoZSB0b2dnbGVkIHRhZyBpY29uICovXHJcblx0cHVibGljIHRvZ2dsZVRhZ0ljb24oaWNvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGlmIChpY29uID09IHRoaXMudGFnSWNvbikge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy51blRhZ0ljb247XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50YWdJY29uO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIFRvZ2dsZSB0YWcgb2JzZXJ2YWJsZSAqL1xyXG5cdHB1YmxpYyB0b2dnbGVUYWcodGFnOiBhbnkpOiBhbnkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghdGFnKSB0YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0dmFyIGljb24gPSB0YWdnaW5nLnRvZ2dsZVRhZ0ljb24odGFnLmdldChcInZhbHVlXCIpKTtcclxuXHRcdHRhZy5zZXQoXCJ2YWx1ZVwiLCBpY29uKTtcclxuXHRcdHJldHVybiB0YWc7XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRoZSByb3dzIHRhZyBwcm9wZXJ0eSAqL1xyXG5cdHB1YmxpYyB0b2dnbGVSb3cocm93OiBhbnkpOiBhbnkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghcm93KSByZXR1cm4gbnVsbDtcclxuXHRcdG1lLnRvZ2dsZVRhZyhyb3cudGFnKTtcclxuXHRcdHJldHVybiByb3c7XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRoZSBvYnNlcnZhYmxlIHRhZyBvYmplY3QgKi9cclxuXHRwdWJsaWMgdG9nZ2xlT2JzZXJ2YWJsZShvYmVydmFibGVUYWc6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSk6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5uZXdUYWcodGhpcy50b2dnbGVUYWdJY29uKG9iZXJ2YWJsZVRhZy5nZXQoXCJ2YWx1ZVwiKSkpO1xyXG5cdH1cclxuXHQvKiogVG9nZ2xlIHRoZSBvYnNlcnZhYmxlIHJvd3MgdGFnIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0b2dnbGVPYnNlcnZhYmxlUm93KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55PiwgaW5kZXg6IG51bWJlcik6IE9ic2VydmFibGVBcnJheTxhbnk+IHtcclxuXHRcdHZhciByb3cgPSB0aGlzLnRvZ2dsZVJvdyhhcnJheS5nZXRJdGVtKGluZGV4KSk7XHJcblx0XHRhcnJheS5zZXRJdGVtKGluZGV4LCByb3cpO1xyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGNvdW50KGFycmF5OiBhbnlbXSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gMDtcclxuXHRcdHJldHVybiBhcnJheS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiBnZXQgbnVtYmVyIG9mIHRhZ2dlZCBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnRUYWdnZWQoYXJyYXk6IGFueVtdKTogbnVtYmVyIHtcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiAwO1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGFnZ2VkUm93cyhhcnJheSkubGVuZ3RoO1xyXG5cdH1cclxuXHQvKiogZ2V0IG51bWJlciBvZiB1bnRhZ2dlZCBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnRVbnRhZ2dlZChhcnJheTogYW55W10pOiBudW1iZXIge1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIDA7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUYWdnZWRSb3dzKGFycmF5KS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiByZXR1cm4gdGhlIHRhZ2dlZCByb3dzIGZyb20gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGdldFRhZ2dlZFJvd3MoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiBudWxsO1xyXG5cdFx0dmFyIHRhZ2dlZFJvd3MgPSBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4LnRhZyAmJiB4LnRhZy5nZXQoXCJ2YWx1ZVwiKSA9PSBtZS50YWdJY29uKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRhZ2dlZFJvd3M7XHJcblx0fVxyXG5cdC8qKiByZXR1cm4gdGhlIHVudGFnZ2VkIHJvd3MgZnJvbSB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgZ2V0VW5UYWdnZWRSb3dzKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgdGFnZ2VkUm93cyA9IGFycmF5LmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cdFx0XHRyZXR1cm4gKHgudGFnICYmIHgudGFnLmdldChcInZhbHVlXCIpID09IG1lLnVuVGFnSWNvbik7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiB0YWdnZWRSb3dzO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogU3FsIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgU3FsIHtcclxuXHQvL290aGVyXHJcblx0LyoqIHJldHVybiBhIHNxbCBzbmlwcGVkIHRvIGZldGNoIGEgY2xhcmlvbiBkYXRlIGZyb20gdGhlIGRhdGFiYXNlIGFzIGEgc3RhbmRhcmQgZGF0ZSovXHJcblx0cHVibGljIGRhdGUoZmllbGQpIHtcclxuXHRcdHJldHVybiBgY29udmVydCh2YXJjaGFyLGNvbnZlcnQoZGF0ZXRpbWUsJHtmaWVsZH0tMzYxNjMpLDEwMylgO1xyXG5cdH1cclxufVxyXG5cclxuLyoqIFN0cmluZyBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFN0ciB7XHJcblxyXG5cdHB1YmxpYyBjYXBpdGFsaXNlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFx3XFxTKi9nLCBmdW5jdGlvbiAodHh0KSB7IHJldHVybiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7IH0pO1xyXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSG1hY1NIQTI1NlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBIbWFjU0hBMjU2KG1lc3NhZ2U6IHN0cmluZywgc2VjcmV0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0dmFyIHJlc3VsdCA9IENyeXB0b0pTLkhtYWNTSEEyNTYobWVzc2FnZSwgc2VjcmV0KS50b1N0cmluZygpLnRvVXBwZXJDYXNlKCk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogc3RyaW5nVG9CeXRlXHJcblx0ICovXHJcblx0cHVibGljIHN0cmluZ1RvQnl0ZShzdHJpbmcpOiBhbnlbXSB7XHJcblx0XHR2YXIgYnl0ZXMgPSBbXTsgLy8gY2hhciBjb2Rlc1xyXG5cdFx0dmFyIGJ5dGVzdjIgPSBbXTsgLy8gY2hhciBjb2Rlc1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHZhciBjb2RlID0gc3RyaW5nLmNoYXJDb2RlQXQoaSk7XHJcblxyXG5cdFx0XHRieXRlcyA9IGJ5dGVzLmNvbmNhdChbY29kZV0pO1xyXG5cclxuXHRcdFx0Ynl0ZXN2MiA9IGJ5dGVzdjIuY29uY2F0KFtjb2RlICYgMHhmZiwgY29kZSAvIDI1NiA+Pj4gMF0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGJ5dGVzO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGJhc2U2NEVuY29kZVN0cmluZyhzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IEJ1ZmZlcihzdHJpbmcpLnRvU3RyaW5nKCdiYXNlNjQnKTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYnVmZmVyQnl0ZUxlbmd0aChkYXRhKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBCdWZmZXIuYnl0ZUxlbmd0aChkYXRhKTtcclxuXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYmFzZTY0RW5jb2RlKGJ5dGVzOiBhbnkpOiBzdHJpbmcge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aWYgKGlzQW5kcm9pZCkge1xyXG5cdFx0XHRcdHJldHVybiBhbmRyb2lkLnV0aWwuQmFzZTY0LmVuY29kZVRvU3RyaW5nKGJ5dGVzLCBhbmRyb2lkLnV0aWwuQmFzZTY0Lk5PX1dSQVApO1xyXG5cdFx0XHR9IGVsc2UgaWYgKGlzSU9TKSB7XHJcblx0XHRcdFx0cmV0dXJuIGJ5dGVzLmJhc2U2NEVuY29kZWRTdHJpbmdXaXRoT3B0aW9ucygwKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0dGhyb3cgKGVycm9yKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBiYXNlNjREZWNvZGUoc3RyaW5nOiBzdHJpbmcpOiBhbnkge1xyXG5cdFx0aWYgKGlzQW5kcm9pZCkge1xyXG5cdFx0XHRyZXR1cm4gYW5kcm9pZC51dGlsLkJhc2U2NC5kZWNvZGUoc3RyaW5nLCBhbmRyb2lkLnV0aWwuQmFzZTY0LkRFRkFVTFQpO1xyXG5cdFx0fSBlbHNlIGlmIChpc0lPUykge1xyXG5cdFx0XHRyZXR1cm4gTlNEYXRhLmFsbG9jKCkuaW5pdFdpdGhCYXNlNjRFbmNvZGluZyhzdHJpbmcpOztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gYSBVUkkgZW5jb2RlZCBzdHJpbmcgKi9cclxuXHRwdWJsaWMgZml4ZWRFbmNvZGVVUklDb21wb25lbnQodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpLnJlcGxhY2UoL1shJygpKl0vZywgZnVuY3Rpb24gKGMpIHtcclxuXHRcdFx0cmV0dXJuICclJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBvYnNlcnZhYmxlIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZChwcm9wZXJ0eSkgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZmlsdGVyQXJyYXkoZGF0YTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmcsIHNlYXJjaFRleHQ6IHN0cmluZykge1xyXG5cdFx0c2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKVxyXG5cdFx0dmFyIGZpbHRlcmVkRGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblx0XHRcdHJldHVybiAoeFtzZWFyY2hGaWVsZF0gJiYgeFtzZWFyY2hGaWVsZF0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQpID49IDApO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmV3IE9ic2VydmFibGVBcnJheShmaWx0ZXJlZERhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIG9ic2VydmFibGUgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkcyhwcm9wZXJ0aWVzKSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBmaWx0ZXJBcnJheUJ5QXJyYXkoZGF0YTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmdbXSwgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoRmllbGQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoeFtzZWFyY2hGaWVsZFtpXV0gJiYgeFtzZWFyY2hGaWVsZFtpXV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIG5ldyBPYnNlcnZhYmxlQXJyYXkoZmlsdGVyZWREYXRhKTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gdHJ1ZSBpZiB0ZSBzdHJpbmcgaXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGluTGlzdCh2YWx1ZTogc3RyaW5nLCBsaXN0QXJyYXk6IHN0cmluZ1tdKTogYm9vbGVhbiB7XHJcblx0XHRpZiAobGlzdEFycmF5LmluZGV4T2YodmFsdWUpID49IDApIHJldHVybiB0cnVlO1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiB0cnVlIGlmIGEgc3RyaW5nIGNvbnRhaW5zIGFueSBpdGVtIGluIHRoZSBzdWJzdHJpbmcgYXJyYXkpICovXHJcblx0cHVibGljIGNvbnRhaW5zQW55KHN0cjogc3RyaW5nLCBzdWJzdHJpbmdzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgIT0gc3Vic3RyaW5ncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoc3RyLmluZGV4T2Yoc3Vic3RyaW5nc1tpXSkgIT0gLSAxKSByZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKiBmaW5kIGluZGV4IGluIGFycmF5IG9mIG9iamVjdHMgKi9cclxuXHRwdWJsaWMgYXJyYXlJbmRleE9mKGFycmF5OiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVmFsdWU6IGFueSk6IG51bWJlciB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSAhPSBhcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHR2YXIgZmllbGQgPSBhcnJheVtpXVtzZWFyY2hGaWVsZF07XHJcblx0XHRcdGlmIChmaWVsZCA9PSBzZWFyY2hWYWx1ZSkgcmV0dXJuIGk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gLTE7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheUl0ZW1zKGFycmF5OiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVmFsdWU6IGFueSkge1xyXG5cdFx0cmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbiAob2JqKSB7XHJcblx0XHRcdHJldHVybiBvYmpbc2VhcmNoRmllbGRdID09IHNlYXJjaFZhbHVlO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZHMocHJvcGVydGllcykgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlJdGVtc0J5QXJyYXkoZGF0YTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmdbXSwgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRpZiAoIXNlYXJjaFRleHQpIHJldHVybiBkYXRhO1xyXG5cdFx0c2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKVxyXG5cdFx0dmFyIGZpbHRlcmVkRGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlYXJjaEZpZWxkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHhbc2VhcmNoRmllbGRbaV1dICYmIHhbc2VhcmNoRmllbGRbaV1dLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQpID49IDApIHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBmaWx0ZXJlZERhdGE7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBmaXJzdCBpdGVtIGZyb20gYW4gYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheUl0ZW0oYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRBcnJheUl0ZW1zKGFycmF5LCBzZWFyY2hGaWVsZCwgc2VhcmNoVmFsdWUpWzBdO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYW4gYXJyYXkgdG8gYW5kIG9ic2VydmFibGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgb2JzZXJ2YWJsZUFycmF5PFQ+KGFycmF5PzogQXJyYXk8YW55Pik6IE9ic2VydmFibGVBcnJheTxUPiB7XHJcblx0XHR2YXIgcmV0dXJuVmFsdWUgPSBuZXcgT2JzZXJ2YWJsZUFycmF5KGFycmF5KTtcclxuXHRcdHJldHVyblZhbHVlLnNwbGljZSgwKTtcclxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGFuIGFycmF5IHRvIGFuZCBvYnNlcnZhYmxlIGFycmF5ICovXHJcblx0cHVibGljIG9ic2VydmFibGU8VD4ob2JqPykge1xyXG5cdFx0cmV0dXJuIG9ic2VydmFibGVNb2R1bGUuZnJvbU9iamVjdChvYmogfHwge30pO1xyXG5cdH1cclxuXHJcblx0LyoqIENyZWF0ZSBvYnNlcnZhYmxlZWQgcm93IGZpZWxkcyBhcyBPYnNlcnZhYmxlcyBvYmplY3RzIHRvIHBhcmVudCBhcyB0YWJsZW5hbWVfZmllbGRuYW1lICAqL1xyXG5cdHB1YmxpYyBvYmpUb09ic2VydmFibGUobWU6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSwgb2JqOiBvYmplY3QsIHByZWZpeD86IHN0cmluZykge1xyXG5cdFx0aWYgKCFtZSB8fCAhb2JqKSByZXR1cm47XHJcblx0XHRPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG5cdFx0XHRtZS5zZXQoKHByZWZpeCB8fCAnJykgKyBcIl9cIiArIGtleSwgb2JqW2tleV0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKiogY2hlY2sgaWYgb2JqZWN0IGlzIGVtcHR5ICAqL1xyXG5cdHB1YmxpYyBpc0VtcHR5T2JqZWN0KG9iaikge1xyXG5cdFx0cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikubGVuZ3RoID09PSAwO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBhIGNvbHVtbiBhcnJheSBmcm9tIGFuIG9iamVjdCAgKi9cclxuXHRwdWJsaWMgZ2V0SXRlbUFycmF5RnJvbU9iamVjdChhcnJheTogQXJyYXk8YW55Piwgb2JqZWN0TmFtZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XHJcblx0XHRyZXR1cm4gYXJyYXkubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4W29iamVjdE5hbWVdOyB9KTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXBsYWNlcyBhbiBleGlzdGluZyBvYnNlcnZhYmxlQXJyYXlzIGRhdGEgd2l0aCBhIG5ldyBhcnJheSAgKi9cclxuXHRwdWJsaWMgcmVwbGFjZUFycmF5KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55Piwgd2l0aEFycmF5OiBhbnkpIHtcclxuXHRcdGFycmF5LnNwbGljZSgwKTtcclxuXHRcdHRoaXMuYXBwZW5kQXJyYXkoYXJyYXksIHdpdGhBcnJheSlcclxuXHR9XHJcblxyXG5cdC8qKiBhcHBlbmRzIGFuIGV4aXN0aW5nIG9ic2VydmFibGVBcnJheXMgZGF0YSB3aXRoIGEgbmV3IGFycmF5ICAqL1xyXG5cdHB1YmxpYyBhcHBlbmRBcnJheShhcnJheTogT2JzZXJ2YWJsZUFycmF5PGFueT4sIHdpdGhBcnJheTogYW55KSB7XHJcblx0XHQvL1x0b2JzZXJ2YWJsZSBhcnJheSBjYXVzZXMgcHJvYmxlbXMgaWYgdGhlIGFycmF5IGl0ZW0gaXMgbm90IGFuIG9ic2VydmFibGUuXHJcblx0XHQvLyAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHdpdGhBcnJheS5sZW5ndGg7IGluZGV4KyspIHtcclxuXHRcdC8vIFx0ICBhcnJheS5wdXNoKHdpdGhBcnJheVtpbmRleF0pO1xyXG5cdFx0Ly8gIH1cclxuXHRcdGlmICghd2l0aEFycmF5KSByZXR1cm47XHJcblx0XHRmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgd2l0aEFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xyXG5cdFx0XHR2YXIgcm93ID0gd2l0aEFycmF5W2luZGV4XTtcclxuXHRcdFx0dmFyIG9Sb3cgPSBuZXcgb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlKCk7XHJcblx0XHRcdE9iamVjdC5rZXlzKHJvdykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcblx0XHRcdFx0b1Jvdy5zZXQoa2V5LCByb3dba2V5XSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRhcnJheS5wdXNoKG9Sb3cpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIEVudW1Ub0FycmF5KEVudW1PYmopOiBzdHJpbmdbXSB7XHJcblx0XHR2YXIgcmV0dXJuVmFsdWUgPSBbXTtcclxuXHRcdGZvciAodmFyIGtleSBpbiBFbnVtT2JqKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgRW51bU9ialtrZXldID09PSBcInN0cmluZ1wiKSByZXR1cm5WYWx1ZS5wdXNoKEVudW1PYmpba2V5XS5yZXBsYWNlKC9fL2csIFwiIFwiKSk7XHJcblx0XHR9O1xyXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xyXG5cdH1cclxuXHJcblx0LyoqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgSzpWIGZyb20gYSBsaXN0IG9mIHN0cmluZ3MgKi9cclxuXHRwdWJsaWMgc3RyRW51bTxUIGV4dGVuZHMgc3RyaW5nPihvOiBBcnJheTxUPik6IHtbSyBpbiBUXTogSyB9IHtcclxuXHRcdHJldHVybiBvLnJlZHVjZSgocmVzLCBrZXkpID0+IHtcclxuXHRcdFx0cmVzW2tleV0gPSBrZXk7XHJcblx0XHRcdHJldHVybiByZXM7XHJcblx0XHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcclxuXHR9XHJcblxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBEYXRlIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgRHQge1xyXG5cclxuXHRwdWJsaWMgbW9tZW50KGRhdGU/OiBEYXRlKTogbW9tZW50Lk1vbWVudCB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBEdXJhdGlvbihzZWNvbmRzOiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcihzZWNvbmRzKTtcclxuXHRcdHZhciBob3VycyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIDM2MDApO1xyXG5cdFx0dmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKChzZWNvbmRzIC0gKGhvdXJzICogMzYwMCkpIC8gNjApO1xyXG5cdFx0dmFyIHNlY29uZHMgPSBzZWNvbmRzIC0gKGhvdXJzICogMzYwMCkgLSAobWludXRlcyAqIDYwKTtcclxuXHJcblx0XHR2YXIgaG91cnNTdHIgPSAoaG91cnMgPCAxMCA/ICcwJyA6ICcnKSArIGhvdXJzLnRvU3RyaW5nKCk7XHJcblx0XHR2YXIgbWludXRlc1N0ciA9IChtaW51dGVzIDwgMTAgPyAnMCcgOiAnJykgKyBtaW51dGVzLnRvU3RyaW5nKCk7XHJcblx0XHR2YXIgc2Vjb25kc1N0ciA9IChzZWNvbmRzIDwgMTAgPyAnMCcgOiAnJykgKyBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcblx0XHRyZXR1cm4gKGhvdXJzID8gaG91cnNTdHIgKyAnOicgOiAnJykgKyBtaW51dGVzU3RyICsgJzonICsgc2Vjb25kc1N0cjtcclxuXHR9XHJcblxyXG5cdC8vWWVhcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSB5ZWFyIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkWWVhcnMoZGF5OiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoZGF5LCAneWVhcnMnKS50b0RhdGUoKTtcclxuXHR9XHJcblx0LyoqIHN0YXJ0IG9mIHllYXIgKi9cclxuXHRwdWJsaWMgZGF0ZVllYXJTdGFydChkYXRlPzogRGF0ZSwgYWRkWWVhcnM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ3llYXInKS5hZGQoYWRkWWVhcnMgfHwgMCwgXCJ5ZWFyc1wiKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8qKiBlbmQgb2YgeWVhciAqL1xyXG5cdHB1YmxpYyBkYXRlWWVhckVuZChkYXRlPzogRGF0ZSwgYWRkWWVhcnM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmVuZE9mKCd5ZWFyJykuYWRkKGFkZFllYXJzIHx8IDAsIFwieWVhcnNcIikudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL01vbnRocyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgbW9udGggdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGRNb250aHMoZGF5OiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoZGF5LCAnbW9udGhzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cdC8qKiBzdGFydCBvZiBtb250aCAqL1xyXG5cdHB1YmxpYyBkYXRlTW9udGhTdGFydChkYXRlPzogRGF0ZSwgYWRkTW9udGhzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5zdGFydE9mKCdtb250aCcpLmFkZChhZGRNb250aHMgfHwgMCwgJ21vbnRocycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGVuZCBvZiBtb250aCAqL1xyXG5cdHB1YmxpYyBkYXRlTW9udGhFbmQoZGF0ZT86IERhdGUsIGFkZE1vbnRocz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZW5kT2YoJ21vbnRoJykuYWRkKGFkZE1vbnRocyB8fCAwLCAnbW9udGhzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL0RheXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgZGF5IHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkRGF5cyhkYXk6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChkYXksICdkYXlzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL1dlZWtzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogc3RhcnQgb2Ygd2VlayAqL1xyXG5cdHB1YmxpYyBkYXRlV2Vla1N0YXJ0KGRhdGU/OiBEYXRlLCBhZGRXZWVrcz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuc3RhcnRPZignaXNvV2VlaycpLmFkZChhZGRXZWVrcyB8fCAwLCAnd2Vla3MnKS50b0RhdGUoKTtcclxuXHR9XHJcblx0LyoqIGVuZCBvZiB3ZWVrICovXHJcblx0cHVibGljIGRhdGVXZWVrRW5kKGRhdGU/OiBEYXRlLCBhZGRXZWVrcz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZW5kT2YoJ2lzb1dlZWsnKS5hZGQoYWRkV2Vla3MgfHwgMCwgJ3dlZWtzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL0hvdXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIGhvdXIgdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGRIb3Vycyhob3VyOiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoaG91ciwgJ2hvdXJzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL01pbnV0ZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgbWludXRlcyB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZE1pbnV0ZXMobWludXRlczogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKG1pbnV0ZXMsICdtaW51dGVzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL2NvbnZlcnQgdG8gc3RyaW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKFlZWVktTU0tREQpICovXHJcblx0cHVibGljIGRhdGVUb1N0cllNRChkYXRlPzogRGF0ZSk6IHN0cmluZyB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoREQvTU0vWVlZWSkgKi9cclxuXHRwdWJsaWMgZGF0ZVRvU3RyKGRhdGU/OiBEYXRlLCBmb3JtYXQ/OiAnREQvTU0vWVlZJyB8ICdZWVlZLU1NLUREJyB8ICdEIE1NTSBZWVlZJyB8IFwiRCBNTU0gWVlZWSBoaDptbVwiIHwgJ0QgTU1NTSBZWVlZJyB8IFwiWVlZWU1NRERISG1tc3NcIik6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGQgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XHJcblx0XHRzd2l0Y2ggKGZvcm1hdCkge1xyXG5cdFx0XHRjYXNlIFwiRCBNTU1NIFlZWVlcIjpcclxuXHRcdFx0XHRyZXR1cm4gZC5nZXREYXRlKCkgKyAnICcgKyBtZS5tb250aE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdGNhc2UgXCJEIE1NTSBZWVlZIGhoOm1tXCI6XHJcblx0XHRcdFx0cmV0dXJuIGQuZ2V0RGF0ZSgpICsgJyAnICsgbWUubW9udGhTaG9ydE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCkgKyAnICcgKyBtb21lbnQoZCkuZm9ybWF0KCdoaDptbSBBJyk7XHJcblx0XHRcdGNhc2UgXCJEIE1NTSBZWVlZXCI6XHJcblx0XHRcdFx0cmV0dXJuIGQuZ2V0RGF0ZSgpICsgJyAnICsgbWUubW9udGhTaG9ydE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIG1vbWVudChkKS5mb3JtYXQoZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKEREL01NL1lZWVkpICovXHJcblx0cHVibGljIHRpbWVUb1N0cihkYXRlPzogRGF0ZSk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnaGg6bW0gQScpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBzdHJpbmcgdG8gYSBkYXRlIFxyXG5cdCAqKiBEZWZhdWx0IGZvcm1hdDogIChERC9NTS9ZWVlZKSAgXHJcblx0Ki9cclxuXHRwdWJsaWMgc3RyVG9EYXRlKGRhdGU6IHN0cmluZywgZm9ybWF0Pzogc3RyaW5nKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0bW9tZW50KCkudG9EYXRlKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoZm9ybWF0KSBkYXRlID0gZGF0ZS5zdWJzdHIoMCwgZm9ybWF0Lmxlbmd0aCk7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJykudG9EYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIG1vbWVudCBvYmplY3QgKi9cclxuXHRwdWJsaWMgc3RyVG9Nb21lbnQoZGF0ZTogc3RyaW5nKSB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlLCAnREQvTU0vWVlZWScpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgY2xhcmlvbkRhdGUoZGF0ZT86IERhdGUpOiBudW1iZXIge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHZhciBvbmVEYXkgPSAyNCAqIDYwICogNjAgKiAxMDAwOyAvLyBob3VycyptaW51dGVzKnNlY29uZHMqbWlsbGlzZWNvbmRzXHJcblx0XHR2YXIgc3RhcnREYXRlID0gbmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKTtcclxuXHRcdHZhciBkaWZmRGF5cyA9IE1hdGgucm91bmQoTWF0aC5hYnMoKGRhdGUuZ2V0VGltZSgpIC0gc3RhcnREYXRlLmdldFRpbWUoKSkgLyAob25lRGF5KSkpXHJcblx0XHRyZXR1cm4gZGlmZkRheXNcclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25EYXRlVG9EYXRlKGNsYXJpb25EYXRlPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWNsYXJpb25EYXRlKSByZXR1cm4gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzLmRhdGVBZGREYXlzKGNsYXJpb25EYXRlLCBuZXcgRGF0ZShcIkRlY2VtYmVyIDI4LCAxODAwXCIpKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBzaG9ydE1vbnRoKGNsYXJpb25EYXRlPzogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZGF0ZSA9IG1lLmNsYXJpb25EYXRlVG9EYXRlKGNsYXJpb25EYXRlKTtcclxuXHRcdHJldHVybiBtZS5tb250aFNob3J0TmFtZShkYXRlLmdldE1vbnRoKCkgKyAxKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBtb250aFllYXIoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBkYXRlID0gbWUuY2xhcmlvbkRhdGVUb0RhdGUoY2xhcmlvbkRhdGUpO1xyXG5cdFx0cmV0dXJuIG1lLm1vbnRoU2hvcnROYW1lKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgJ2AnICsgZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCkuc3Vic3RyKDIsIDIpO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBzaG9ydCBkZXNjcmlwdGlvbiBmb3IgbW9udGggKi9cclxuXHRwdWJsaWMgbW9udGhTaG9ydE5hbWUobW9udGg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoIW1vbnRoKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgbW9udGhfbmFtZXNfc2hvcnQgPSBbJycsICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddO1xyXG5cdFx0dmFyIG1vbnRoTmFtZSA9IG1vbnRoX25hbWVzX3Nob3J0W21vbnRoXTtcclxuXHRcdHJldHVybiBtb250aE5hbWU7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHNob3J0IGRlc2NyaXB0aW9uIGZvciBtb250aCAqL1xyXG5cdHB1YmxpYyBtb250aE5hbWUobW9udGg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoIW1vbnRoKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgbW9udGhfbmFtZXNfc2hvcnQgPSBbJycsICdKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvdmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XHJcblx0XHR2YXIgbW9udGhOYW1lID0gbW9udGhfbmFtZXNfc2hvcnRbbW9udGhdO1xyXG5cdFx0cmV0dXJuIG1vbnRoTmFtZTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgc2hvcnQgZGVzY3JpcHRpb24gZm9yIG1vbnRoICovXHJcblx0cHVibGljIGRheU9mV2VlayhkYXRlOiBEYXRlLCBvcHRpb24/OiBcIlNob3J0XCIgfCBcIkxvbmdcIik6IHN0cmluZyB7XHJcblx0XHRpZiAoIWRhdGUpIHJldHVybiAnJztcclxuXHRcdHZhciBkYXlfbmFtZXNfc2hvcnQgPSBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF0ZScsICdTYXR1cmRheSddO1xyXG5cdFx0dmFyIGRheV9uYW1lc19sb25nID0gWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXTtcclxuXHRcdGlmIChvcHRpb24gPT0gXCJTaG9ydFwiKSB7XHJcblx0XHRcdHJldHVybiBkYXlfbmFtZXNfc2hvcnRbZGF0ZS5nZXREYXkoKV1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBkYXlfbmFtZXNfbG9uZ1tkYXRlLmdldERheSgpXVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25UaW1lKGRhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHR2YXIgbW10TWlkbmlnaHQgPSBtb21lbnQoZGF0ZSkuc3RhcnRPZignZGF5Jyk7XHJcblx0XHR2YXIgc2Vjb25kcyA9IG1vbWVudChkYXRlKS5kaWZmKG1tdE1pZG5pZ2h0LCAnc2Vjb25kcycpICogMTAwO1xyXG5cdFx0cmV0dXJuIHNlY29uZHNcclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiB0aW1lICovXHJcblx0cHVibGljIGNsYXJpb25UaW1lVG9EYXRlKGNsYXJpb25EYXRlPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWNsYXJpb25EYXRlKSByZXR1cm4gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQobmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKSkuYWRkKGNsYXJpb25EYXRlIC8gMTAwLCAnc2Vjb25kcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKEREL01NL1lZWVkpICovXHJcblx0cHVibGljIGRpZmZEYXlzKGZyb21EYXRlOiBEYXRlLCB0b0RhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZGF0ZSA9IG1vbWVudCh0b0RhdGUpO1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gZGF0ZS5kaWZmKGZyb21EYXRlLCBcImRheXNcIik7XHJcblx0XHRyZXR1cm4gaXNOYU4ocmV0dXJuVmFsdWUpID8gbnVsbCA6IHJldHVyblZhbHVlO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKiBnZXQgdGhlIGRheXMgZGlmZmVyZW50IGluIHdvcmRzICovXHJcblx0cHVibGljIGRpZmZEYXlzV29yZHMoZGF0ZTogRGF0ZSk6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFkYXRlKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgZGF5cyA9IG1lLmRpZmZEYXlzKGRhdGUpO1xyXG5cdFx0c3dpdGNoIChkYXlzKSB7XHJcblx0XHRcdGNhc2UgbnVsbDpcclxuXHRcdFx0XHRyZXR1cm4gJyc7XHJcblx0XHRcdGNhc2UgLTE6XHJcblx0XHRcdFx0cmV0dXJuICd0b21vcnJvdyc7XHJcblx0XHRcdGNhc2UgMDpcclxuXHRcdFx0XHRyZXR1cm4gZHQudGltZVRvU3RyKGRhdGUpO1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0cmV0dXJuICd5ZXN0ZXJkYXknO1xyXG5cdFx0XHRjYXNlIDI6XHJcblx0XHRcdGNhc2UgMzpcclxuXHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRjYXNlIDU6XHJcblx0XHRcdGNhc2UgNjpcclxuXHRcdFx0XHRyZXR1cm4gZHQuZGF5T2ZXZWVrKGRhdGUpO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdHJldHVybiBkdC5kYXRlVG9TdHIoZGF0ZSwgXCJEIE1NTU0gWVlZWVwiKVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLyoqIEV4dHJhIGZ1bmN0aW9ucyB1c2VkIHdpdGggdmlld3MgKi9cclxuZXhwb3J0IGNsYXNzIFZpZXdFeHQge1xyXG5cclxuXHQvKiogcmVtb3ZlIHRoZSBmb2N1cyBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgY2xlYXJBbmREaXNtaXNzKHZpZXc6IHZpZXcuVmlld0Jhc2UpIHtcclxuXHRcdGlmICghdmlldykgcmV0dXJuO1xyXG5cdFx0dGhpcy5kaXNtaXNzU29mdElucHV0KHZpZXcpO1xyXG5cdFx0dGhpcy5jbGVhckZvY3VzKHZpZXcpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJlbW92ZSB0aGUgZm9jdXMgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGNsZWFyRm9jdXModmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHRpZiAoaXNBbmRyb2lkKSBpZiAodmlldy5hbmRyb2lkKSB2aWV3LmFuZHJvaWQuY2xlYXJGb2N1cygpO1xyXG5cdH1cclxuXHJcblx0LyoqIGhpZGUgdGhlIHNvZnQga2V5Ym9hcmQgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGRpc21pc3NTb2Z0SW5wdXQodmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHR0cnkge1xyXG5cdFx0XHQoPGFueT52aWV3KS5kaXNtaXNzU29mdElucHV0KCk7XHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVZhbHVlSXRlbSB7XHJcblx0VmFsdWVNZW1iZXI6IGFueTtcclxuXHREaXNwbGF5TWVtYmVyOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBhIHZhbHVlIGxpc3QgYXJyYXkgKi9cclxuZXhwb3J0IGNsYXNzIFZhbHVlTGlzdCB7XHJcblxyXG5cdC8qKiB0aGlzIGFycmF5IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHJpdmF0ZSBpdGVtczogQXJyYXk8SVZhbHVlSXRlbT47XHJcblxyXG5cdC8qKiB0aGUgbnVtYmVyIG9mIGl0ZW1zICovXHJcblx0Z2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGg7IH1cclxuXHJcblx0Y29uc3RydWN0b3IoYXJyYXk/OiBBcnJheTxJVmFsdWVJdGVtPikge1xyXG5cdFx0aWYgKGFycmF5KSB0aGlzLml0ZW1zID0gYXJyYXk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbShpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtRnJvbnQoaXRlbTogSVZhbHVlSXRlbSkge1xyXG5cdFx0dGhpcy5pdGVtcy51bnNoaWZ0KGl0ZW0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtcygpOiBBcnJheTxJVmFsdWVJdGVtPiB7XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtcztcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYW4gaXRlbSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0SXRlbShpbmRleDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUZXh0KGluZGV4KTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGRpc3BsYXkgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFRleHQoaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdLkRpc3BsYXlNZW1iZXI7XHJcblx0fVxyXG5cdC8qKiBnZXQgYW4gYXJyYXkgb2YgdGhlIGl0ZW1zIHRleHQgZmllbGQgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4LkRpc3BsYXlNZW1iZXI7IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFZhbHVlKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtc1tpbmRleF0uVmFsdWVNZW1iZXI7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBpbmRleCBieSBpdHMgdmFsdWUsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cclxuXHRwdWJsaWMgZ2V0SW5kZXgodmFsdWU6IGFueSwgZGVmYXVsdEluZGV4PzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAodGhpcy5nZXRWYWx1ZShpKSA9PSB2YWx1ZSkgcmV0dXJuIGk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGVmYXVsdEluZGV4ID09IG51bGwgPyAtMSA6IGRlZmF1bHRJbmRleDtcclxuXHR9XHJcbn1cclxuXHJcbi8qKiBhIHZhbHVlIGxpc3QgYXJyYXkgKi9cclxuZXhwb3J0IGNsYXNzIERpY3Rpb25hcnkge1xyXG5cclxuXHQvKiogdGhpcyBhcnJheSBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHByaXZhdGUgX2l0ZW1zID0gW107XHJcblx0LyoqIGdldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXQgaXRlbXMoKSB7IHJldHVybiB0aGlzLl9pdGVtcyB9XHJcblx0LyoqIHNldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBzZXQgaXRlbXMoYXJyYXkpIHsgdGhpcy5faXRlbXMgPSBhcnJheSB9XHJcblxyXG5cdHB1YmxpYyB2YWx1ZU1lbWJlck5hbWUgPSBcIlZhbHVlTWVtYmVyXCI7XHJcblx0cHVibGljIGRpc3BsYXlNZW1iZXJOYW1lID0gXCJEaXNwbGF5TWVtYmVyXCI7XHJcblxyXG5cdC8qKiB0aGUgbnVtYmVyIG9mIGl0ZW1zICovXHJcblx0cHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuaXRlbXMubGVuZ3RoOyB9XHJcblxyXG5cdGNvbnN0cnVjdG9yKGFycmF5PzogQXJyYXk8YW55PiwgdmFsdWVNZW1iZXJOYW1lPzogc3RyaW5nLCBkaXNwbGF5TWVtYmVyTmFtZT86IHN0cmluZykge1xyXG5cdFx0dGhpcy5hZGRJdGVtcyhhcnJheSwgdmFsdWVNZW1iZXJOYW1lLCBkaXNwbGF5TWVtYmVyTmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbShpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbXMoYXJyYXk6IEFycmF5PGFueT4sIHZhbHVlTWVtYmVyTmFtZTogc3RyaW5nLCBkaXNwbGF5TWVtYmVyTmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKGFycmF5KSBtZS5pdGVtcyA9IGFycmF5O1xyXG5cdFx0aWYgKHZhbHVlTWVtYmVyTmFtZSkgdGhpcy52YWx1ZU1lbWJlck5hbWUgPSB2YWx1ZU1lbWJlck5hbWU7XHJcblx0XHRpZiAoZGlzcGxheU1lbWJlck5hbWUpIHRoaXMuZGlzcGxheU1lbWJlck5hbWUgPSBkaXNwbGF5TWVtYmVyTmFtZTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW1Gcm9udChpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGFkZEl0ZW0gPSB7fTtcclxuXHRcdGFkZEl0ZW1bbWUudmFsdWVNZW1iZXJOYW1lXSA9IGl0ZW0uVmFsdWVNZW1iZXI7XHJcblx0XHRhZGRJdGVtW21lLmRpc3BsYXlNZW1iZXJOYW1lXSA9IGl0ZW0uRGlzcGxheU1lbWJlcjtcclxuXHRcdHRoaXMuaXRlbXMudW5zaGlmdChhZGRJdGVtKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogZ2V0IGFuIGl0ZW0gYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldEl0ZW0oaW5kZXg6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGV4dChpbmRleCk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBkaXNwbGF5IHZhbHVlIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0KGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1lLml0ZW1zW2luZGV4XVttZS5kaXNwbGF5TWVtYmVyTmFtZV07XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IGFuIGFycmF5IG9mIHRoZSBpdGVtcyBkaXNwbGF5IG1lbWJlcnMgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4W21lLmRpc3BsYXlNZW1iZXJOYW1lXTsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyB2YWx1ZU1lbWJlciBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VmFsdWUoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghbWUuaXRlbXMgfHwgbWUuaXRlbXMubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xyXG5cdFx0aWYgKGluZGV4ID09IHVuZGVmaW5lZCB8fCBpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcclxuXHRcdHJldHVybiBtZS5pdGVtc1tpbmRleF1bbWUudmFsdWVNZW1iZXJOYW1lXTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGluZGV4IGJ5IGl0cyB2YWx1ZU1lbWViZXIsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cdHB1YmxpYyBnZXRJbmRleCh2YWx1ZTogYW55LCBkZWZhdWx0SW5kZXg/OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAobWUuZ2V0VmFsdWUoaSkgPT0gdmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlZmF1bHRJbmRleCA9PSBudWxsID8gLTEgOiBkZWZhdWx0SW5kZXg7XHJcblx0fVxyXG59XHJcblxyXG4vKiogRmlsZSBhY2Nlc3MgZnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBGaWxlIHtcclxuXHJcblx0cHVibGljIGRvY3VtZW50Rm9sZGVyID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XHJcblxyXG5cdC8qKiBnZXQgYW4gYXBwbGljYXRpb24gZm9sZGVyICovXHJcblx0cHVibGljIGdldEFwcEZvbGRlcihmb2xkZXI6IHN0cmluZykge1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmN1cnJlbnRBcHAoKS5nZXRGb2xkZXIoZm9sZGVyKTtcclxuXHR9O1xyXG5cclxuXHQvKiogZ2V0IGFuIGFwcGxpY2F0aW9uIGZvbGRlciAqL1xyXG5cdHB1YmxpYyBnZXRBcHBGb2xkZXJQYXRoKGZvbGRlcjogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuY3VycmVudEFwcCgpLmdldEZvbGRlcihmb2xkZXIpLnBhdGg7XHJcblx0fTtcclxuXHJcblx0LyoqIGdldCBhbiBhcHBsaWNhdGlvbiBmdWxsIGZpbGVuYW1lICovXHJcblx0cHVibGljIGdldEFwcEZpbGVuYW1lKGZpbGVuYW1lOiBzdHJpbmcsIGZvbGRlcjogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuY3VycmVudEFwcCgpLmdldEZvbGRlcihmb2xkZXIpLnBhdGggKyAnLycgKyBmaWxlbmFtZTtcclxuXHR9O1xyXG5cclxuXHQvKiogZ2V0IGFuIGFwcGxpY2F0aW9uIGZ1bGwgZmlsZW5hbWUgKi9cclxuXHRwdWJsaWMgZ2V0QXBwRmlsZUV4aXN0cyhmaWxlbmFtZTogc3RyaW5nLCBmb2xkZXI6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmN1cnJlbnRBcHAoKS5nZXRGb2xkZXIoZm9sZGVyKS5jb250YWlucyhmaWxlbmFtZSk7XHJcblx0fTtcclxuXHJcblx0LyoqIHJldHVybiBhbiBhcHBsaWNhdGlvbiBmaWxlICovXHJcblx0cHVibGljIGdldEFwcEZpbGUoZmlsZW5hbWU6IHN0cmluZywgZm9sZGVyOiBzdHJpbmcpIHtcclxuXHRcdHJldHVybiBmaWxlU3lzdGVtTW9kdWxlLmtub3duRm9sZGVycy5jdXJyZW50QXBwKCkuZ2V0Rm9sZGVyKGZvbGRlcikuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0fTtcclxuXHJcblx0LyoqIGV4dHJhY3QgZmlsZSBmcm9tIHBhdGggKi9cclxuXHRwdWJsaWMgZ2V0RmlsZW5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGlmICghcGF0aCkgcmV0dXJuICcnXHJcblx0XHRpZiAocGF0aC5pbmRleE9mKFwiL1wiKSA9PSAtMSkgcmV0dXJuIHBhdGg7XHJcblx0XHRyZXR1cm4gcGF0aC5zcGxpdChcIi9cIikucG9wKCk7XHJcblx0fTtcclxuXHJcblx0LyoqIGNoZWNrIGlmIG1lZGlhIGZpbGUgZXhpc3RzICovXHJcblx0cHVibGljIG1lZGlhRmlsZUV4aXN0cyhmaWxlbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0ZmlsZW5hbWUgPSBtZS5nZXRGaWxlbmFtZShmaWxlbmFtZSk7XHJcblx0XHRyZXR1cm4gbWUuZ2V0QXBwRmlsZUV4aXN0cyhmaWxlbmFtZSwgXCJtZWRpYVwiKTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYSBtZWRpYSBmaWxlIG9iamVjdCAqL1xyXG5cdHB1YmxpYyBtZWRpYUdldEZpbGUoZmlsZW5hbWU6IHN0cmluZyk6IGZpbGVTeXN0ZW1Nb2R1bGUuRmlsZSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0ZmlsZW5hbWUgPSBtZS5nZXRGaWxlbmFtZShmaWxlbmFtZSk7XHJcblx0XHRyZXR1cm4gZmlsZS5nZXRBcHBGb2xkZXIoXCJtZWRpYVwiKS5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgZnVsbG5hbWUgZm9yIG1lZGlhIGZpbGUgKi9cclxuXHRwdWJsaWMgbWVkaWFHZXRGdWxsTmFtZShmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRmaWxlbmFtZSA9IG1lLmdldEZpbGVuYW1lKGZpbGVuYW1lKTtcclxuXHRcdHJldHVybiBtZS5nZXRBcHBGb2xkZXJQYXRoKFwibWVkaWFcIikgKyBgLyR7ZmlsZW5hbWV9YDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB0ZW1wRm9sZGVyID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMudGVtcCgpO1xyXG5cclxuXHRwdWJsaWMgZG93bmxvYWRGb2xkZXIgPSBpc0FuZHJvaWQgPyBhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZVB1YmxpY0RpcmVjdG9yeShhbmRyb2lkLm9zLkVudmlyb25tZW50LkRJUkVDVE9SWV9ET1dOTE9BRFMpLmdldEFic29sdXRlUGF0aCgpIDogJyc7XHJcblxyXG5cdC8qKiBsb2FkIGpzb24gZnJvbSBhIGZpbGUgKi9cclxuXHRwdWJsaWMgZXhpc3RzKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuZG9jdW1lbnRGb2xkZXIuY29udGFpbnMoZmlsZW5hbWUpO1xyXG5cdH1cclxuXHJcblx0LyoqIHNhdmUganNvbiB0byBhIGZpbGUgKi9cclxuXHRwdWJsaWMgc2F2ZUZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUud3JpdGVTeW5jKGRhdGEsIGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXNvbHZlKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBsb2FkIGpzb24gZnJvbSBhIGZpbGUgKi9cclxuXHRwdWJsaWMgbG9hZEpTT05GaWxlKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHR2YXIgZmlsZSA9IG1lLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0XHRmaWxlLnJlYWRUZXh0KCkudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xyXG5cdFx0XHRcdHZhciByZXR1cm5WYWx1ZSA9IG51bGw7XHJcblx0XHRcdFx0aWYgKGNvbnRlbnQgIT0gXCJcIikgcmV0dXJuVmFsdWUgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xyXG5cdFx0XHRcdHJlc29sdmUocmV0dXJuVmFsdWUpO1xyXG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKiogc2F2ZSBqc29uIHRvIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBzYXZlSlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUud3JpdGVUZXh0KEpTT04uc3RyaW5naWZ5KGRhdGEpKS50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHRcdFx0cmVzb2x2ZShjb250ZW50KTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8qKiBlbXB0eSB0aGUgZmlsZSAqL1xyXG5cdHB1YmxpYyBjbGVhckpTT05GaWxlKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGEpIHtcclxuXHRcdHZhciBmaWxlID0gdGhpcy5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdGZpbGUud3JpdGVUZXh0KEpTT04uc3RyaW5naWZ5KHt9KSk7XHJcblx0fVxyXG5cclxuXHQvLyoqIGNyZWF0ZSBhIGZ1bGwgZmlsZW5hbWUgaW5jbHVkaW5nIHRoZSBmb2xkZXIgZm9yIHRoZSBjdXJyZW50IGFwcCAqL1xyXG5cdHB1YmxpYyBnZXRGdWxsRmlsZW5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBmaWxlU3lzdGVtTW9kdWxlLnBhdGguam9pbihtZS5kb2N1bWVudEZvbGRlci5wYXRoLCBmaWxlbmFtZSk7XHJcblx0fVxyXG5cdC8vKiogY3JlYXRlIGEgZnVsbCBmaWxlbmFtZSBpbmNsdWRpbmcgdGhlIHRlbXAgZm9sZGVyIGZvciB0aGUgY3VycmVudCBhcHAgKi9cclxuXHRwdWJsaWMgZ2V0RnVsbFRlbXBGaWxlbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUucGF0aC5qb2luKG1lLnRlbXBGb2xkZXIucGF0aCwgZmlsZW5hbWUpO1xyXG5cdH1cclxuXHQvLyBwdWJsaWMgZGVsZXRlRmlsZShwYXJ0eTogc3RyaW5nKSB7XHJcblx0Ly8gXHR2YXIgZmlsZSA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmRvY3VtZW50cygpLmdldEZpbGUocGFydHkpO1xyXG5cdC8vIFx0ZmlsZS5cclxuXHQvLyB9XHJcblxyXG5cclxuXHRwdWJsaWMgZG93bmxvYWRVcmwodXJsLCBmaWxlUGF0aCkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblxyXG5cdFx0XHRodHRwLmdldEZpbGUodXJsLCBmaWxlUGF0aCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y2FsbC5vcGVuRmlsZShmaWxlUGF0aCk7XHJcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gbmV3IEVycm9yKFwiRXJyb3IgZG93bmxvYWRpbmcgJ1wiICsgZmlsZVBhdGggKyBcIicuIFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEljb21wb3NlRW1haWwge1xyXG5cdHRvOiBzdHJpbmc7XHJcblx0c3ViamVjdD86IHN0cmluZztcclxuXHRib2R5Pzogc3RyaW5nO1xyXG5cdHNhbHV0YXRpb24/OiBzdHJpbmc7XHJcblx0ZGVhcj86IHN0cmluZztcclxuXHRyZWdhcmRzPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogY2FsbCB0aGlyZHBhcnR5IGFwcHMgKi9cclxuZXhwb3J0IGNsYXNzIENhbGwge1xyXG5cclxuXHQvKiogY29tcG9zZSBhbiBlbWFpbCAqL1xyXG5cdHB1YmxpYyBjb21wb3NlRW1haWwobWVzc2FnZTogSWNvbXBvc2VFbWFpbCkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBzdWJqZWN0ID0gKG1lc3NhZ2Uuc3ViamVjdCB8fCBcIlN1cHBvcnRcIik7XHJcblx0XHRpZiAoIW1lc3NhZ2UuYm9keSkge1xyXG5cdFx0XHRtZXNzYWdlLmJvZHkgPSAobWVzc2FnZS5zYWx1dGF0aW9uIHx8IChtZXNzYWdlLmRlYXIgPyBcIkRlYXIgXCIgKyBtZXNzYWdlLmRlYXIgOiBudWxsKSB8fCBcIkRlYXIgTWFkYW0vU2lyXCIpO1xyXG5cdFx0XHRpZiAobWVzc2FnZS5yZWdhcmRzKSBtZXNzYWdlLmJvZHkgKz0gXCI8QlI+PEJSPjxCUj5SZWdhcmRzPEJSPlwiICsgbWVzc2FnZS5yZWdhcmRzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVtYWlsLmF2YWlsYWJsZSgpLnRoZW4oZnVuY3Rpb24gKGF2YWlsKSB7XHJcblx0XHRcdGlmIChhdmFpbCkge1xyXG5cdFx0XHRcdHJldHVybiBlbWFpbC5jb21wb3NlKHtcclxuXHRcdFx0XHRcdHRvOiBbbWVzc2FnZS50b10sXHJcblx0XHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0LFxyXG5cdFx0XHRcdFx0Ym9keTogbWVzc2FnZS5ib2R5LFxyXG5cdFx0XHRcdFx0YXBwUGlja2VyVGl0bGU6ICdDb21wb3NlIHdpdGguLicgLy8gZm9yIEFuZHJvaWQsIGRlZmF1bHQ6ICdPcGVuIHdpdGguLidcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVtYWlsIG5vdCBhdmFpbGFibGVcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIkVtYWlsIGNvbXBvc2VyIGNsb3NlZFwiKTtcclxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0fSk7O1xyXG5cdH1cclxuXHJcblx0LyoqIG1ha2UgYSBwaG9uZSBjYWxsICovXHJcblx0cHVibGljIHBob25lRGlhbChQaG9uZU5vOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRwaG9uZS5kaWFsKFBob25lTm8sIHRydWUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9wZW5GaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZmlsZW5hbWUgPSBmaWxlUGF0aC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aWYgKGFuZHJvaWQpIHtcclxuXHRcdFx0XHRpZiAoZmlsZW5hbWUuc3Vic3RyKDAsIDcpICE9IFwiZmlsZTovL1wiIHx8IGZpbGVuYW1lLnN1YnN0cigwLCAxMCkgIT0gXCJjb250ZW50Oi8vXCIpIGZpbGVuYW1lID0gXCJmaWxlOi8vXCIgKyBmaWxlbmFtZTtcclxuXHRcdFx0XHRpZiAoYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OLlNES19JTlQgPiBhbmRyb2lkLm9zLkJ1aWxkLlZFUlNJT05fQ09ERVMuTSkgZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKFwiZmlsZTovL1wiLCBcImNvbnRlbnQ6Ly9cIik7XHJcblxyXG5cdFx0XHRcdHZhciB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoZmlsZW5hbWUudHJpbSgpKTtcclxuXHRcdFx0XHR2YXIgdHlwZSA9IFwiYXBwbGljYXRpb24vXCIgKyAoKGV4cG9ydHMuc3RyLmluTGlzdChmaWxlbmFtZS5zbGljZSgtNCksIFsnLnBkZicsICcuZG9jJywgJy54bWwnXSkpID8gZmlsZW5hbWUuc2xpY2UoLTMpIDogXCIqXCIpO1xyXG5cclxuXHRcdFx0XHQvL0NyZWF0ZSBpbnRlbnRcclxuXHRcdFx0XHR2YXIgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fVklFVyk7XHJcblx0XHRcdFx0aW50ZW50LnNldERhdGFBbmRUeXBlKHVyaSwgdHlwZSk7XHJcblx0XHRcdFx0aW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XHJcblx0XHRcdFx0YXBwbGljYXRpb24uYW5kcm9pZC5jdXJyZW50Q29udGV4dC5zdGFydEFjdGl2aXR5KGludGVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0aW9zLm9wZW5GaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRhbGVydCgnQ2Fubm90IG9wZW4gZmlsZSAnICsgZmlsZW5hbWUgKyAnLiAnICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBzdGFydCB0aGUgY29udGFjdHMgYXBwICovXHJcblx0cHVibGljIHNob3dDb250YWN0cygpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRpZiAoYW5kcm9pZCkge1xyXG5cdFx0XHRcdHZhciB1cmkgPSBhbmRyb2lkLnByb3ZpZGVyLkNvbnRhY3RzQ29udHJhY3QuQ29udGFjdHMuQ09OVEVOVF9VUkk7XHJcblx0XHRcdFx0dmFyIHR5cGUgPSBhbmRyb2lkLnByb3ZpZGVyLkNvbnRhY3RzQ29udHJhY3QuQ29tbW9uRGF0YUtpbmRzLlBob25lLkNPTlRFTlRfVFlQRTtcclxuXHRcdFx0XHR2YXIgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fREVGQVVMVCwgdXJpKTtcclxuXHRcdFx0XHRhcHBsaWNhdGlvbi5hbmRyb2lkLmN1cnJlbnRDb250ZXh0LnN0YXJ0QWN0aXZpdHkoaW50ZW50KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIHtcclxuXHRcdFx0XHQvL2lvcy4oZmlsZW5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0YWxlcnQoYENhbm5vdCBzaG93IGNvbnRhY3RzLiAke2Vycn1gKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLy8gLyoqIEV4dGVuZGluZyBOYXRpdmVzY3JpcHQgQXV0b2NvbXBsZXRlICovXHJcbi8vIGV4cG9ydCBjbGFzcyBUb2tlbkl0ZW0gZXh0ZW5kcyBhdXRvY29tcGxldGVNb2R1bGUuVG9rZW5Nb2RlbCB7XHJcbi8vIFx0dmFsdWU6IG51bWJlcjtcclxuLy8gXHRjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIGltYWdlPzogc3RyaW5nKSB7XHJcbi8vIFx0XHRzdXBlcih0ZXh0LCBpbWFnZSB8fCBudWxsKTtcclxuLy8gXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuLy8gXHR9XHJcblxyXG4vLyB9O1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBGb3JtIHtcclxuXHJcblx0cHVibGljIGdldCBjdXJyZW50UGFnZSgpOiBQYWdlIHtcclxuXHRcdHJldHVybiB0b3Btb3N0KCkuY3VycmVudFBhZ2U7XHJcblx0fTtcclxuXHJcblx0cHVibGljIHNob3dQYWdlKHBhZ2VOYW1lOiBzdHJpbmcsIGNvbnRleHQ/OiBhbnksIGZvbGRlcj86IHN0cmluZykge1xyXG5cdFx0aWYgKHRoaXMuY3VycmVudFBhZ2UuYmluZGluZ0NvbnRleHQpIHRoaXMuY3VycmVudFBhZ2UuYmluZGluZ0NvbnRleHQuY2hpbGRQYWdlID0gcGFnZU5hbWU7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0bW9kdWxlTmFtZTogKGZvbGRlciB8fCAnJykgKyBwYWdlTmFtZSArICcvJyArIHBhZ2VOYW1lLFxyXG5cdFx0XHRjb250ZXh0OiBjb250ZXh0IHx8IHt9LFxyXG5cdFx0XHRhbmltYXRlZDogdHJ1ZSxcclxuXHRcdFx0dHJhbnNpdGlvbjogeyBuYW1lOiBcInNsaWRlXCIsIGR1cmF0aW9uOiAzODAsIGN1cnZlOiBcImVhc2VJblwiIH0sXHJcblx0XHRcdGNsZWFySGlzdG9yeTogZmFsc2UsXHJcblx0XHRcdGJhY2tzdGFja1Zpc2libGU6IHRydWVcclxuXHRcdH07XHJcblx0XHR0b3Btb3N0KCkubmF2aWdhdGUoZGF0YSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGV2aWNlKCk6IFwiYW5kcm9pZFwiIHwgXCJpb3NcIiB8IFwiXCIge1xyXG5cdFx0aWYgKGlzQW5kcm9pZCkgcmV0dXJuIFwiYW5kcm9pZFwiO1xyXG5cdFx0aWYgKGlzSU9TKSByZXR1cm4gXCJpb3NcIjtcclxuXHRcdHJldHVybiBcIlwiO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdvQmFjaygpIHtcclxuXHRcdHRvcG1vc3QoKS5nb0JhY2soKTtcclxuXHR9O1xyXG5cclxuXHRwdWJsaWMgc2hvd01vZGFsKHBhdGg6IHN0cmluZywgcGFyYW1zPywgZnVsbHNjcmVlbj86IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHRvcG1vc3QoKS5jdXJyZW50UGFnZS5zaG93TW9kYWwocGF0aCwgcGFyYW1zLCBmdW5jdGlvbiAoYXJncykge1xyXG5cdFx0XHRcdHJlc29sdmUoYXJncyk7XHJcblx0XHRcdH0sIGZ1bGxzY3JlZW4pXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuZXhwb3J0IHZhciBmb3JtID0gbmV3IEZvcm0oKTtcclxuZXhwb3J0IHZhciB0YWdnaW5nID0gbmV3IFRhZ2dpbmcoKTtcclxuZXhwb3J0IHZhciBzdHIgPSBuZXcgU3RyKCk7XHJcbmV4cG9ydCB2YXIgc3FsID0gbmV3IFNxbCgpO1xyXG5leHBvcnQgdmFyIGR0ID0gbmV3IER0KCk7XHJcbmV4cG9ydCB2YXIgdmlld0V4dCA9IG5ldyBWaWV3RXh0KCk7XHJcbmV4cG9ydCB2YXIgZmlsZSA9IG5ldyBGaWxlKCk7XHJcbmV4cG9ydCB2YXIgY2FsbCA9IG5ldyBDYWxsKCk7XHJcbmV4cG9ydCB2YXIgdXRpbHMgPSBuZXcgVXRpbHMoKTtcclxuIl19