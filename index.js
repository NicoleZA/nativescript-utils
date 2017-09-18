"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var application = require("application");
var moment = require("moment");
var observableModule = require("data/observable");
var fileSystemModule = require("file-system");
var frame_1 = require("ui/frame");
var buffer_1 = require("buffer");
var phone = require("nativescript-phone");
var email = require("nativescript-email");
var http = require("tns-core-modules/http");
//import * as autocompleteModule from 'nativescript-telerik-ui-pro/autocomplete';
var observable_array_1 = require("data/observable-array");
var platform_1 = require("platform");
var utils_1 = require("utils/utils");
var CryptoJS = require("crypto-js");
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
