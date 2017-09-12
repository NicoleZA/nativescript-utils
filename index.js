"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var application = require("application");
var moment = require("moment");
var observableModule = require("data/observable");
var fileSystemModule = require("file-system");
var frame_1 = require("ui/frame");
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
    Str.prototype.base64Encode = function (bytes) {
        if (platform_1.isAndroid) {
            return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP);
        }
        else if (platform_1.isIOS) {
            return bytes.base64EncodedStringWithOptions(0);
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
    Form.prototype.showPage = function (me, pageName, context, folder) {
        if (me)
            me.childPage = pageName;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUEyQztBQUMzQywrQkFBaUM7QUFFakMsa0RBQW9EO0FBQ3BELDhDQUFnRDtBQUNoRCxrQ0FBbUM7QUFHbkMsMENBQTRDO0FBQzVDLDBDQUE0QztBQUM1Qyw0Q0FBOEM7QUFDOUMsaUZBQWlGO0FBRWpGLDBEQUF3RDtBQUN4RCxxQ0FBNEM7QUFDNUMscUNBQWlDO0FBTWpDLHlCQUF5QjtBQUN6QjtJQUFBO0lBb0RBLENBQUM7SUFsREEseURBQXlEO0lBQ2xELHNDQUFzQixHQUE3QixVQUFpQyxPQUFzQixFQUFFLElBQVM7UUFDakUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJELEdBQUcsQ0FBQyxDQUFDLElBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMs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RyxFQUFFLENBQUM7QUFDaEIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFBLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2QsUUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QixRQUFBLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2xCLFFBQUEsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsUUFBQSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gXCJhcHBsaWNhdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSBcIm1vbWVudFwiO1xyXG5pbXBvcnQgKiBhcyB2aWV3IGZyb20gXCJ1aS9jb3JlL3ZpZXdcIjtcclxuaW1wb3J0ICogYXMgb2JzZXJ2YWJsZU1vZHVsZSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlXCI7XHJcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW1Nb2R1bGUgZnJvbSBcImZpbGUtc3lzdGVtXCI7XHJcbmltcG9ydCB7IHRvcG1vc3QgfSBmcm9tICd1aS9mcmFtZSc7XHJcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd1aS9wYWdlJztcclxuXHJcbmltcG9ydCAqIGFzIHBob25lIGZyb20gXCJuYXRpdmVzY3JpcHQtcGhvbmVcIjtcclxuaW1wb3J0ICogYXMgZW1haWwgZnJvbSBcIm5hdGl2ZXNjcmlwdC1lbWFpbFwiO1xyXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2h0dHBcIjtcclxuLy9pbXBvcnQgKiBhcyBhdXRvY29tcGxldGVNb2R1bGUgZnJvbSAnbmF0aXZlc2NyaXB0LXRlbGVyaWstdWktcHJvL2F1dG9jb21wbGV0ZSc7XHJcblxyXG5pbXBvcnQgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlLWFycmF5XCI7XHJcbmltcG9ydCB7IGlzQW5kcm9pZCwgaXNJT1MgfSBmcm9tIFwicGxhdGZvcm1cIjtcclxuaW1wb3J0IHsgaW9zIH0gZnJvbSBcInV0aWxzL3V0aWxzXCJcclxuXHJcbmRlY2xhcmUgdmFyIGFuZHJvaWQ6IGFueTtcclxuZGVjbGFyZSB2YXIgamF2YTogYW55O1xyXG5kZWNsYXJlIHZhciBOU0RhdGE6IGFueTtcclxuXHJcbi8vTWlzY2VsbGFuaW91cyBGdW5jdGlvbnNcclxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcclxuXHJcblx0Ly9DcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IGZyb20gYW4gZXhpc3Rpbmcgb25lXHJcblx0cHVibGljIGNyZWF0ZUluc3RhbmNlRnJvbUpzb248VD4ob2JqVHlwZTogeyBuZXcoKTogVDsgfSwganNvbjogYW55KSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Y29uc3QgbmV3T2JqID0gbmV3IG9ialR5cGUoKTtcclxuXHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBvYmpUeXBlW1wicmVsYXRpb25zaGlwc1wiXSB8fCB7fTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4ganNvbikge1xyXG5cdFx0XHRpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG5cdFx0XHRcdGlmIChuZXdPYmpbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0aWYgKHJlbGF0aW9uc2hpcHNbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRuZXdPYmpbcHJvcF0gPSBqc29uW3Byb3BdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdG5ld09ialtwcm9wXSA9IG1lLmNyZWF0ZUluc3RhbmNlRnJvbUpzb24ocmVsYXRpb25zaGlwc1twcm9wXSwganNvbltwcm9wXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBQcm9wZXJ0eSAke3Byb3B9IG5vdCBzZXQgYmVjYXVzZSBpdCBhbHJlYWR5IGV4aXN0ZWQgb24gdGhlIG9iamVjdC5gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3T2JqO1xyXG5cdH1cclxuXHJcblx0Ly9hZGRzIG1pc3NpbmcgZnVuY3Rpb25zIHRvIG9iamVjdFxyXG5cdHB1YmxpYyBpbml0T2JqZWN0PFQ+KG9ialR5cGU6IHsgbmV3KCk6IFQ7IH0sIGpzb246IGFueSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGNvbnN0IG5ld09iaiA9IG5ldyBvYmpUeXBlKCk7XHJcblx0XHRjb25zdCByZWxhdGlvbnNoaXBzID0gb2JqVHlwZVtcInJlbGF0aW9uc2hpcHNcIl0gfHwge307XHJcblxyXG5cdFx0Zm9yIChjb25zdCBwcm9wIGluIG5ld09iaikge1xyXG5cdFx0XHRpZiAobmV3T2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKGBBZGQgJHtwcm9wfS5gKTtcclxuXHRcdFx0XHRpZiAoanNvbltwcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRpZiAocmVsYXRpb25zaGlwc1twcm9wXSA9PSBudWxsKSB7XHJcblx0XHRcdFx0XHRcdGpzb25bcHJvcF0gPSBuZXdPYmpbcHJvcF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0anNvbltwcm9wXSA9IG1lLmNyZWF0ZUluc3RhbmNlRnJvbUpzb24ocmVsYXRpb25zaGlwc1twcm9wXSwgbmV3T2JqW3Byb3BdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFByb3BlcnR5ICR7cHJvcH0gbm90IHNldCBiZWNhdXNlIGl0IGFscmVhZHkgZXhpc3RlZCBvbiB0aGUgb2JqZWN0LmApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogVGFnZ2luZyBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFRhZ2dpbmcge1xyXG5cclxuXHQvKiogZGVmYXVsdCB0YWcgaWNvbiAqL1xyXG5cdHB1YmxpYyB0YWdJY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwNDYpO1xyXG5cdC8qKiBkZWZhdWx0IHVudGFnIGljb24gKi9cclxuXHRwdWJsaWMgdW5UYWdJY29uID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwOTYpO1xyXG5cclxuXHQvKiogQ3JlYXRlIGEgbmV3IG9ic2VydmFibGUgdGFnIG9iamVjdFxyXG5cdCogSWYgaWNvbiBpcyBsZWZ0IGJsYW5rIHRoZSBkZWZhdWx0IGljb24gaXMgdXNlZCBcclxuXHQqL1xyXG5cdHB1YmxpYyBuZXdUYWcoaWNvbj86IHN0cmluZyk6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSB7XHJcblx0XHRpZiAoIWljb24pIGljb24gPSB0aGlzLnVuVGFnSWNvbjtcclxuXHRcdHZhciBhID0gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSgpO1xyXG5cdFx0YS5zZXQoXCJ2YWx1ZVwiLCBpY29uKTtcclxuXHRcdHJldHVybiBhO1xyXG5cdFx0Ly9cdFx0cmV0dXJuIG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoeyB2YWx1ZTogaWNvbiB9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBzZXQgYWxsIGFycmF5IG9iamVjdHMgdGFnIHByb3BlcnR5IHRvIHRoZSBkZWZhdWx0IHRhZ2dlZCBpY29uIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0YWdBbGwoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoIWFycmF5W2ldLnRhZykgYXJyYXlbaV0udGFnID0gdGFnZ2luZy5uZXdUYWcoKTtcclxuXHRcdFx0YXJyYXlbaV0udGFnLnNldChcInZhbHVlXCIsIHRhZ2dpbmcudGFnSWNvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cdC8qKiBzZXQgYWxsIGFycmF5IG9iamVjdHMgdGFnIHByb3BlcnR5IHRvIHRoZSBkZWZhdWx0IHVudGFnZ2VkIGljb24gb2JqZWN0ICovXHJcblx0cHVibGljIHVuVGFnQWxsKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICghYXJyYXlbaV0udGFnKSBhcnJheVtpXS50YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0XHRhcnJheVtpXS50YWcuc2V0KFwidmFsdWVcIiwgdGFnZ2luZy51blRhZ0ljb24pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHQvKiogZ2V0IHRoZSB0b2dnbGVkIHRhZyBpY29uICovXHJcblx0cHVibGljIHRvZ2dsZVRhZ0ljb24oaWNvbjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGlmIChpY29uID09IHRoaXMudGFnSWNvbikge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy51blRhZ0ljb247XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50YWdJY29uO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIFRvZ2dsZSB0YWcgb2JzZXJ2YWJsZSAqL1xyXG5cdHB1YmxpYyB0b2dnbGVUYWcodGFnOiBhbnkpOiBhbnkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghdGFnKSB0YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0dmFyIGljb24gPSB0YWdnaW5nLnRvZ2dsZVRhZ0ljb24odGFnLmdldChcInZhbHVlXCIpKTtcclxuXHRcdHRhZy5zZXQoXCJ2YWx1ZVwiLCBpY29uKTtcclxuXHRcdHJldHVybiB0YWc7XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRoZSByb3dzIHRhZyBwcm9wZXJ0eSAqL1xyXG5cdHB1YmxpYyB0b2dnbGVSb3cocm93OiBhbnkpOiBhbnkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghcm93KSByZXR1cm4gbnVsbDtcclxuXHRcdG1lLnRvZ2dsZVRhZyhyb3cudGFnKTtcclxuXHRcdHJldHVybiByb3c7XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRoZSBvYnNlcnZhYmxlIHRhZyBvYmplY3QgKi9cclxuXHRwdWJsaWMgdG9nZ2xlT2JzZXJ2YWJsZShvYmVydmFibGVUYWc6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSk6IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5uZXdUYWcodGhpcy50b2dnbGVUYWdJY29uKG9iZXJ2YWJsZVRhZy5nZXQoXCJ2YWx1ZVwiKSkpO1xyXG5cdH1cclxuXHQvKiogVG9nZ2xlIHRoZSBvYnNlcnZhYmxlIHJvd3MgdGFnIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0b2dnbGVPYnNlcnZhYmxlUm93KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55PiwgaW5kZXg6IG51bWJlcik6IE9ic2VydmFibGVBcnJheTxhbnk+IHtcclxuXHRcdHZhciByb3cgPSB0aGlzLnRvZ2dsZVJvdyhhcnJheS5nZXRJdGVtKGluZGV4KSk7XHJcblx0XHRhcnJheS5zZXRJdGVtKGluZGV4LCByb3cpO1xyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGNvdW50KGFycmF5OiBhbnlbXSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gMDtcclxuXHRcdHJldHVybiBhcnJheS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiBnZXQgbnVtYmVyIG9mIHRhZ2dlZCBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnRUYWdnZWQoYXJyYXk6IGFueVtdKTogbnVtYmVyIHtcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiAwO1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGFnZ2VkUm93cyhhcnJheSkubGVuZ3RoO1xyXG5cdH1cclxuXHQvKiogZ2V0IG51bWJlciBvZiB1bnRhZ2dlZCBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnRVbnRhZ2dlZChhcnJheTogYW55W10pOiBudW1iZXIge1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIDA7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUYWdnZWRSb3dzKGFycmF5KS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiByZXR1cm4gdGhlIHRhZ2dlZCByb3dzIGZyb20gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGdldFRhZ2dlZFJvd3MoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiBudWxsO1xyXG5cdFx0dmFyIHRhZ2dlZFJvd3MgPSBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4LnRhZyAmJiB4LnRhZy5nZXQoXCJ2YWx1ZVwiKSA9PSBtZS50YWdJY29uKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRhZ2dlZFJvd3M7XHJcblx0fVxyXG5cdC8qKiByZXR1cm4gdGhlIHVudGFnZ2VkIHJvd3MgZnJvbSB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgZ2V0VW5UYWdnZWRSb3dzKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgdGFnZ2VkUm93cyA9IGFycmF5LmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cdFx0XHRyZXR1cm4gKHgudGFnICYmIHgudGFnLmdldChcInZhbHVlXCIpID09IG1lLnVuVGFnSWNvbik7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiB0YWdnZWRSb3dzO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKiogU3FsIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgU3FsIHtcclxuXHQvL290aGVyXHJcblx0LyoqIHJldHVybiBhIHNxbCBzbmlwcGVkIHRvIGZldGNoIGEgY2xhcmlvbiBkYXRlIGZyb20gdGhlIGRhdGFiYXNlIGFzIGEgc3RhbmRhcmQgZGF0ZSovXHJcblx0cHVibGljIGRhdGUoZmllbGQpIHtcclxuXHRcdHJldHVybiBgY29udmVydCh2YXJjaGFyLGNvbnZlcnQoZGF0ZXRpbWUsJHtmaWVsZH0tMzYxNjMpLDEwMylgO1xyXG5cdH1cclxufVxyXG5cclxuLyoqIFN0cmluZyBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFN0ciB7XHJcblxyXG5cdHB1YmxpYyBjYXBpdGFsaXNlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFx3XFxTKi9nLCBmdW5jdGlvbiAodHh0KSB7IHJldHVybiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7IH0pO1xyXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xyXG5cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBiYXNlNjRFbmNvZGUoYnl0ZXM6IGFueSk6IHN0cmluZyB7XHJcblx0XHRpZiAoaXNBbmRyb2lkKSB7XHJcblx0XHRcdHJldHVybiBhbmRyb2lkLnV0aWwuQmFzZTY0LmVuY29kZVRvU3RyaW5nKGJ5dGVzLCBhbmRyb2lkLnV0aWwuQmFzZTY0Lk5PX1dSQVApO1xyXG5cdFx0fSBlbHNlIGlmIChpc0lPUykge1xyXG5cdFx0XHRyZXR1cm4gYnl0ZXMuYmFzZTY0RW5jb2RlZFN0cmluZ1dpdGhPcHRpb25zKDApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIGJhc2U2NERlY29kZShzdHJpbmc6IHN0cmluZyk6IGFueSB7XHJcblx0XHRpZiAoaXNBbmRyb2lkKSB7XHJcblx0XHRcdHJldHVybiBhbmRyb2lkLnV0aWwuQmFzZTY0LmRlY29kZShzdHJpbmcsIGFuZHJvaWQudXRpbC5CYXNlNjQuREVGQVVMVCk7XHJcblx0XHR9IGVsc2UgaWYgKGlzSU9TKSB7XHJcblx0XHRcdHJldHVybiBOU0RhdGEuYWxsb2MoKS5pbml0V2l0aEJhc2U2NEVuY29kaW5nKHN0cmluZyk7O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIFVSSSBlbmNvZGVkIHN0cmluZyAqL1xyXG5cdHB1YmxpYyBmaXhlZEVuY29kZVVSSUNvbXBvbmVudCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHVybCkucmVwbGFjZSgvWyEnKCkqXS9nLCBmdW5jdGlvbiAoYykge1xyXG5cdFx0XHRyZXR1cm4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIG9ic2VydmFibGUgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBmaWx0ZXJBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4W3NlYXJjaEZpZWxkXSAmJiB4W3NlYXJjaEZpZWxkXS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBuZXcgT2JzZXJ2YWJsZUFycmF5KGZpbHRlcmVkRGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgb2JzZXJ2YWJsZSBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGRzKHByb3BlcnRpZXMpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGZpbHRlckFycmF5QnlBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZ1tdLCBzZWFyY2hUZXh0OiBzdHJpbmcpIHtcclxuXHRcdHNlYXJjaFRleHQgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKClcclxuXHRcdHZhciBmaWx0ZXJlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hGaWVsZC5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGlmICh4W3NlYXJjaEZpZWxkW2ldXSAmJiB4W3NlYXJjaEZpZWxkW2ldXS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmV3IE9ic2VydmFibGVBcnJheShmaWx0ZXJlZERhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiB0cnVlIGlmIHRlIHN0cmluZyBpcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgaW5MaXN0KHZhbHVlOiBzdHJpbmcsIGxpc3RBcnJheTogc3RyaW5nW10pOiBib29sZWFuIHtcclxuXHRcdGlmIChsaXN0QXJyYXkuaW5kZXhPZih2YWx1ZSkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIHRydWUgaWYgYSBzdHJpbmcgY29udGFpbnMgYW55IGl0ZW0gaW4gdGhlIHN1YnN0cmluZyBhcnJheSkgKi9cclxuXHRwdWJsaWMgY29udGFpbnNBbnkoc3RyOiBzdHJpbmcsIHN1YnN0cmluZ3M6IHN0cmluZ1tdKTogYm9vbGVhbiB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSAhPSBzdWJzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmIChzdHIuaW5kZXhPZihzdWJzdHJpbmdzW2ldKSAhPSAtIDEpIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqIGZpbmQgaW5kZXggaW4gYXJyYXkgb2Ygb2JqZWN0cyAqL1xyXG5cdHB1YmxpYyBhcnJheUluZGV4T2YoYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KTogbnVtYmVyIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpICE9IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBmaWVsZCA9IGFycmF5W2ldW3NlYXJjaEZpZWxkXTtcclxuXHRcdFx0aWYgKGZpZWxkID09IHNlYXJjaFZhbHVlKSByZXR1cm4gaTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAtMTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGQocHJvcGVydHkpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGdldEFycmF5SXRlbXMoYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KSB7XHJcblx0XHRyZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChvYmopIHtcclxuXHRcdFx0cmV0dXJuIG9ialtzZWFyY2hGaWVsZF0gPT0gc2VhcmNoVmFsdWU7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkcyhwcm9wZXJ0aWVzKSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheUl0ZW1zQnlBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZ1tdLCBzZWFyY2hUZXh0OiBzdHJpbmcpIHtcclxuXHRcdGlmICghc2VhcmNoVGV4dCkgcmV0dXJuIGRhdGE7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoRmllbGQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoeFtzZWFyY2hGaWVsZFtpXV0gJiYgeFtzZWFyY2hGaWVsZFtpXV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIGZpbHRlcmVkRGF0YTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGZpcnN0IGl0ZW0gZnJvbSBhbiBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGQocHJvcGVydHkpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGdldEFycmF5SXRlbShhcnJheTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmcsIHNlYXJjaFZhbHVlOiBhbnkpIHtcclxuXHRcdHJldHVybiB0aGlzLmdldEFycmF5SXRlbXMoYXJyYXksIHNlYXJjaEZpZWxkLCBzZWFyY2hWYWx1ZSlbMF07XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhbiBhcnJheSB0byBhbmQgb2JzZXJ2YWJsZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBvYnNlcnZhYmxlQXJyYXk8VD4oYXJyYXk/OiBBcnJheTxhbnk+KTogT2JzZXJ2YWJsZUFycmF5PFQ+IHtcclxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IG5ldyBPYnNlcnZhYmxlQXJyYXkoYXJyYXkpO1xyXG5cdFx0cmV0dXJuVmFsdWUuc3BsaWNlKDApO1xyXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYW4gYXJyYXkgdG8gYW5kIG9ic2VydmFibGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgb2JzZXJ2YWJsZShvYmopIHtcclxuXHRcdHJldHVybiBvYnNlcnZhYmxlTW9kdWxlLmZyb21PYmplY3Qob2JqKTtcclxuXHR9XHJcblxyXG5cdC8qKiBDcmVhdGUgb2JzZXJ2YWJsZWVkIHJvdyBmaWVsZHMgYXMgT2JzZXJ2YWJsZXMgb2JqZWN0cyB0byBwYXJlbnQgYXMgdGFibGVuYW1lX2ZpZWxkbmFtZSAgKi9cclxuXHRwdWJsaWMgb2JqVG9PYnNlcnZhYmxlKG1lOiBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUsIG9iajogb2JqZWN0LCBwcmVmaXg/OiBzdHJpbmcpIHtcclxuXHRcdGlmICghbWUpIHJldHVybjtcclxuXHRcdE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcblx0XHRcdG1lLnNldCgocHJlZml4IHx8ICcnKSArIFwiX1wiICsga2V5LCBvYmpba2V5XSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBjaGVjayBpZiBvYmplY3QgaXMgZW1wdHkgICovXHJcblx0cHVibGljIGlzRW1wdHlPYmplY3Qob2JqKSB7XHJcblx0XHRyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5sZW5ndGggPT09IDA7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IGEgY29sdW1uIGFycmF5IGZyb20gYW4gb2JqZWN0ICAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtQXJyYXlGcm9tT2JqZWN0KGFycmF5OiBBcnJheTxhbnk+LCBvYmplY3ROYW1lOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcclxuXHRcdHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHhbb2JqZWN0TmFtZV07IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHJlcGxhY2VzIGFuIGV4aXN0aW5nIG9ic2VydmFibGVBcnJheXMgZGF0YSB3aXRoIGEgbmV3IGFycmF5ICAqL1xyXG5cdHB1YmxpYyByZXBsYWNlQXJyYXkoYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCB3aXRoQXJyYXk6IGFueSkge1xyXG5cdFx0YXJyYXkuc3BsaWNlKDApO1xyXG5cdFx0dGhpcy5hcHBlbmRBcnJheShhcnJheSwgd2l0aEFycmF5KVxyXG5cdH1cclxuXHJcblx0LyoqIGFwcGVuZHMgYW4gZXhpc3Rpbmcgb2JzZXJ2YWJsZUFycmF5cyBkYXRhIHdpdGggYSBuZXcgYXJyYXkgICovXHJcblx0cHVibGljIGFwcGVuZEFycmF5KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55Piwgd2l0aEFycmF5OiBhbnkpIHtcclxuXHRcdC8vXHRvYnNlcnZhYmxlIGFycmF5IGNhdXNlcyBwcm9ibGVtcyBpZiB0aGUgYXJyYXkgaXRlbSBpcyBub3QgYW4gb2JzZXJ2YWJsZS5cclxuXHRcdC8vICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgd2l0aEFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xyXG5cdFx0Ly8gXHQgIGFycmF5LnB1c2god2l0aEFycmF5W2luZGV4XSk7XHJcblx0XHQvLyAgfVxyXG5cdFx0aWYgKCF3aXRoQXJyYXkpIHJldHVybjtcclxuXHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB3aXRoQXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XHJcblx0XHRcdHZhciByb3cgPSB3aXRoQXJyYXlbaW5kZXhdO1xyXG5cdFx0XHR2YXIgb1JvdyA9IG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoKTtcclxuXHRcdFx0T2JqZWN0LmtleXMocm93KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdFx0XHRvUm93LnNldChrZXksIHJvd1trZXldKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGFycmF5LnB1c2gob1Jvdyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgRW51bVRvQXJyYXkoRW51bU9iaik6IHN0cmluZ1tdIHtcclxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIga2V5IGluIEVudW1PYmopIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBFbnVtT2JqW2tleV0gPT09IFwic3RyaW5nXCIpIHJldHVyblZhbHVlLnB1c2goRW51bU9ialtrZXldLnJlcGxhY2UoL18vZywgXCIgXCIpKTtcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblx0fVxyXG5cclxuXHQvKiogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBLOlYgZnJvbSBhIGxpc3Qgb2Ygc3RyaW5ncyAqL1xyXG5cdHB1YmxpYyBzdHJFbnVtPFQgZXh0ZW5kcyBzdHJpbmc+KG86IEFycmF5PFQ+KToge1tLIGluIFRdOiBLIH0ge1xyXG5cdFx0cmV0dXJuIG8ucmVkdWNlKChyZXMsIGtleSkgPT4ge1xyXG5cdFx0XHRyZXNba2V5XSA9IGtleTtcclxuXHRcdFx0cmV0dXJuIHJlcztcclxuXHRcdH0sIE9iamVjdC5jcmVhdGUobnVsbCkpO1xyXG5cdH1cclxuXHJcblxyXG5cclxufVxyXG5cclxuLyoqIERhdGUgRnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBEdCB7XHJcblxyXG5cdHB1YmxpYyBtb21lbnQoZGF0ZT86IERhdGUpOiBtb21lbnQuTW9tZW50IHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHVibGljIER1cmF0aW9uKHNlY29uZHM6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIHNlY29uZHMgPSBNYXRoLmZsb29yKHNlY29uZHMpO1xyXG5cdFx0dmFyIGhvdXJzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gMzYwMCk7XHJcblx0XHR2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoKHNlY29uZHMgLSAoaG91cnMgKiAzNjAwKSkgLyA2MCk7XHJcblx0XHR2YXIgc2Vjb25kcyA9IHNlY29uZHMgLSAoaG91cnMgKiAzNjAwKSAtIChtaW51dGVzICogNjApO1xyXG5cclxuXHRcdHZhciBob3Vyc1N0ciA9IChob3VycyA8IDEwID8gJzAnIDogJycpICsgaG91cnMudG9TdHJpbmcoKTtcclxuXHRcdHZhciBtaW51dGVzU3RyID0gKG1pbnV0ZXMgPCAxMCA/ICcwJyA6ICcnKSArIG1pbnV0ZXMudG9TdHJpbmcoKTtcclxuXHRcdHZhciBzZWNvbmRzU3RyID0gKHNlY29uZHMgPCAxMCA/ICcwJyA6ICcnKSArIHNlY29uZHMudG9TdHJpbmcoKTtcclxuXHRcdHJldHVybiAoaG91cnMgPyBob3Vyc1N0ciArICc6JyA6ICcnKSArIG1pbnV0ZXNTdHIgKyAnOicgKyBzZWNvbmRzU3RyO1xyXG5cdH1cclxuXHJcblx0Ly9ZZWFycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIHllYXIgdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGRZZWFycyhkYXk6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChkYXksICd5ZWFycycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHQvKiogc3RhcnQgb2YgeWVhciAqL1xyXG5cdHB1YmxpYyBkYXRlWWVhclN0YXJ0KGRhdGU/OiBEYXRlLCBhZGRZZWFycz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuc3RhcnRPZigneWVhcicpLmFkZChhZGRZZWFycyB8fCAwLCBcInllYXJzXCIpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGVuZCBvZiB5ZWFyICovXHJcblx0cHVibGljIGRhdGVZZWFyRW5kKGRhdGU/OiBEYXRlLCBhZGRZZWFycz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZW5kT2YoJ3llYXInKS5hZGQoYWRkWWVhcnMgfHwgMCwgXCJ5ZWFyc1wiKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vTW9udGhzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBtb250aCB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZE1vbnRocyhkYXk6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChkYXksICdtb250aHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblx0LyoqIHN0YXJ0IG9mIG1vbnRoICovXHJcblx0cHVibGljIGRhdGVNb250aFN0YXJ0KGRhdGU/OiBEYXRlLCBhZGRNb250aHM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ21vbnRoJykuYWRkKGFkZE1vbnRocyB8fCAwLCAnbW9udGhzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvKiogZW5kIG9mIG1vbnRoICovXHJcblx0cHVibGljIGRhdGVNb250aEVuZChkYXRlPzogRGF0ZSwgYWRkTW9udGhzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5lbmRPZignbW9udGgnKS5hZGQoYWRkTW9udGhzIHx8IDAsICdtb250aHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vRGF5cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBkYXkgdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGREYXlzKGRheTogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGRheSwgJ2RheXMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vV2Vla3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBzdGFydCBvZiB3ZWVrICovXHJcblx0cHVibGljIGRhdGVXZWVrU3RhcnQoZGF0ZT86IERhdGUsIGFkZFdlZWtzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5zdGFydE9mKCdpc29XZWVrJykuYWRkKGFkZFdlZWtzIHx8IDAsICd3ZWVrcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHQvKiogZW5kIG9mIHdlZWsgKi9cclxuXHRwdWJsaWMgZGF0ZVdlZWtFbmQoZGF0ZT86IERhdGUsIGFkZFdlZWtzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5lbmRPZignaXNvV2VlaycpLmFkZChhZGRXZWVrcyB8fCAwLCAnd2Vla3MnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vSG91cnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgaG91ciB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZEhvdXJzKGhvdXI6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChob3VyLCAnaG91cnMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vTWludXRlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSBtaW51dGVzIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkTWludXRlcyhtaW51dGVzOiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQobWludXRlcywgJ21pbnV0ZXMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8vY29udmVydCB0byBzdHJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoWVlZWS1NTS1ERCkgKi9cclxuXHRwdWJsaWMgZGF0ZVRvU3RyWU1EKGRhdGU/OiBEYXRlKTogc3RyaW5nIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChERC9NTS9ZWVlZKSAqL1xyXG5cdHB1YmxpYyBkYXRlVG9TdHIoZGF0ZT86IERhdGUsIGZvcm1hdD86ICdERC9NTS9ZWVknIHwgJ1lZWVktTU0tREQnIHwgJ0QgTU1NIFlZWVknIHwgJ0QgTU1NTSBZWVlZJyB8IFwiWVlZWU1NRERISG1tc3NcIik6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGQgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XHJcblx0XHRzd2l0Y2ggKGZvcm1hdCkge1xyXG5cdFx0XHRjYXNlIFwiRCBNTU1NIFlZWVlcIjpcclxuXHRcdFx0XHRyZXR1cm4gZC5nZXREYXRlKCkgKyAnICcgKyBtZS5tb250aE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdGNhc2UgXCJEIE1NTSBZWVlZXCI6XHJcblx0XHRcdFx0cmV0dXJuIGQuZ2V0RGF0ZSgpICsgJyAnICsgbWUubW9udGhTaG9ydE5hbWUoZC5nZXRNb250aCgpICsgMSkgKyAnICcgKyBkLmdldEZ1bGxZZWFyKCk7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIG1vbWVudChkKS5mb3JtYXQoZm9ybWF0IHx8ICdERC9NTS9ZWVlZJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKEREL01NL1lZWVkpICovXHJcblx0cHVibGljIHRpbWVUb1N0cihkYXRlPzogRGF0ZSk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnaGg6bW0gQScpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBzdHJpbmcgdG8gYSBkYXRlIFxyXG5cdCAqKiBEZWZhdWx0IGZvcm1hdDogIChERC9NTS9ZWVlZKSAgXHJcblx0Ki9cclxuXHRwdWJsaWMgc3RyVG9EYXRlKGRhdGU6IHN0cmluZywgZm9ybWF0Pzogc3RyaW5nKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0bW9tZW50KCkudG9EYXRlKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpZiAoZm9ybWF0KSBkYXRlID0gZGF0ZS5zdWJzdHIoMCwgZm9ybWF0Lmxlbmd0aCk7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSwgZm9ybWF0IHx8ICdERC9NTS9ZWVlZJykudG9EYXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIG1vbWVudCBvYmplY3QgKi9cclxuXHRwdWJsaWMgc3RyVG9Nb21lbnQoZGF0ZTogc3RyaW5nKSB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlLCAnREQvTU0vWVlZWScpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgY2xhcmlvbkRhdGUoZGF0ZT86IERhdGUpOiBudW1iZXIge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHZhciBvbmVEYXkgPSAyNCAqIDYwICogNjAgKiAxMDAwOyAvLyBob3VycyptaW51dGVzKnNlY29uZHMqbWlsbGlzZWNvbmRzXHJcblx0XHR2YXIgc3RhcnREYXRlID0gbmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKTtcclxuXHRcdHZhciBkaWZmRGF5cyA9IE1hdGgucm91bmQoTWF0aC5hYnMoKGRhdGUuZ2V0VGltZSgpIC0gc3RhcnREYXRlLmdldFRpbWUoKSkgLyAob25lRGF5KSkpXHJcblx0XHRyZXR1cm4gZGlmZkRheXNcclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25EYXRlVG9EYXRlKGNsYXJpb25EYXRlPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWNsYXJpb25EYXRlKSByZXR1cm4gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiB0aGlzLmRhdGVBZGREYXlzKGNsYXJpb25EYXRlLCBuZXcgRGF0ZShcIkRlY2VtYmVyIDI4LCAxODAwXCIpKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBzaG9ydE1vbnRoKGNsYXJpb25EYXRlPzogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZGF0ZSA9IG1lLmNsYXJpb25EYXRlVG9EYXRlKGNsYXJpb25EYXRlKTtcclxuXHRcdHJldHVybiBtZS5tb250aFNob3J0TmFtZShkYXRlLmdldE1vbnRoKCkgKyAxKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBtb250aFllYXIoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBkYXRlID0gbWUuY2xhcmlvbkRhdGVUb0RhdGUoY2xhcmlvbkRhdGUpO1xyXG5cdFx0cmV0dXJuIG1lLm1vbnRoU2hvcnROYW1lKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgJ2AnICsgZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCkuc3Vic3RyKDIsIDIpO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBzaG9ydCBkZXNjcmlwdGlvbiBmb3IgbW9udGggKi9cclxuXHRwdWJsaWMgbW9udGhTaG9ydE5hbWUobW9udGg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoIW1vbnRoKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgbW9udGhfbmFtZXNfc2hvcnQgPSBbJycsICdKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddO1xyXG5cdFx0dmFyIG1vbnRoTmFtZSA9IG1vbnRoX25hbWVzX3Nob3J0W21vbnRoXTtcclxuXHRcdHJldHVybiBtb250aE5hbWU7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHNob3J0IGRlc2NyaXB0aW9uIGZvciBtb250aCAqL1xyXG5cdHB1YmxpYyBtb250aE5hbWUobW9udGg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoIW1vbnRoKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgbW9udGhfbmFtZXNfc2hvcnQgPSBbJycsICdKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvdmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ107XHJcblx0XHR2YXIgbW9udGhOYW1lID0gbW9udGhfbmFtZXNfc2hvcnRbbW9udGhdO1xyXG5cdFx0cmV0dXJuIG1vbnRoTmFtZTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgc2hvcnQgZGVzY3JpcHRpb24gZm9yIG1vbnRoICovXHJcblx0cHVibGljIGRheU9mV2VlayhkYXRlOiBEYXRlLCBvcHRpb24/OiBcIlNob3J0XCIgfCBcIkxvbmdcIik6IHN0cmluZyB7XHJcblx0XHRpZiAoIWRhdGUpIHJldHVybiAnJztcclxuXHRcdHZhciBkYXlfbmFtZXNfc2hvcnQgPSBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF0ZScsICdTYXR1cmRheSddO1xyXG5cdFx0dmFyIGRheV9uYW1lc19sb25nID0gWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXTtcclxuXHRcdGlmIChvcHRpb24gPT0gXCJTaG9ydFwiKSB7XHJcblx0XHRcdHJldHVybiBkYXlfbmFtZXNfc2hvcnRbZGF0ZS5nZXREYXkoKV1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBkYXlfbmFtZXNfbG9uZ1tkYXRlLmdldERheSgpXVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25UaW1lKGRhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHR2YXIgbW10TWlkbmlnaHQgPSBtb21lbnQoZGF0ZSkuc3RhcnRPZignZGF5Jyk7XHJcblx0XHR2YXIgc2Vjb25kcyA9IG1vbWVudChkYXRlKS5kaWZmKG1tdE1pZG5pZ2h0LCAnc2Vjb25kcycpICogMTAwO1xyXG5cdFx0cmV0dXJuIHNlY29uZHNcclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiB0aW1lICovXHJcblx0cHVibGljIGNsYXJpb25UaW1lVG9EYXRlKGNsYXJpb25EYXRlPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWNsYXJpb25EYXRlKSByZXR1cm4gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQobmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKSkuYWRkKGNsYXJpb25EYXRlIC8gMTAwLCAnc2Vjb25kcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKEREL01NL1lZWVkpICovXHJcblx0cHVibGljIGRpZmZEYXlzKGZyb21EYXRlOiBEYXRlLCB0b0RhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZGF0ZSA9IG1vbWVudCh0b0RhdGUpO1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gZGF0ZS5kaWZmKGZyb21EYXRlLCBcImRheXNcIik7XHJcblx0XHRyZXR1cm4gaXNOYU4ocmV0dXJuVmFsdWUpID8gbnVsbCA6IHJldHVyblZhbHVlO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKiBnZXQgdGhlIGRheXMgZGlmZmVyZW50IGluIHdvcmRzICovXHJcblx0cHVibGljIGRpZmZEYXlzV29yZHMoZGF0ZTogRGF0ZSk6IHN0cmluZyB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFkYXRlKSByZXR1cm4gJyc7XHJcblx0XHR2YXIgZGF5cyA9IG1lLmRpZmZEYXlzKGRhdGUpO1xyXG5cdFx0c3dpdGNoIChkYXlzKSB7XHJcblx0XHRcdGNhc2UgbnVsbDpcclxuXHRcdFx0XHRyZXR1cm4gJyc7XHJcblx0XHRcdGNhc2UgLTE6XHJcblx0XHRcdFx0cmV0dXJuICd0b21vcnJvdyc7XHJcblx0XHRcdGNhc2UgMDpcclxuXHRcdFx0XHRyZXR1cm4gZHQudGltZVRvU3RyKGRhdGUpO1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0cmV0dXJuICd5ZXN0ZXJkYXknO1xyXG5cdFx0XHRjYXNlIDI6XHJcblx0XHRcdGNhc2UgMzpcclxuXHRcdFx0Y2FzZSA0OlxyXG5cdFx0XHRjYXNlIDU6XHJcblx0XHRcdGNhc2UgNjpcclxuXHRcdFx0XHRyZXR1cm4gZHQuZGF5T2ZXZWVrKGRhdGUpO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdHJldHVybiBkdC5kYXRlVG9TdHIoZGF0ZSwgXCJEIE1NTU0gWVlZWVwiKVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLyoqIEV4dHJhIGZ1bmN0aW9ucyB1c2VkIHdpdGggdmlld3MgKi9cclxuZXhwb3J0IGNsYXNzIFZpZXdFeHQge1xyXG5cclxuXHQvKiogcmVtb3ZlIHRoZSBmb2N1cyBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgY2xlYXJBbmREaXNtaXNzKHZpZXc6IHZpZXcuVmlld0Jhc2UpIHtcclxuXHRcdGlmICghdmlldykgcmV0dXJuO1xyXG5cdFx0dGhpcy5kaXNtaXNzU29mdElucHV0KHZpZXcpO1xyXG5cdFx0dGhpcy5jbGVhckZvY3VzKHZpZXcpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJlbW92ZSB0aGUgZm9jdXMgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGNsZWFyRm9jdXModmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHRpZiAoaXNBbmRyb2lkKSBpZiAodmlldy5hbmRyb2lkKSB2aWV3LmFuZHJvaWQuY2xlYXJGb2N1cygpO1xyXG5cdH1cclxuXHJcblx0LyoqIGhpZGUgdGhlIHNvZnQga2V5Ym9hcmQgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGRpc21pc3NTb2Z0SW5wdXQodmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHR0cnkge1xyXG5cdFx0XHQoPGFueT52aWV3KS5kaXNtaXNzU29mdElucHV0KCk7XHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVZhbHVlSXRlbSB7XHJcblx0VmFsdWVNZW1iZXI6IGFueTtcclxuXHREaXNwbGF5TWVtYmVyOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBhIHZhbHVlIGxpc3QgYXJyYXkgKi9cclxuZXhwb3J0IGNsYXNzIFZhbHVlTGlzdCB7XHJcblxyXG5cdC8qKiB0aGlzIGFycmF5IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHJpdmF0ZSBpdGVtczogQXJyYXk8SVZhbHVlSXRlbT47XHJcblxyXG5cdC8qKiB0aGUgbnVtYmVyIG9mIGl0ZW1zICovXHJcblx0Z2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGg7IH1cclxuXHJcblx0Y29uc3RydWN0b3IoYXJyYXk/OiBBcnJheTxJVmFsdWVJdGVtPikge1xyXG5cdFx0aWYgKGFycmF5KSB0aGlzLml0ZW1zID0gYXJyYXk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbShpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtRnJvbnQoaXRlbTogSVZhbHVlSXRlbSkge1xyXG5cdFx0dGhpcy5pdGVtcy51bnNoaWZ0KGl0ZW0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtcygpOiBBcnJheTxJVmFsdWVJdGVtPiB7XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtcztcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYW4gaXRlbSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0SXRlbShpbmRleDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUZXh0KGluZGV4KTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGRpc3BsYXkgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFRleHQoaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdLkRpc3BsYXlNZW1iZXI7XHJcblx0fVxyXG5cdC8qKiBnZXQgYW4gYXJyYXkgb2YgdGhlIGl0ZW1zIHRleHQgZmllbGQgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4LkRpc3BsYXlNZW1iZXI7IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFZhbHVlKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtc1tpbmRleF0uVmFsdWVNZW1iZXI7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBpbmRleCBieSBpdHMgdmFsdWUsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cclxuXHRwdWJsaWMgZ2V0SW5kZXgodmFsdWU6IGFueSwgZGVmYXVsdEluZGV4PzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAodGhpcy5nZXRWYWx1ZShpKSA9PSB2YWx1ZSkgcmV0dXJuIGk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGVmYXVsdEluZGV4ID09IG51bGwgPyAtMSA6IGRlZmF1bHRJbmRleDtcclxuXHR9XHJcbn1cclxuXHJcbi8qKiBhIHZhbHVlIGxpc3QgYXJyYXkgKi9cclxuZXhwb3J0IGNsYXNzIERpY3Rpb25hcnkge1xyXG5cclxuXHQvKiogdGhpcyBhcnJheSBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHByaXZhdGUgX2l0ZW1zID0gW107XHJcblx0LyoqIGdldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXQgaXRlbXMoKSB7IHJldHVybiB0aGlzLl9pdGVtcyB9XHJcblx0LyoqIHNldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBzZXQgaXRlbXMoYXJyYXkpIHsgdGhpcy5faXRlbXMgPSBhcnJheSB9XHJcblxyXG5cdHB1YmxpYyB2YWx1ZU1lbWJlck5hbWUgPSBcIlZhbHVlTWVtYmVyXCI7XHJcblx0cHVibGljIGRpc3BsYXlNZW1iZXJOYW1lID0gXCJEaXNwbGF5TWVtYmVyXCI7XHJcblxyXG5cdC8qKiB0aGUgbnVtYmVyIG9mIGl0ZW1zICovXHJcblx0cHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuaXRlbXMubGVuZ3RoOyB9XHJcblxyXG5cdGNvbnN0cnVjdG9yKGFycmF5PzogQXJyYXk8YW55PiwgdmFsdWVNZW1iZXJOYW1lPzogc3RyaW5nLCBkaXNwbGF5TWVtYmVyTmFtZT86IHN0cmluZykge1xyXG5cdFx0dGhpcy5hZGRJdGVtcyhhcnJheSwgdmFsdWVNZW1iZXJOYW1lLCBkaXNwbGF5TWVtYmVyTmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbShpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbXMoYXJyYXk6IEFycmF5PGFueT4sIHZhbHVlTWVtYmVyTmFtZTogc3RyaW5nLCBkaXNwbGF5TWVtYmVyTmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKGFycmF5KSBtZS5pdGVtcyA9IGFycmF5O1xyXG5cdFx0aWYgKHZhbHVlTWVtYmVyTmFtZSkgdGhpcy52YWx1ZU1lbWJlck5hbWUgPSB2YWx1ZU1lbWJlck5hbWU7XHJcblx0XHRpZiAoZGlzcGxheU1lbWJlck5hbWUpIHRoaXMuZGlzcGxheU1lbWJlck5hbWUgPSBkaXNwbGF5TWVtYmVyTmFtZTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW1Gcm9udChpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGFkZEl0ZW0gPSB7fTtcclxuXHRcdGFkZEl0ZW1bbWUudmFsdWVNZW1iZXJOYW1lXSA9IGl0ZW0uVmFsdWVNZW1iZXI7XHJcblx0XHRhZGRJdGVtW21lLmRpc3BsYXlNZW1iZXJOYW1lXSA9IGl0ZW0uRGlzcGxheU1lbWJlcjtcclxuXHRcdHRoaXMuaXRlbXMudW5zaGlmdChhZGRJdGVtKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogZ2V0IGFuIGl0ZW0gYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldEl0ZW0oaW5kZXg6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGV4dChpbmRleCk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBkaXNwbGF5IHZhbHVlIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0KGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1lLml0ZW1zW2luZGV4XVttZS5kaXNwbGF5TWVtYmVyTmFtZV07XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IGFuIGFycmF5IG9mIHRoZSBpdGVtcyBkaXNwbGF5IG1lbWJlcnMgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4W21lLmRpc3BsYXlNZW1iZXJOYW1lXTsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyB2YWx1ZU1lbWJlciBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VmFsdWUoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghbWUuaXRlbXMgfHwgbWUuaXRlbXMubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xyXG5cdFx0aWYgKGluZGV4ID09IHVuZGVmaW5lZCB8fCBpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcclxuXHRcdHJldHVybiBtZS5pdGVtc1tpbmRleF1bbWUudmFsdWVNZW1iZXJOYW1lXTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGluZGV4IGJ5IGl0cyB2YWx1ZU1lbWViZXIsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cdHB1YmxpYyBnZXRJbmRleCh2YWx1ZTogYW55LCBkZWZhdWx0SW5kZXg/OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAobWUuZ2V0VmFsdWUoaSkgPT0gdmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlZmF1bHRJbmRleCA9PSBudWxsID8gLTEgOiBkZWZhdWx0SW5kZXg7XHJcblx0fVxyXG59XHJcblxyXG4vKiogRmlsZSBhY2Nlc3MgZnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBGaWxlIHtcclxuXHJcblx0cHVibGljIGRvY3VtZW50Rm9sZGVyID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XHJcblxyXG5cdC8qKiBnZXQgYW4gYXBwbGljYXRpb24gZm9sZGVyICovXHJcblx0cHVibGljIGdldEFwcEZvbGRlcihmb2xkZXI6IHN0cmluZykge1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmN1cnJlbnRBcHAoKS5nZXRGb2xkZXIoZm9sZGVyKTtcclxuXHR9O1xyXG5cclxuXHQvKiogZ2V0IGFuIGFwcGxpY2F0aW9uIGZvbGRlciAqL1xyXG5cdHB1YmxpYyBnZXRBcHBGb2xkZXJQYXRoKGZvbGRlcjogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuY3VycmVudEFwcCgpLmdldEZvbGRlcihmb2xkZXIpLnBhdGg7XHJcblx0fTtcclxuXHJcblx0LyoqIGdldCBhbiBhcHBsaWNhdGlvbiBmdWxsIGZpbGVuYW1lICovXHJcblx0cHVibGljIGdldEFwcEZpbGVuYW1lKGZpbGVuYW1lOiBzdHJpbmcsIGZvbGRlcjogc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuY3VycmVudEFwcCgpLmdldEZvbGRlcihmb2xkZXIpLnBhdGggKyAnLycgKyBmaWxlbmFtZTtcclxuXHR9O1xyXG5cclxuXHQvKiogZ2V0IGFuIGFwcGxpY2F0aW9uIGZ1bGwgZmlsZW5hbWUgKi9cclxuXHRwdWJsaWMgZ2V0QXBwRmlsZUV4aXN0cyhmaWxlbmFtZTogc3RyaW5nLCBmb2xkZXI6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmN1cnJlbnRBcHAoKS5nZXRGb2xkZXIoZm9sZGVyKS5jb250YWlucyhmaWxlbmFtZSk7XHJcblx0fTtcclxuXHJcblx0LyoqIHJldHVybiBhbiBhcHBsaWNhdGlvbiBmaWxlICovXHJcblx0cHVibGljIGdldEFwcEZpbGUoZmlsZW5hbWU6IHN0cmluZywgZm9sZGVyOiBzdHJpbmcpIHtcclxuXHRcdHJldHVybiBmaWxlU3lzdGVtTW9kdWxlLmtub3duRm9sZGVycy5jdXJyZW50QXBwKCkuZ2V0Rm9sZGVyKGZvbGRlcikuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0fTtcclxuXHJcblx0LyoqIGV4dHJhY3QgZmlsZSBmcm9tIHBhdGggKi9cclxuXHRwdWJsaWMgZ2V0RmlsZW5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGlmICghcGF0aCkgcmV0dXJuICcnXHJcblx0XHRpZiAocGF0aC5pbmRleE9mKFwiL1wiKSA9PSAtMSkgcmV0dXJuIHBhdGg7XHJcblx0XHRyZXR1cm4gcGF0aC5zcGxpdChcIi9cIikucG9wKCk7XHJcblx0fTtcclxuXHJcblx0LyoqIGNoZWNrIGlmIG1lZGlhIGZpbGUgZXhpc3RzICovXHJcblx0cHVibGljIG1lZGlhRmlsZUV4aXN0cyhmaWxlbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0ZmlsZW5hbWUgPSBtZS5nZXRGaWxlbmFtZShmaWxlbmFtZSk7XHJcblx0XHRyZXR1cm4gbWUuZ2V0QXBwRmlsZUV4aXN0cyhmaWxlbmFtZSwgXCJtZWRpYVwiKTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYSBtZWRpYSBmaWxlIG9iamVjdCAqL1xyXG5cdHB1YmxpYyBtZWRpYUdldEZpbGUoZmlsZW5hbWU6IHN0cmluZyk6IGZpbGVTeXN0ZW1Nb2R1bGUuRmlsZSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0ZmlsZW5hbWUgPSBtZS5nZXRGaWxlbmFtZShmaWxlbmFtZSk7XHJcblx0XHRyZXR1cm4gZmlsZS5nZXRBcHBGb2xkZXIoXCJtZWRpYVwiKS5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgZnVsbG5hbWUgZm9yIG1lZGlhIGZpbGUgKi9cclxuXHRwdWJsaWMgbWVkaWFHZXRGdWxsTmFtZShmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRmaWxlbmFtZSA9IG1lLmdldEZpbGVuYW1lKGZpbGVuYW1lKTtcclxuXHRcdHJldHVybiBtZS5nZXRBcHBGb2xkZXJQYXRoKFwibWVkaWFcIikgKyBgLyR7ZmlsZW5hbWV9YDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyB0ZW1wRm9sZGVyID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMudGVtcCgpO1xyXG5cclxuXHRwdWJsaWMgZG93bmxvYWRGb2xkZXIgPSBpc0FuZHJvaWQgPyBhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZVB1YmxpY0RpcmVjdG9yeShhbmRyb2lkLm9zLkVudmlyb25tZW50LkRJUkVDVE9SWV9ET1dOTE9BRFMpLmdldEFic29sdXRlUGF0aCgpIDogJyc7XHJcblxyXG5cdC8qKiBsb2FkIGpzb24gZnJvbSBhIGZpbGUgKi9cclxuXHRwdWJsaWMgZXhpc3RzKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuZG9jdW1lbnRGb2xkZXIuY29udGFpbnMoZmlsZW5hbWUpO1xyXG5cdH1cclxuXHJcblx0LyoqIHNhdmUganNvbiB0byBhIGZpbGUgKi9cclxuXHRwdWJsaWMgc2F2ZUZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUud3JpdGVTeW5jKGRhdGEsIGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXNvbHZlKCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBsb2FkIGpzb24gZnJvbSBhIGZpbGUgKi9cclxuXHRwdWJsaWMgbG9hZEpTT05GaWxlKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG5cdFx0XHR2YXIgZmlsZSA9IG1lLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0XHRmaWxlLnJlYWRUZXh0KCkudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xyXG5cdFx0XHRcdHZhciByZXR1cm5WYWx1ZSA9IG51bGw7XHJcblx0XHRcdFx0aWYgKGNvbnRlbnQgIT0gXCJcIikgcmV0dXJuVmFsdWUgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xyXG5cdFx0XHRcdHJlc29sdmUocmV0dXJuVmFsdWUpO1xyXG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKiogc2F2ZSBqc29uIHRvIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBzYXZlSlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUud3JpdGVUZXh0KEpTT04uc3RyaW5naWZ5KGRhdGEpKS50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHRcdFx0cmVzb2x2ZShjb250ZW50KTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8qKiBlbXB0eSB0aGUgZmlsZSAqL1xyXG5cdHB1YmxpYyBjbGVhckpTT05GaWxlKGZpbGVuYW1lOiBzdHJpbmcsIGRhdGEpIHtcclxuXHRcdHZhciBmaWxlID0gdGhpcy5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdGZpbGUud3JpdGVUZXh0KEpTT04uc3RyaW5naWZ5KHt9KSk7XHJcblx0fVxyXG5cclxuXHQvLyoqIGNyZWF0ZSBhIGZ1bGwgZmlsZW5hbWUgaW5jbHVkaW5nIHRoZSBmb2xkZXIgZm9yIHRoZSBjdXJyZW50IGFwcCAqL1xyXG5cdHB1YmxpYyBnZXRGdWxsRmlsZW5hbWUoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBmaWxlU3lzdGVtTW9kdWxlLnBhdGguam9pbihtZS5kb2N1bWVudEZvbGRlci5wYXRoLCBmaWxlbmFtZSk7XHJcblx0fVxyXG5cdC8vKiogY3JlYXRlIGEgZnVsbCBmaWxlbmFtZSBpbmNsdWRpbmcgdGhlIHRlbXAgZm9sZGVyIGZvciB0aGUgY3VycmVudCBhcHAgKi9cclxuXHRwdWJsaWMgZ2V0RnVsbFRlbXBGaWxlbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUucGF0aC5qb2luKG1lLnRlbXBGb2xkZXIucGF0aCwgZmlsZW5hbWUpO1xyXG5cdH1cclxuXHQvLyBwdWJsaWMgZGVsZXRlRmlsZShwYXJ0eTogc3RyaW5nKSB7XHJcblx0Ly8gXHR2YXIgZmlsZSA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmRvY3VtZW50cygpLmdldEZpbGUocGFydHkpO1xyXG5cdC8vIFx0ZmlsZS5cclxuXHQvLyB9XHJcblxyXG5cclxuXHRwdWJsaWMgZG93bmxvYWRVcmwodXJsLCBmaWxlUGF0aCkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblxyXG5cdFx0XHRodHRwLmdldEZpbGUodXJsLCBmaWxlUGF0aCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y2FsbC5vcGVuRmlsZShmaWxlUGF0aCk7XHJcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gbmV3IEVycm9yKFwiRXJyb3IgZG93bmxvYWRpbmcgJ1wiICsgZmlsZVBhdGggKyBcIicuIFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEljb21wb3NlRW1haWwge1xyXG5cdHRvOiBzdHJpbmc7XHJcblx0c3ViamVjdD86IHN0cmluZztcclxuXHRib2R5Pzogc3RyaW5nO1xyXG5cdHNhbHV0YXRpb24/OiBzdHJpbmc7XHJcblx0ZGVhcj86IHN0cmluZztcclxuXHRyZWdhcmRzPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogY2FsbCB0aGlyZHBhcnR5IGFwcHMgKi9cclxuZXhwb3J0IGNsYXNzIENhbGwge1xyXG5cclxuXHQvKiogY29tcG9zZSBhbiBlbWFpbCAqL1xyXG5cdHB1YmxpYyBjb21wb3NlRW1haWwobWVzc2FnZTogSWNvbXBvc2VFbWFpbCkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBzdWJqZWN0ID0gKG1lc3NhZ2Uuc3ViamVjdCB8fCBcIlN1cHBvcnRcIik7XHJcblx0XHRpZiAoIW1lc3NhZ2UuYm9keSkge1xyXG5cdFx0XHRtZXNzYWdlLmJvZHkgPSAobWVzc2FnZS5zYWx1dGF0aW9uIHx8IChtZXNzYWdlLmRlYXIgPyBcIkRlYXIgXCIgKyBtZXNzYWdlLmRlYXIgOiBudWxsKSB8fCBcIkRlYXIgTWFkYW0vU2lyXCIpO1xyXG5cdFx0XHRpZiAobWVzc2FnZS5yZWdhcmRzKSBtZXNzYWdlLmJvZHkgKz0gXCI8QlI+PEJSPjxCUj5SZWdhcmRzPEJSPlwiICsgbWVzc2FnZS5yZWdhcmRzO1xyXG5cdFx0fVxyXG5cclxuXHRcdGVtYWlsLmF2YWlsYWJsZSgpLnRoZW4oZnVuY3Rpb24gKGF2YWlsKSB7XHJcblx0XHRcdGlmIChhdmFpbCkge1xyXG5cdFx0XHRcdHJldHVybiBlbWFpbC5jb21wb3NlKHtcclxuXHRcdFx0XHRcdHRvOiBbbWVzc2FnZS50b10sXHJcblx0XHRcdFx0XHRzdWJqZWN0OiBzdWJqZWN0LFxyXG5cdFx0XHRcdFx0Ym9keTogbWVzc2FnZS5ib2R5LFxyXG5cdFx0XHRcdFx0YXBwUGlja2VyVGl0bGU6ICdDb21wb3NlIHdpdGguLicgLy8gZm9yIEFuZHJvaWQsIGRlZmF1bHQ6ICdPcGVuIHdpdGguLidcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVtYWlsIG5vdCBhdmFpbGFibGVcIik7XHJcblx0XHRcdH1cclxuXHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIkVtYWlsIGNvbXBvc2VyIGNsb3NlZFwiKTtcclxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0fSk7O1xyXG5cdH1cclxuXHJcblx0LyoqIG1ha2UgYSBwaG9uZSBjYWxsICovXHJcblx0cHVibGljIHBob25lRGlhbChQaG9uZU5vOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRwaG9uZS5kaWFsKFBob25lTm8sIHRydWUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIG9wZW5GaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZmlsZW5hbWUgPSBmaWxlUGF0aC50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0aWYgKGFuZHJvaWQpIHtcclxuXHRcdFx0XHRpZiAoZmlsZW5hbWUuc3Vic3RyKDAsIDcpICE9IFwiZmlsZTovL1wiIHx8IGZpbGVuYW1lLnN1YnN0cigwLCAxMCkgIT0gXCJjb250ZW50Oi8vXCIpIGZpbGVuYW1lID0gXCJmaWxlOi8vXCIgKyBmaWxlbmFtZTtcclxuXHRcdFx0XHRpZiAoYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OLlNES19JTlQgPiBhbmRyb2lkLm9zLkJ1aWxkLlZFUlNJT05fQ09ERVMuTSkgZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKFwiZmlsZTovL1wiLCBcImNvbnRlbnQ6Ly9cIik7XHJcblxyXG5cdFx0XHRcdHZhciB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoZmlsZW5hbWUudHJpbSgpKTtcclxuXHRcdFx0XHR2YXIgdHlwZSA9IFwiYXBwbGljYXRpb24vXCIgKyAoKGV4cG9ydHMuc3RyLmluTGlzdChmaWxlbmFtZS5zbGljZSgtNCksIFsnLnBkZicsICcuZG9jJywgJy54bWwnXSkpID8gZmlsZW5hbWUuc2xpY2UoLTMpIDogXCIqXCIpO1xyXG5cclxuXHRcdFx0XHQvL0NyZWF0ZSBpbnRlbnRcclxuXHRcdFx0XHR2YXIgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fVklFVyk7XHJcblx0XHRcdFx0aW50ZW50LnNldERhdGFBbmRUeXBlKHVyaSwgdHlwZSk7XHJcblx0XHRcdFx0aW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XHJcblx0XHRcdFx0YXBwbGljYXRpb24uYW5kcm9pZC5jdXJyZW50Q29udGV4dC5zdGFydEFjdGl2aXR5KGludGVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0aW9zLm9wZW5GaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRhbGVydCgnQ2Fubm90IG9wZW4gZmlsZSAnICsgZmlsZW5hbWUgKyAnLiAnICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBzdGFydCB0aGUgY29udGFjdHMgYXBwICovXHJcblx0cHVibGljIHNob3dDb250YWN0cygpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRpZiAoYW5kcm9pZCkge1xyXG5cdFx0XHRcdHZhciB1cmkgPSBhbmRyb2lkLnByb3ZpZGVyLkNvbnRhY3RzQ29udHJhY3QuQ29udGFjdHMuQ09OVEVOVF9VUkk7XHJcblx0XHRcdFx0dmFyIHR5cGUgPSBhbmRyb2lkLnByb3ZpZGVyLkNvbnRhY3RzQ29udHJhY3QuQ29tbW9uRGF0YUtpbmRzLlBob25lLkNPTlRFTlRfVFlQRTtcclxuXHRcdFx0XHR2YXIgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fREVGQVVMVCx1cmkpO1xyXG5cdFx0XHRcdGFwcGxpY2F0aW9uLmFuZHJvaWQuY3VycmVudENvbnRleHQuc3RhcnRBY3Rpdml0eShpbnRlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdC8vaW9zLihmaWxlbmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRhbGVydChgQ2Fubm90IHNob3cgY29udGFjdHMuICR7ZXJyfWApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vLyAvKiogRXh0ZW5kaW5nIE5hdGl2ZXNjcmlwdCBBdXRvY29tcGxldGUgKi9cclxuLy8gZXhwb3J0IGNsYXNzIFRva2VuSXRlbSBleHRlbmRzIGF1dG9jb21wbGV0ZU1vZHVsZS5Ub2tlbk1vZGVsIHtcclxuLy8gXHR2YWx1ZTogbnVtYmVyO1xyXG4vLyBcdGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgdmFsdWU6IG51bWJlciwgaW1hZ2U/OiBzdHJpbmcpIHtcclxuLy8gXHRcdHN1cGVyKHRleHQsIGltYWdlIHx8IG51bGwpO1xyXG4vLyBcdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4vLyBcdH1cclxuXHJcbi8vIH07XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm0ge1xyXG5cclxuXHRwdWJsaWMgZ2V0IGN1cnJlbnRQYWdlKCk6IFBhZ2Uge1xyXG5cdFx0cmV0dXJuIHRvcG1vc3QoKS5jdXJyZW50UGFnZTtcclxuXHR9O1xyXG5cclxuXHRwdWJsaWMgc2hvd1BhZ2UobWUsIHBhZ2VOYW1lOiBzdHJpbmcsIGNvbnRleHQ/OiBhbnksIGZvbGRlcj86IHN0cmluZykge1xyXG5cclxuXHRcdGlmIChtZSkgbWUuY2hpbGRQYWdlID0gcGFnZU5hbWU7XHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0bW9kdWxlTmFtZTogKGZvbGRlciB8fCAnJykgKyBwYWdlTmFtZSArICcvJyArIHBhZ2VOYW1lLFxyXG5cdFx0XHRjb250ZXh0OiBjb250ZXh0IHx8IHt9LFxyXG5cdFx0XHRhbmltYXRlZDogdHJ1ZSxcclxuXHRcdFx0dHJhbnNpdGlvbjogeyBuYW1lOiBcInNsaWRlXCIsIGR1cmF0aW9uOiAzODAsIGN1cnZlOiBcImVhc2VJblwiIH0sXHJcblx0XHRcdGNsZWFySGlzdG9yeTogZmFsc2UsXHJcblx0XHRcdGJhY2tzdGFja1Zpc2libGU6IHRydWVcclxuXHRcdH07XHJcblx0XHR0b3Btb3N0KCkubmF2aWdhdGUoZGF0YSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZGV2aWNlKCk6IFwiYW5kcm9pZFwiIHwgXCJpb3NcIiB8IFwiXCIge1xyXG5cdFx0aWYgKGlzQW5kcm9pZCkgcmV0dXJuIFwiYW5kcm9pZFwiO1xyXG5cdFx0aWYgKGlzSU9TKSByZXR1cm4gXCJpb3NcIjtcclxuXHRcdHJldHVybiBcIlwiO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGdvQmFjaygpIHtcclxuXHRcdHRvcG1vc3QoKS5nb0JhY2soKTtcclxuXHR9O1xyXG5cclxuXHRwdWJsaWMgc2hvd01vZGFsKHBhdGg6IHN0cmluZywgcGFyYW1zPywgZnVsbHNjcmVlbj86IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHRvcG1vc3QoKS5jdXJyZW50UGFnZS5zaG93TW9kYWwocGF0aCwgcGFyYW1zLCBmdW5jdGlvbiAoYXJncykge1xyXG5cdFx0XHRcdHJlc29sdmUoYXJncyk7XHJcblx0XHRcdH0sIGZ1bGxzY3JlZW4pXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuZXhwb3J0IHZhciBmb3JtID0gbmV3IEZvcm0oKTtcclxuZXhwb3J0IHZhciB0YWdnaW5nID0gbmV3IFRhZ2dpbmcoKTtcclxuZXhwb3J0IHZhciBzdHIgPSBuZXcgU3RyKCk7XHJcbmV4cG9ydCB2YXIgc3FsID0gbmV3IFNxbCgpO1xyXG5leHBvcnQgdmFyIGR0ID0gbmV3IER0KCk7XHJcbmV4cG9ydCB2YXIgdmlld0V4dCA9IG5ldyBWaWV3RXh0KCk7XHJcbmV4cG9ydCB2YXIgZmlsZSA9IG5ldyBGaWxlKCk7XHJcbmV4cG9ydCB2YXIgY2FsbCA9IG5ldyBDYWxsKCk7XHJcbmV4cG9ydCB2YXIgdXRpbHMgPSBuZXcgVXRpbHMoKTtcclxuIl19