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
    /** convert an array to and observable array */
    Str.prototype.observable = function (obj) {
        return observableModule.fromObject(obj);
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
        return moment(date).format('DD/MM/YYYY');
    };
    /** convert a date to a string (DD/MM/YYYY) */
    Dt.prototype.timeToStr = function (date) {
        return moment(date).format('hh:mm A');
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
        return me.monthShortName(date.getMonth());
    };
    /** convert a date to a clarion date */
    Dt.prototype.monthYear = function (clarionDate) {
        var me = this;
        var date = me.clarionDateToDate(clarionDate);
        return me.monthShortName(date.getMonth()) + '`' + date.getFullYear().toString().substr(2, 2);
    };
    /** get short description for month */
    Dt.prototype.monthShortName = function (month) {
        if (!month)
            return '';
        var month_names_short = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var monthName = month_names_short[month];
        return monthName;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFXLFFBQUEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU5Qix5Q0FBMkM7QUFDM0MsK0JBQWlDO0FBRWpDLGtEQUFvRDtBQUNwRCw4Q0FBZ0Q7QUFDaEQsMENBQTRDO0FBQzVDLDBDQUE0QztBQUM1QywyQkFBNkI7QUFDN0IsNkVBQStFO0FBRS9FLDBEQUF3RDtBQUN4RCxxQ0FBcUM7QUFDckMscUNBQWlDO0FBTWpDLHlCQUF5QjtBQUN6QjtJQUFBO0lBb0RBLENBQUM7SUFsREEseURBQXlEO0lBQ2xELHNDQUFzQixHQUE3QixVQUFpQyxPQUF1QixFQUFFLElBQVM7UUFDbEUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJELEdBQUcsQ0FBQyxDQUFDLElBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFB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LDZCQUE2QjtJQUUzRCxtQkFBWSxJQUFZLEVBQUUsS0FBYSxFQUFFLEtBQWM7UUFBdkQsWUFDQyxrQkFBTSxJQUFJLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUUxQjtRQURBLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOztJQUNwQixDQUFDO0lBRUYsZ0JBQUM7QUFBRCxDQUFDLEFBUEQsQ0FBK0Isa0JBQWtCLENBQUMsVUFBVSxHQU8zRDtBQVBZLDhCQUFTO0FBT3JCLENBQUM7QUFFUyxRQUFBLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFFBQUEsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFBLEVBQUUsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ2QsUUFBQSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN4QixRQUFBLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2xCLFFBQUEsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsUUFBQSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB2YXIgc2YgPSByZXF1aXJlKCdzZicpO1xyXG5cclxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcImFwcGxpY2F0aW9uXCI7XHJcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tIFwibW9tZW50XCI7XHJcbmltcG9ydCAqIGFzIHZpZXcgZnJvbSBcInVpL2NvcmUvdmlld1wiO1xyXG5pbXBvcnQgKiBhcyBvYnNlcnZhYmxlTW9kdWxlIGZyb20gXCJkYXRhL29ic2VydmFibGVcIjtcclxuaW1wb3J0ICogYXMgZmlsZVN5c3RlbU1vZHVsZSBmcm9tIFwiZmlsZS1zeXN0ZW1cIjtcclxuaW1wb3J0ICogYXMgcGhvbmUgZnJvbSBcIm5hdGl2ZXNjcmlwdC1waG9uZVwiO1xyXG5pbXBvcnQgKiBhcyBlbWFpbCBmcm9tIFwibmF0aXZlc2NyaXB0LWVtYWlsXCI7XHJcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSBcImh0dHBcIjtcclxuaW1wb3J0ICogYXMgYXV0b2NvbXBsZXRlTW9kdWxlIGZyb20gJ25hdGl2ZXNjcmlwdC10ZWxlcmlrLXVpLXByby9hdXRvY29tcGxldGUnO1xyXG5cclxuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSBcImRhdGEvb2JzZXJ2YWJsZS1hcnJheVwiO1xyXG5pbXBvcnQgeyBpc0FuZHJvaWQgfSBmcm9tIFwicGxhdGZvcm1cIjtcclxuaW1wb3J0IHsgaW9zIH0gZnJvbSBcInV0aWxzL3V0aWxzXCJcclxuXHJcbmRlY2xhcmUgdmFyIGFuZHJvaWQ6IGFueTtcclxuZGVjbGFyZSB2YXIgamF2YTogYW55O1xyXG5cclxuXHJcbi8vTWlzY2VsbGFuaW91cyBGdW5jdGlvbnNcclxuZXhwb3J0IGNsYXNzIFV0aWxzIHtcclxuXHJcblx0Ly9DcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2JqZWN0IGZyb20gYW4gZXhpc3Rpbmcgb25lXHJcblx0cHVibGljIGNyZWF0ZUluc3RhbmNlRnJvbUpzb248VD4ob2JqVHlwZTogeyBuZXcgKCk6IFQ7IH0sIGpzb246IGFueSkge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGNvbnN0IG5ld09iaiA9IG5ldyBvYmpUeXBlKCk7XHJcblx0XHRjb25zdCByZWxhdGlvbnNoaXBzID0gb2JqVHlwZVtcInJlbGF0aW9uc2hpcHNcIl0gfHwge307XHJcblxyXG5cdFx0Zm9yIChjb25zdCBwcm9wIGluIGpzb24pIHtcclxuXHRcdFx0aWYgKGpzb24uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuXHRcdFx0XHRpZiAobmV3T2JqW3Byb3BdID09IG51bGwpIHtcclxuXHRcdFx0XHRcdGlmIChyZWxhdGlvbnNoaXBzW3Byb3BdID09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0bmV3T2JqW3Byb3BdID0ganNvbltwcm9wXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRuZXdPYmpbcHJvcF0gPSBtZS5jcmVhdGVJbnN0YW5jZUZyb21Kc29uKHJlbGF0aW9uc2hpcHNbcHJvcF0sIGpzb25bcHJvcF0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgUHJvcGVydHkgJHtwcm9wfSBub3Qgc2V0IGJlY2F1c2UgaXQgYWxyZWFkeSBleGlzdGVkIG9uIHRoZSBvYmplY3QuYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ld09iajtcclxuXHR9XHJcblxyXG5cdC8vYWRkcyBtaXNzaW5nIGZ1bmN0aW9ucyB0byBvYmplY3RcclxuXHRwdWJsaWMgaW5pdE9iamVjdDxUPihvYmpUeXBlOiB7IG5ldyAoKTogVDsgfSwganNvbjogYW55KSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Y29uc3QgbmV3T2JqID0gbmV3IG9ialR5cGUoKTtcclxuXHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBvYmpUeXBlW1wicmVsYXRpb25zaGlwc1wiXSB8fCB7fTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4gbmV3T2JqKSB7XHJcblx0XHRcdGlmIChuZXdPYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuXHRcdFx0XHRjb25zb2xlLndhcm4oYEFkZCAke3Byb3B9LmApO1xyXG5cdFx0XHRcdGlmIChqc29uW3Byb3BdID09IG51bGwpIHtcclxuXHRcdFx0XHRcdGlmIChyZWxhdGlvbnNoaXBzW3Byb3BdID09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0anNvbltwcm9wXSA9IG5ld09ialtwcm9wXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRqc29uW3Byb3BdID0gbWUuY3JlYXRlSW5zdGFuY2VGcm9tSnNvbihyZWxhdGlvbnNoaXBzW3Byb3BdLCBuZXdPYmpbcHJvcF0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgUHJvcGVydHkgJHtwcm9wfSBub3Qgc2V0IGJlY2F1c2UgaXQgYWxyZWFkeSBleGlzdGVkIG9uIHRoZSBvYmplY3QuYCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBUYWdnaW5nIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgVGFnZ2luZyB7XHJcblxyXG5cdC8qKiBkZWZhdWx0IHRhZyBpY29uICovXHJcblx0cHVibGljIHRhZ0ljb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA0Nik7XHJcblx0LyoqIGRlZmF1bHQgdW50YWcgaWNvbiAqL1xyXG5cdHB1YmxpYyB1blRhZ0ljb24gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA5Nik7XHJcblxyXG5cdC8qKiBDcmVhdGUgYSBuZXcgb2JzZXJ2YWJsZSB0YWcgb2JqZWN0XHJcblx0KiBJZiBpY29uIGlzIGxlZnQgYmxhbmsgdGhlIGRlZmF1bHQgaWNvbiBpcyB1c2VkIFxyXG5cdCovXHJcblx0cHVibGljIG5ld1RhZyhpY29uPzogc3RyaW5nKTogb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlIHtcclxuXHRcdGlmICghaWNvbikgaWNvbiA9IHRoaXMudW5UYWdJY29uO1xyXG5cdFx0dmFyIGEgPSBuZXcgb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlKCk7XHJcblx0XHRhLnNldChcInZhbHVlXCIsIGljb24pO1xyXG5cdFx0cmV0dXJuIGE7XHJcblx0XHQvL1x0XHRyZXR1cm4gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSh7IHZhbHVlOiBpY29uIH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHNldCBhbGwgYXJyYXkgb2JqZWN0cyB0YWcgcHJvcGVydHkgdG8gdGhlIGRlZmF1bHQgdGFnZ2VkIGljb24gb2JqZWN0ICovXHJcblx0cHVibGljIHRhZ0FsbChhcnJheTogYW55W10pOiBhbnlbXSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICghYXJyYXlbaV0udGFnKSBhcnJheVtpXS50YWcgPSB0YWdnaW5nLm5ld1RhZygpO1xyXG5cdFx0XHRhcnJheVtpXS50YWcuc2V0KFwidmFsdWVcIiwgdGFnZ2luZy50YWdJY29uKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBhcnJheTtcclxuXHR9XHJcblx0LyoqIHNldCBhbGwgYXJyYXkgb2JqZWN0cyB0YWcgcHJvcGVydHkgdG8gdGhlIGRlZmF1bHQgdW50YWdnZWQgaWNvbiBvYmplY3QgKi9cclxuXHRwdWJsaWMgdW5UYWdBbGwoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKCFhcnJheVtpXS50YWcpIGFycmF5W2ldLnRhZyA9IHRhZ2dpbmcubmV3VGFnKCk7XHJcblx0XHRcdGFycmF5W2ldLnRhZy5zZXQoXCJ2YWx1ZVwiLCB0YWdnaW5nLnVuVGFnSWNvbik7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cdC8qKiBnZXQgdGhlIHRvZ2dsZWQgdGFnIGljb24gKi9cclxuXHRwdWJsaWMgdG9nZ2xlVGFnSWNvbihpY29uOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0aWYgKGljb24gPT0gdGhpcy50YWdJY29uKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnVuVGFnSWNvbjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnRhZ0ljb247XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogVG9nZ2xlIHRhZyBvYnNlcnZhYmxlICovXHJcblx0cHVibGljIHRvZ2dsZVRhZyh0YWc6IGFueSk6IGFueSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCF0YWcpIHRhZyA9IHRhZ2dpbmcubmV3VGFnKCk7XHJcblx0XHR2YXIgaWNvbiA9IHRhZ2dpbmcudG9nZ2xlVGFnSWNvbih0YWcuZ2V0KFwidmFsdWVcIikpO1xyXG5cdFx0dGFnLnNldChcInZhbHVlXCIsIGljb24pO1xyXG5cdFx0cmV0dXJuIHRhZztcclxuXHR9XHJcblxyXG5cdC8qKiBUb2dnbGUgdGhlIHJvd3MgdGFnIHByb3BlcnR5ICovXHJcblx0cHVibGljIHRvZ2dsZVJvdyhyb3c6IGFueSk6IGFueSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFyb3cpIHJldHVybiBudWxsO1xyXG5cdFx0bWUudG9nZ2xlVGFnKHJvdy50YWcpO1xyXG5cdFx0cmV0dXJuIHJvdztcclxuXHR9XHJcblxyXG5cdC8qKiBUb2dnbGUgdGhlIG9ic2VydmFibGUgdGFnIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB0b2dnbGVPYnNlcnZhYmxlKG9iZXJ2YWJsZVRhZzogb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlKTogb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlIHtcclxuXHRcdHJldHVybiB0aGlzLm5ld1RhZyh0aGlzLnRvZ2dsZVRhZ0ljb24ob2JlcnZhYmxlVGFnLmdldChcInZhbHVlXCIpKSk7XHJcblx0fVxyXG5cdC8qKiBUb2dnbGUgdGhlIG9ic2VydmFibGUgcm93cyB0YWcgb2JqZWN0ICovXHJcblx0cHVibGljIHRvZ2dsZU9ic2VydmFibGVSb3coYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCBpbmRleDogbnVtYmVyKTogT2JzZXJ2YWJsZUFycmF5PGFueT4ge1xyXG5cdFx0dmFyIHJvdyA9IHRoaXMudG9nZ2xlUm93KGFycmF5LmdldEl0ZW0oaW5kZXgpKTtcclxuXHRcdGFycmF5LnNldEl0ZW0oaW5kZXgsIHJvdyk7XHJcblx0XHRyZXR1cm4gYXJyYXk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IG51bWJlciBvZiBpdGVtcyBpbiB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgY291bnQoYXJyYXk6IGFueVtdKTogbnVtYmVyIHtcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiAwO1xyXG5cdFx0cmV0dXJuIGFycmF5Lmxlbmd0aDtcclxuXHR9XHJcblx0LyoqIGdldCBudW1iZXIgb2YgdGFnZ2VkIGl0ZW1zIGluIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBjb3VudFRhZ2dlZChhcnJheTogYW55W10pOiBudW1iZXIge1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIDA7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUYWdnZWRSb3dzKGFycmF5KS5sZW5ndGg7XHJcblx0fVxyXG5cdC8qKiBnZXQgbnVtYmVyIG9mIHVudGFnZ2VkIGl0ZW1zIGluIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBjb3VudFVudGFnZ2VkKGFycmF5OiBhbnlbXSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gMDtcclxuXHRcdHJldHVybiB0aGlzLmdldFRhZ2dlZFJvd3MoYXJyYXkpLmxlbmd0aDtcclxuXHR9XHJcblx0LyoqIHJldHVybiB0aGUgdGFnZ2VkIHJvd3MgZnJvbSB0aGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgZ2V0VGFnZ2VkUm93cyhhcnJheTogYW55W10pOiBhbnlbXSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIG51bGw7XHJcblx0XHR2YXIgdGFnZ2VkUm93cyA9IGFycmF5LmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cdFx0XHRyZXR1cm4gKHgudGFnICYmIHgudGFnLmdldChcInZhbHVlXCIpID09IG1lLnRhZ0ljb24pO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdGFnZ2VkUm93cztcclxuXHR9XHJcblx0LyoqIHJldHVybiB0aGUgdW50YWdnZWQgcm93cyBmcm9tIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBnZXRVblRhZ2dlZFJvd3MoYXJyYXk6IGFueVtdKTogYW55W10ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciB0YWdnZWRSb3dzID0gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblx0XHRcdHJldHVybiAoeC50YWcgJiYgeC50YWcuZ2V0KFwidmFsdWVcIikgPT0gbWUudW5UYWdJY29uKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRhZ2dlZFJvd3M7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBTcWwgRnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBTcWwge1xyXG5cdC8vb3RoZXJcclxuXHQvKiogcmV0dXJuIGEgc3FsIHNuaXBwZWQgdG8gZmV0Y2ggYSBjbGFyaW9uIGRhdGUgZnJvbSB0aGUgZGF0YWJhc2UgYXMgYSBzdGFuZGFyZCBkYXRlKi9cclxuXHRwdWJsaWMgZGF0ZShmaWVsZCkge1xyXG5cdFx0cmV0dXJuIHNmKFwiY29udmVydCh2YXJjaGFyLGNvbnZlcnQoZGF0ZXRpbWUsezB9LTM2MTYzKSwxMDMpXCIsIGZpZWxkKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKiBTdHJpbmcgRnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBTdHIge1xyXG5cclxuXHQvKiogcmV0dXJuIGEgVVJJIGVuY29kZWQgc3RyaW5nICovXHJcblx0cHVibGljIGZpeGVkRW5jb2RlVVJJQ29tcG9uZW50KHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodXJsKS5yZXBsYWNlKC9bIScoKSpdL2csIGZ1bmN0aW9uIChjKSB7XHJcblx0XHRcdHJldHVybiAnJScgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgb2JzZXJ2YWJsZSBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGQocHJvcGVydHkpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGZpbHRlckFycmF5KGRhdGE6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hUZXh0OiBzdHJpbmcpIHtcclxuXHRcdHNlYXJjaFRleHQgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKClcclxuXHRcdHZhciBmaWx0ZXJlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoeCkge1xyXG5cdFx0XHRyZXR1cm4gKHhbc2VhcmNoRmllbGRdICYmIHhbc2VhcmNoRmllbGRdLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2hUZXh0KSA+PSAwKTtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIG5ldyBPYnNlcnZhYmxlQXJyYXkoZmlsdGVyZWREYXRhKTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBvYnNlcnZhYmxlIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZHMocHJvcGVydGllcykgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZmlsdGVyQXJyYXlCeUFycmF5KGRhdGE6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nW10sIHNlYXJjaFRleHQ6IHN0cmluZykge1xyXG5cdFx0c2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKVxyXG5cdFx0dmFyIGZpbHRlcmVkRGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlYXJjaEZpZWxkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHhbc2VhcmNoRmllbGRbaV1dICYmIHhbc2VhcmNoRmllbGRbaV1dLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQpID49IDApIHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBuZXcgT2JzZXJ2YWJsZUFycmF5KGZpbHRlcmVkRGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIHRydWUgaWYgdGUgc3RyaW5nIGlzIGluIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBpbkxpc3QodmFsdWU6IHN0cmluZywgbGlzdEFycmF5OiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKGxpc3RBcnJheS5pbmRleE9mKHZhbHVlKSA+PSAwKSByZXR1cm4gdHJ1ZTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gdHJ1ZSBpZiBhIHN0cmluZyBjb250YWlucyBhbnkgaXRlbSBpbiB0aGUgc3Vic3RyaW5nIGFycmF5KSAqL1xyXG5cdHB1YmxpYyBjb250YWluc0FueShzdHI6IHN0cmluZywgc3Vic3RyaW5nczogc3RyaW5nW10pOiBib29sZWFuIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpICE9IHN1YnN0cmluZ3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKHN0ci5pbmRleE9mKHN1YnN0cmluZ3NbaV0pICE9IC0gMSkgcmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheUl0ZW1zKGFycmF5OiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZywgc2VhcmNoVmFsdWU6IGFueSkge1xyXG5cdFx0cmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbiAob2JqKSB7XHJcblx0XHRcdHJldHVybiBvYmpbc2VhcmNoRmllbGRdID09IHNlYXJjaFZhbHVlO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZHMocHJvcGVydGllcykgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlJdGVtc0J5QXJyYXkoZGF0YTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmdbXSwgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRpZiAoIXNlYXJjaFRleHQpIHJldHVybiBkYXRhO1xyXG5cdFx0c2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKVxyXG5cdFx0dmFyIGZpbHRlcmVkRGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNlYXJjaEZpZWxkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0aWYgKHhbc2VhcmNoRmllbGRbaV1dICYmIHhbc2VhcmNoRmllbGRbaV1dLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQpID49IDApIHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBmaWx0ZXJlZERhdGE7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBmaXJzdCBpdGVtIGZyb20gYW4gYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkKHByb3BlcnR5KSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheUl0ZW0oYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRBcnJheUl0ZW1zKGFycmF5LCBzZWFyY2hGaWVsZCwgc2VhcmNoVmFsdWUpWzBdO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYW4gYXJyYXkgdG8gYW5kIG9ic2VydmFibGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgb2JzZXJ2YWJsZUFycmF5PFQ+KGFycmF5PzogQXJyYXk8YW55PikgOiBPYnNlcnZhYmxlQXJyYXk8VD4ge1xyXG5cdFx0cmV0dXJuIG5ldyBPYnNlcnZhYmxlQXJyYXkoYXJyYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYW4gYXJyYXkgdG8gYW5kIG9ic2VydmFibGUgYXJyYXkgKi9cclxuXHRwdWJsaWMgb2JzZXJ2YWJsZShvYmopIHtcclxuXHRcdHJldHVybiBvYnNlcnZhYmxlTW9kdWxlLmZyb21PYmplY3Qob2JqKTtcclxuXHR9XHJcblxyXG5cdC8qKiBFeHRyYWN0IG9iamVjdHMgZnJvbSBhcnJheSAgKi9cclxuXHRwdWJsaWMgZ2V0QXJyYXlPYmplY3RzKGFycmF5OiBBcnJheTxhbnk+LCBvYmplY3ROYW1lOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcclxuXHRcdHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHhbb2JqZWN0TmFtZV07IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIHJlcGxhY2VzIGFuIGV4aXN0aW5nIG9ic2VydmFibGVBcnJheXMgZGF0YSB3aXRoIGEgbmV3IGFycmF5ICAqL1xyXG5cdHB1YmxpYyByZXBsYWNlQXJyYXkoYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCB3aXRoQXJyYXk6IGFueSkge1xyXG5cdFx0YXJyYXkuc3BsaWNlKDApO1xyXG5cdFx0dGhpcy5hcHBlbmRBcnJheShhcnJheSwgd2l0aEFycmF5KVxyXG5cdH1cclxuXHJcblx0LyoqIGFwcGVuZHMgYW4gZXhpc3Rpbmcgb2JzZXJ2YWJsZUFycmF5cyBkYXRhIHdpdGggYSBuZXcgYXJyYXkgICovXHJcblx0cHVibGljIGFwcGVuZEFycmF5KGFycmF5OiBPYnNlcnZhYmxlQXJyYXk8YW55Piwgd2l0aEFycmF5OiBhbnkpIHtcclxuXHRcdC8vXHRvYnNlcnZhYmxlIGFycmF5IGNhdXNlcyBwcm9ibGVtcyBpZiB0aGUgYXJyYXkgaXRlbSBpcyBub3QgYW4gb2JzZXJ2YWJsZS5cclxuXHRcdC8vICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgd2l0aEFycmF5Lmxlbmd0aDsgaW5kZXgrKykge1xyXG5cdFx0Ly8gXHQgIGFycmF5LnB1c2god2l0aEFycmF5W2luZGV4XSk7XHJcblx0XHQvLyAgfVxyXG5cdFx0aWYgKCF3aXRoQXJyYXkpIHJldHVybjtcclxuXHRcdGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB3aXRoQXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XHJcblx0XHRcdHZhciByb3cgPSB3aXRoQXJyYXlbaW5kZXhdO1xyXG5cdFx0XHR2YXIgb1JvdyA9IG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoKTtcclxuXHRcdFx0T2JqZWN0LmtleXMocm93KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuXHRcdFx0XHRvUm93LnNldChrZXksIHJvd1trZXldKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGFycmF5LnB1c2gob1Jvdyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgRW51bVRvQXJyYXkoRW51bU9iaik6IHN0cmluZ1tdIHtcclxuXHRcdHZhciByZXR1cm5WYWx1ZSA9IFtdO1xyXG5cdFx0Zm9yICh2YXIga2V5IGluIEVudW1PYmopIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBFbnVtT2JqW2tleV0gPT09IFwic3RyaW5nXCIpIHJldHVyblZhbHVlLnB1c2goRW51bU9ialtrZXldLnJlcGxhY2UoL18vZywgXCIgXCIpKTtcclxuXHRcdH07XHJcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XHJcblx0fVxyXG5cclxuXHQvKiogVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYSBLOlYgZnJvbSBhIGxpc3Qgb2Ygc3RyaW5ncyAqL1xyXG5cdHB1YmxpYyBzdHJFbnVtPFQgZXh0ZW5kcyBzdHJpbmc+KG86IEFycmF5PFQ+KToge1tLIGluIFRdOiBLfSB7XHJcblx0XHRyZXR1cm4gby5yZWR1Y2UoKHJlcywga2V5KSA9PiB7XHJcblx0XHRcdHJlc1trZXldID0ga2V5O1xyXG5cdFx0XHRyZXR1cm4gcmVzO1xyXG5cdFx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XHJcblx0fVxyXG5cclxuXHJcblxyXG59XHJcblxyXG4vKiogRGF0ZSBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIER0IHtcclxuXHJcblx0cHVibGljIG1vbWVudChkYXRlPzogRGF0ZSk6IG1vbWVudC5Nb21lbnQge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvL1llYXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgeWVhciB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZFllYXJzKGRheTogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGRheSwgJ3llYXJzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cdC8qKiBzdGFydCBvZiB5ZWFyICovXHJcblx0cHVibGljIGRhdGVZZWFyU3RhcnQoZGF0ZT86IERhdGUsIGFkZFllYXJzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5zdGFydE9mKCd5ZWFyJykuYWRkKGFkZFllYXJzIHx8IDAsIFwieWVhcnNcIikudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvKiogZW5kIG9mIHllYXIgKi9cclxuXHRwdWJsaWMgZGF0ZVllYXJFbmQoZGF0ZT86IERhdGUsIGFkZFllYXJzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5lbmRPZigneWVhcicpLmFkZChhZGRZZWFycyB8fCAwLCBcInllYXJzXCIpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9Nb250aHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIG1vbnRoIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkTW9udGhzKGRheTogbnVtYmVyLCBkYXRlPzogRGF0ZSk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuYWRkKGRheSwgJ21vbnRocycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHQvKiogc3RhcnQgb2YgbW9udGggKi9cclxuXHRwdWJsaWMgZGF0ZU1vbnRoU3RhcnQoZGF0ZT86IERhdGUsIGFkZE1vbnRocz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuc3RhcnRPZignbW9udGgnKS5hZGQoYWRkTW9udGhzIHx8IDAsICdtb250aHMnKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8qKiBlbmQgb2YgbW9udGggKi9cclxuXHRwdWJsaWMgZGF0ZU1vbnRoRW5kKGRhdGU/OiBEYXRlLCBhZGRNb250aHM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmVuZE9mKCdtb250aCcpLmFkZChhZGRNb250aHMgfHwgMCwgJ21vbnRocycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9EYXlzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGFkZCBhIGRheSB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgZGF0ZUFkZERheXMoZGF5OiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoZGF5LCAnZGF5cycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0Ly9XZWVrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIHN0YXJ0IG9mIHdlZWsgKi9cclxuXHRwdWJsaWMgZGF0ZVdlZWtTdGFydChkYXRlPzogRGF0ZSwgYWRkV2Vla3M/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ2lzb1dlZWsnKS5hZGQoYWRkV2Vla3MgfHwgMCwgJ3dlZWtzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cdC8qKiBlbmQgb2Ygd2VlayAqL1xyXG5cdHB1YmxpYyBkYXRlV2Vla0VuZChkYXRlPzogRGF0ZSwgYWRkV2Vla3M/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmVuZE9mKCdpc29XZWVrJykuYWRkKGFkZFdlZWtzIHx8IDAsICd3ZWVrcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vY29udmVydCB0byBzdHJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoWVlZWS1NTS1ERCkgKi9cclxuXHRwdWJsaWMgZGF0ZVRvU3RyWU1EKGRhdGU/OiBEYXRlKTogc3RyaW5nIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnWVlZWS1NTS1ERCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChERC9NTS9ZWVlZKSAqL1xyXG5cdHB1YmxpYyBkYXRlVG9TdHIoZGF0ZT86IERhdGUpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5mb3JtYXQoJ0REL01NL1lZWVknKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIHN0cmluZyAoREQvTU0vWVlZWSkgKi9cclxuXHRwdWJsaWMgdGltZVRvU3RyKGRhdGU/OiBEYXRlKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KCdoaDptbSBBJyk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIHN0cmluZyAoREQvTU0vWVlZWSkgdG8gYSBkYXRlICovXHJcblx0cHVibGljIHN0clRvRGF0ZShkYXRlOiBzdHJpbmcpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRtb21lbnQoKS50b0RhdGUoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSwgJ0REL01NL1lZWVknKS50b0RhdGUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgbW9tZW50IG9iamVjdCAqL1xyXG5cdHB1YmxpYyBzdHJUb01vbWVudChkYXRlOiBzdHJpbmcpIHtcclxuXHRcdGlmICghZGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbW9tZW50KGRhdGUsICdERC9NTS9ZWVlZJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBjbGFyaW9uRGF0ZShkYXRlPzogRGF0ZSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0dmFyIG9uZURheSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7IC8vIGhvdXJzKm1pbnV0ZXMqc2Vjb25kcyptaWxsaXNlY29uZHNcclxuXHRcdHZhciBzdGFydERhdGUgPSBuZXcgRGF0ZShcIkRlY2VtYmVyIDI4LCAxODAwXCIpO1xyXG5cdFx0dmFyIGRpZmZEYXlzID0gTWF0aC5yb3VuZChNYXRoLmFicygoZGF0ZS5nZXRUaW1lKCkgLSBzdGFydERhdGUuZ2V0VGltZSgpKSAvIChvbmVEYXkpKSlcclxuXHRcdHJldHVybiBkaWZmRGF5c1xyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgY2xhcmlvbkRhdGVUb0RhdGUoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghY2xhcmlvbkRhdGUpIHJldHVybiBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIHRoaXMuZGF0ZUFkZERheXMoY2xhcmlvbkRhdGUsIG5ldyBEYXRlKFwiRGVjZW1iZXIgMjgsIDE4MDBcIikpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIHNob3J0TW9udGgoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHZhciBkYXRlID0gbWUuY2xhcmlvbkRhdGVUb0RhdGUoY2xhcmlvbkRhdGUpO1xyXG5cdFx0cmV0dXJuIG1lLm1vbnRoU2hvcnROYW1lKGRhdGUuZ2V0TW9udGgoKSk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgbW9udGhZZWFyKGNsYXJpb25EYXRlPzogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgZGF0ZSA9IG1lLmNsYXJpb25EYXRlVG9EYXRlKGNsYXJpb25EYXRlKTtcclxuXHRcdHJldHVybiBtZS5tb250aFNob3J0TmFtZShkYXRlLmdldE1vbnRoKCkpICsgJ2AnICsgZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCkuc3Vic3RyKDIsIDIpO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBzaG9ydCBkZXNjcmlwdGlvbiBmb3IgbW9udGggKi9cclxuXHRwdWJsaWMgbW9udGhTaG9ydE5hbWUobW9udGg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZighbW9udGgpIHJldHVybiAnJztcclxuXHRcdHZhciBtb250aF9uYW1lc19zaG9ydCA9IFsnJywnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXTtcclxuXHRcdHZhciBtb250aE5hbWUgPSBtb250aF9uYW1lc19zaG9ydFttb250aF07XHJcblx0XHRyZXR1cm4gbW9udGhOYW1lO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25UaW1lKGRhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHR2YXIgbW10TWlkbmlnaHQgPSBtb21lbnQoZGF0ZSkuc3RhcnRPZignZGF5Jyk7XHJcblx0XHR2YXIgc2Vjb25kcyA9IG1vbWVudChkYXRlKS5kaWZmKG1tdE1pZG5pZ2h0LCAnc2Vjb25kcycpICogMTAwO1xyXG5cdFx0cmV0dXJuIHNlY29uZHNcclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiB0aW1lICovXHJcblx0cHVibGljIGNsYXJpb25UaW1lVG9EYXRlKGNsYXJpb25EYXRlPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWNsYXJpb25EYXRlKSByZXR1cm4gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQobmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKSkuYWRkKGNsYXJpb25EYXRlIC8gMTAwLCAnc2Vjb25kcycpLnRvRGF0ZSgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqIEV4dHJhIGZ1bmN0aW9ucyB1c2VkIHdpdGggdmlld3MgKi9cclxuZXhwb3J0IGNsYXNzIFZpZXdFeHQge1xyXG5cclxuXHQvKiogcmVtb3ZlIHRoZSBmb2N1cyBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgY2xlYXJBbmREaXNtaXNzKHZpZXc6IHZpZXcuVmlld0Jhc2UpIHtcclxuXHRcdGlmICghdmlldykgcmV0dXJuO1xyXG5cdFx0dGhpcy5kaXNtaXNzU29mdElucHV0KHZpZXcpO1xyXG5cdFx0dGhpcy5jbGVhckZvY3VzKHZpZXcpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJlbW92ZSB0aGUgZm9jdXMgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGNsZWFyRm9jdXModmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHRpZiAoaXNBbmRyb2lkKSBpZiAodmlldy5hbmRyb2lkKSB2aWV3LmFuZHJvaWQuY2xlYXJGb2N1cygpO1xyXG5cdH1cclxuXHJcblx0LyoqIGhpZGUgdGhlIHNvZnQga2V5Ym9hcmQgZnJvbSBhIHZpZXcgb2JqZWN0ICovXHJcblx0cHVibGljIGRpc21pc3NTb2Z0SW5wdXQodmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHR0cnkge1xyXG5cdFx0XHQoPGFueT52aWV3KS5kaXNtaXNzU29mdElucHV0KCk7XHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVZhbHVlSXRlbSB7XHJcblx0VmFsdWVNZW1iZXI6IGFueTtcclxuXHREaXNwbGF5TWVtYmVyOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKiBhIHZhbHVlIGxpc3QgYXJyYXkgKi9cclxuZXhwb3J0IGNsYXNzIFZhbHVlTGlzdCB7XHJcblxyXG5cdC8qKiB0aGlzIGFycmF5IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHJpdmF0ZSBpdGVtczogQXJyYXk8SVZhbHVlSXRlbT47XHJcblxyXG5cdC8qKiB0aGUgbnVtYmVyIG9mIGl0ZW1zICovXHJcblx0Z2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGg7IH1cclxuXHJcblx0Y29uc3RydWN0b3IoYXJyYXk/OiBBcnJheTxJVmFsdWVJdGVtPikge1xyXG5cdFx0aWYgKGFycmF5KSB0aGlzLml0ZW1zID0gYXJyYXk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbShpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtRnJvbnQoaXRlbTogSVZhbHVlSXRlbSkge1xyXG5cdFx0dGhpcy5pdGVtcy51bnNoaWZ0KGl0ZW0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtcygpOiBBcnJheTxJVmFsdWVJdGVtPiB7XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtcztcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgYW4gaXRlbSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0SXRlbShpbmRleDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRUZXh0KGluZGV4KTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGRpc3BsYXkgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFRleHQoaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XHJcblx0XHRpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuaXRlbXNbaW5kZXhdLkRpc3BsYXlNZW1iZXI7XHJcblx0fVxyXG5cdC8qKiBnZXQgYW4gYXJyYXkgb2YgdGhlIGl0ZW1zIHRleHQgZmllbGQgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4LkRpc3BsYXlNZW1iZXI7IH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgdmFsdWUgYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldFZhbHVlKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtc1tpbmRleF0uVmFsdWVNZW1iZXI7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBpbmRleCBieSBpdHMgdmFsdWUsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cclxuXHRwdWJsaWMgZ2V0SW5kZXgodmFsdWU6IGFueSwgZGVmYXVsdEluZGV4PzogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAodGhpcy5nZXRWYWx1ZShpKSA9PSB2YWx1ZSkgcmV0dXJuIGk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZGVmYXVsdEluZGV4ID09IG51bGwgPyAtMSA6IGRlZmF1bHRJbmRleDtcclxuXHR9XHJcbn1cclxuXHJcbi8qKiBhIHZhbHVlIGxpc3QgYXJyYXkgKi9cclxuZXhwb3J0IGNsYXNzIERpY3Rpb25hcnkge1xyXG5cclxuXHQvKiogdGhpcyBhcnJheSBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHByaXZhdGUgX2l0ZW1zID0gW107XHJcblx0LyoqIGdldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBnZXQgaXRlbXMoKSB7IHJldHVybiB0aGlzLl9pdGVtcyB9XHJcblx0LyoqIHNldCB0aGUgbGlzdCBvZiB2YWx1ZSBpdGVtcyAqL1xyXG5cdHB1YmxpYyBzZXQgaXRlbXMoYXJyYXkpIHsgdGhpcy5faXRlbXMgPSBhcnJheSB9XHJcblxyXG5cdHB1YmxpYyB2YWx1ZU1lbWJlck5hbWUgPSBcIlZhbHVlTWVtYmVyXCI7XHJcblx0cHVibGljIGRpc3BsYXlNZW1iZXJOYW1lID0gXCJEaXNwbGF5TWVtYmVyXCI7XHJcblxyXG5cdC8qKiB0aGUgbnVtYmVyIG9mIGl0ZW1zICovXHJcblx0cHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuaXRlbXMubGVuZ3RoOyB9XHJcblxyXG5cdGNvbnN0cnVjdG9yKGFycmF5PzogQXJyYXk8YW55PiwgdmFsdWVNZW1iZXJOYW1lPzogc3RyaW5nLCBkaXNwbGF5TWVtYmVyTmFtZT86IHN0cmluZykge1xyXG5cdFx0dGhpcy5hZGRJdGVtcyhhcnJheSwgdmFsdWVNZW1iZXJOYW1lLCBkaXNwbGF5TWVtYmVyTmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbShpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogYWRkIGEgbmV3IGl0ZW0gdG8gdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbXMoYXJyYXk6IEFycmF5PGFueT4sIHZhbHVlTWVtYmVyTmFtZTogc3RyaW5nLCBkaXNwbGF5TWVtYmVyTmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0aWYgKGFycmF5KSBtZS5pdGVtcyA9IGFycmF5O1xyXG5cdFx0aWYgKHZhbHVlTWVtYmVyTmFtZSkgdGhpcy52YWx1ZU1lbWJlck5hbWUgPSB2YWx1ZU1lbWJlck5hbWU7XHJcblx0XHRpZiAoZGlzcGxheU1lbWJlck5hbWUpIHRoaXMuZGlzcGxheU1lbWJlck5hbWUgPSBkaXNwbGF5TWVtYmVyTmFtZTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW1Gcm9udChpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGFkZEl0ZW0gPSB7fTtcclxuXHRcdGFkZEl0ZW1bbWUudmFsdWVNZW1iZXJOYW1lXSA9IGl0ZW0uVmFsdWVNZW1iZXI7XHJcblx0XHRhZGRJdGVtW21lLmRpc3BsYXlNZW1iZXJOYW1lXSA9IGl0ZW0uRGlzcGxheU1lbWJlcjtcclxuXHRcdHRoaXMuaXRlbXMudW5zaGlmdChhZGRJdGVtKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogZ2V0IGFuIGl0ZW0gYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldEl0ZW0oaW5kZXg6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGV4dChpbmRleCk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBkaXNwbGF5IHZhbHVlIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0KGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1lLml0ZW1zW2luZGV4XVttZS5kaXNwbGF5TWVtYmVyTmFtZV07XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IGFuIGFycmF5IG9mIHRoZSBpdGVtcyBkaXNwbGF5IG1lbWJlcnMgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4W21lLmRpc3BsYXlNZW1iZXJOYW1lXTsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyB2YWx1ZU1lbWJlciBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VmFsdWUoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghbWUuaXRlbXMgfHwgbWUuaXRlbXMubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xyXG5cdFx0aWYgKGluZGV4ID09IHVuZGVmaW5lZCB8fCBpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcclxuXHRcdHJldHVybiBtZS5pdGVtc1tpbmRleF1bbWUudmFsdWVNZW1iZXJOYW1lXTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGluZGV4IGJ5IGl0cyB2YWx1ZU1lbWViZXIsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cdHB1YmxpYyBnZXRJbmRleCh2YWx1ZTogYW55LCBkZWZhdWx0SW5kZXg/OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAobWUuZ2V0VmFsdWUoaSkgPT0gdmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlZmF1bHRJbmRleCA9PSBudWxsID8gLTEgOiBkZWZhdWx0SW5kZXg7XHJcblx0fVxyXG59XHJcblxyXG5cclxuLyoqIEZpbGUgYWNjZXNzIGZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgRmlsZSB7XHJcblxyXG5cdHB1YmxpYyBkb2N1bWVudEZvbGRlciA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmRvY3VtZW50cygpO1xyXG5cclxuXHRwdWJsaWMgdGVtcEZvbGRlciA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLnRlbXAoKTtcclxuXHJcblx0cHVibGljIGRvd25sb2FkRm9sZGVyID0gaXNBbmRyb2lkID8gYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VQdWJsaWNEaXJlY3RvcnkoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5ESVJFQ1RPUllfRE9XTkxPQURTKS5nZXRBYnNvbHV0ZVBhdGgoKSA6ICcnO1xyXG5cclxuXHJcblx0LyoqIGxvYWQganNvbiBmcm9tIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBleGlzdHMoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBtZS5kb2N1bWVudEZvbGRlci5jb250YWlucyhmaWxlbmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKiogc2F2ZSBqc29uIHRvIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBzYXZlRmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS53cml0ZVN5bmMoZGF0YSwgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJlc29sdmUoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGxvYWQganNvbiBmcm9tIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBsb2FkSlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUucmVhZFRleHQoKS50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHRcdFx0dmFyIHJldHVyblZhbHVlID0gbnVsbDtcclxuXHRcdFx0XHRpZiAoY29udGVudCAhPSBcIlwiKSByZXR1cm5WYWx1ZSA9IEpTT04ucGFyc2UoY29udGVudCk7XHJcblx0XHRcdFx0cmVzb2x2ZShyZXR1cm5WYWx1ZSk7XHJcblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBzYXZlIGpzb24gdG8gYSBmaWxlICovXHJcblx0cHVibGljIHNhdmVKU09ORmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS53cml0ZVRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdFx0XHRyZXNvbHZlKGNvbnRlbnQpO1xyXG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyoqIGVtcHR5IHRoZSBmaWxlICovXHJcblx0cHVibGljIGNsZWFySlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIGZpbGUgPSB0aGlzLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0ZmlsZS53cml0ZVRleHQoSlNPTi5zdHJpbmdpZnkoe30pKTtcclxuXHR9XHJcblxyXG5cdC8vKiogY3JlYXRlIGEgZnVsbCBmaWxlbmFtZSBpbmNsdWRpbmcgdGhlIGZvbGRlciBmb3IgdGhlIGN1cnJlbnQgYXBwICovXHJcblx0cHVibGljIGdldEZ1bGxGaWxlbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUucGF0aC5qb2luKG1lLmRvY3VtZW50Rm9sZGVyLnBhdGgsIGZpbGVuYW1lKTtcclxuXHR9XHJcblx0Ly8qKiBjcmVhdGUgYSBmdWxsIGZpbGVuYW1lIGluY2x1ZGluZyB0aGUgdGVtcCBmb2xkZXIgZm9yIHRoZSBjdXJyZW50IGFwcCAqL1xyXG5cdHB1YmxpYyBnZXRGdWxsVGVtcEZpbGVuYW1lKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5wYXRoLmpvaW4obWUudGVtcEZvbGRlci5wYXRoLCBmaWxlbmFtZSk7XHJcblx0fVxyXG5cdC8vIHB1YmxpYyBkZWxldGVGaWxlKHBhcnR5OiBzdHJpbmcpIHtcclxuXHQvLyBcdHZhciBmaWxlID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCkuZ2V0RmlsZShwYXJ0eSk7XHJcblx0Ly8gXHRmaWxlLlxyXG5cdC8vIH1cclxuXHJcblxyXG5cdHB1YmxpYyBkb3dubG9hZFVybCh1cmwsIGZpbGVQYXRoKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHJcblx0XHRcdGh0dHAuZ2V0RmlsZSh1cmwsIGZpbGVQYXRoKS50aGVuKGZ1bmN0aW9uIChyKSB7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSByLnJlYWRTeW5jKCk7XHJcblx0XHRcdFx0Y2FsbC5vcGVuRmlsZShmaWxlUGF0aCk7XHJcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gbmV3IEVycm9yKFwiRXJyb3IgZG93bmxvYWRpbmcgJ1wiICsgZmlsZVBhdGggKyBcIicuIFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJY29tcG9zZUVtYWlsIHtcclxuXHR0bzogc3RyaW5nO1xyXG5cdHN1YmplY3Q/OiBzdHJpbmc7XHJcblx0Ym9keT86IHN0cmluZztcclxuXHRzYWx1dGF0aW9uPzogc3RyaW5nO1xyXG5cdGRlYXI/OiBzdHJpbmc7XHJcblx0cmVnYXJkcz86IHN0cmluZztcclxufVxyXG5cclxuLyoqIGNhbGwgdGhpcmRwYXJ0eSBhcHBzICovXHJcbmV4cG9ydCBjbGFzcyBDYWxsIHtcclxuXHJcblx0LyoqIGNvbXBvc2UgYW4gZW1haWwgKi9cclxuXHRwdWJsaWMgY29tcG9zZUVtYWlsKG1lc3NhZ2U6IEljb21wb3NlRW1haWwpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgc3ViamVjdCA9IChtZXNzYWdlLnN1YmplY3QgfHwgXCJTdXBwb3J0XCIpO1xyXG5cdFx0aWYgKCFtZXNzYWdlLmJvZHkpIHtcclxuXHRcdFx0bWVzc2FnZS5ib2R5ID0gKG1lc3NhZ2Uuc2FsdXRhdGlvbiB8fCAobWVzc2FnZS5kZWFyID8gXCJEZWFyIFwiICsgbWVzc2FnZS5kZWFyIDogbnVsbCkgfHwgXCJEZWFyIE1hZGFtL1NpclwiKTtcclxuXHRcdFx0aWYgKG1lc3NhZ2UucmVnYXJkcykgbWVzc2FnZS5ib2R5ICs9IFwiPEJSPjxCUj48QlI+UmVnYXJkczxCUj5cIiArIG1lc3NhZ2UucmVnYXJkcztcclxuXHRcdH1cclxuXHJcblx0XHRlbWFpbC5hdmFpbGFibGUoKS50aGVuKGZ1bmN0aW9uIChhdmFpbCkge1xyXG5cdFx0XHRpZiAoYXZhaWwpIHtcclxuXHRcdFx0XHRyZXR1cm4gZW1haWwuY29tcG9zZSh7XHJcblx0XHRcdFx0XHR0bzogW21lc3NhZ2UudG9dLFxyXG5cdFx0XHRcdFx0c3ViamVjdDogc3ViamVjdCxcclxuXHRcdFx0XHRcdGJvZHk6IG1lc3NhZ2UuYm9keSxcclxuXHRcdFx0XHRcdGFwcFBpY2tlclRpdGxlOiAnQ29tcG9zZSB3aXRoLi4nIC8vIGZvciBBbmRyb2lkLCBkZWZhdWx0OiAnT3BlbiB3aXRoLi4nXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbWFpbCBub3QgYXZhaWxhYmxlXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJFbWFpbCBjb21wb3NlciBjbG9zZWRcIik7XHJcblx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdGFsZXJ0KGVyci5tZXNzYWdlKTtcclxuXHRcdH0pOztcclxuXHR9XHJcblxyXG5cdC8qKiBtYWtlIGEgcGhvbmUgY2FsbCAqL1xyXG5cdHB1YmxpYyBwaG9uZURpYWwoUGhvbmVObzogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cGhvbmUuZGlhbChQaG9uZU5vLCB0cnVlKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvcGVuRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGZpbGVuYW1lID0gZmlsZVBhdGgudG9Mb3dlckNhc2UoKTtcclxuXHRcdHRyeSB7XHJcblx0XHRcdGlmIChhbmRyb2lkKSB7XHJcblx0XHRcdFx0aWYgKGZpbGVuYW1lLnN1YnN0cigwLCA3KSAhPSBcImZpbGU6Ly9cIiB8fCBmaWxlbmFtZS5zdWJzdHIoMCwgMTApICE9IFwiY29udGVudDovL1wiKSBmaWxlbmFtZSA9IFwiZmlsZTovL1wiICsgZmlsZW5hbWU7XHJcblx0XHRcdFx0aWYgKGFuZHJvaWQub3MuQnVpbGQuVkVSU0lPTi5TREtfSU5UID4gYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OX0NPREVTLk0pIGZpbGVuYW1lID0gZmlsZW5hbWUucmVwbGFjZShcImZpbGU6Ly9cIiwgXCJjb250ZW50Oi8vXCIpO1xyXG5cclxuXHRcdFx0XHR2YXIgdXJpID0gYW5kcm9pZC5uZXQuVXJpLnBhcnNlKGZpbGVuYW1lLnRyaW0oKSk7XHJcblx0XHRcdFx0dmFyIHR5cGUgPSBcImFwcGxpY2F0aW9uL1wiICsgKChleHBvcnRzLnN0ci5pbkxpc3QoZmlsZW5hbWUuc2xpY2UoLTQpLCBbJy5wZGYnLCAnLmRvYycsICcueG1sJ10pKSA/IGZpbGVuYW1lLnNsaWNlKC0zKSA6IFwiKlwiKTtcclxuXHJcblx0XHRcdFx0Ly9DcmVhdGUgaW50ZW50XHJcblx0XHRcdFx0dmFyIGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1ZJRVcpO1xyXG5cdFx0XHRcdGludGVudC5zZXREYXRhQW5kVHlwZSh1cmksIHR5cGUpO1xyXG5cdFx0XHRcdGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfQUNUSVZJVFlfTkVXX1RBU0spO1xyXG5cdFx0XHRcdGFwcGxpY2F0aW9uLmFuZHJvaWQuY3VycmVudENvbnRleHQuc3RhcnRBY3Rpdml0eShpbnRlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGlvcy5vcGVuRmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0YWxlcnQoJ0Nhbm5vdCBvcGVuIGZpbGUgJyArIGZpbGVuYW1lICsgJy4gJyArIGUubWVzc2FnZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG5cclxuLyoqIEV4dGVuZGluZyBOYXRpdmVzY3JpcHQgQXV0b2NvbXBsZXRlICovXHJcbmV4cG9ydCBjbGFzcyBUb2tlbkl0ZW0gZXh0ZW5kcyBhdXRvY29tcGxldGVNb2R1bGUuVG9rZW5Nb2RlbCB7XHJcblx0dmFsdWU6IG51bWJlcjtcclxuXHRjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIGltYWdlPzogc3RyaW5nKSB7XHJcblx0XHRzdXBlcih0ZXh0LCBpbWFnZSB8fCBudWxsKTtcclxuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuXHR9XHJcblxyXG59O1xyXG5cclxuZXhwb3J0IHZhciB0YWdnaW5nID0gbmV3IFRhZ2dpbmcoKTtcclxuZXhwb3J0IHZhciBzdHIgPSBuZXcgU3RyKCk7XHJcbmV4cG9ydCB2YXIgc3FsID0gbmV3IFNxbCgpO1xyXG5leHBvcnQgdmFyIGR0ID0gbmV3IER0KCk7XHJcbmV4cG9ydCB2YXIgdmlld0V4dCA9IG5ldyBWaWV3RXh0KCk7XHJcbmV4cG9ydCB2YXIgZmlsZSA9IG5ldyBGaWxlKCk7XHJcbmV4cG9ydCB2YXIgY2FsbCA9IG5ldyBDYWxsKCk7XHJcbmV4cG9ydCB2YXIgdXRpbHMgPSBuZXcgVXRpbHMoKTtcclxuIl19