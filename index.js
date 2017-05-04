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
        this.items.unshift(item);
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
        if (!index || index < 0 || index >= me.items.length)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFXLFFBQUEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU5Qix5Q0FBMkM7QUFDM0MsK0JBQWlDO0FBRWpDLGtEQUFvRDtBQUNwRCw4Q0FBZ0Q7QUFDaEQsMENBQTRDO0FBQzVDLDBDQUE0QztBQUM1QywyQkFBNkI7QUFDN0IsNkVBQStFO0FBRS9FLDBEQUF3RDtBQUN4RCxxQ0FBcUM7QUFDckMscUNBQWlDO0FBTWpDLHlCQUF5QjtBQUN6QjtJQUFBO0lBb0RBLENBQUM7SUFsREEseURBQXlEO0lBQ2xELHNDQUFzQixHQUE3QixVQUFpQyxPQUF1QixFQUFFLElBQVM7UUFDbEUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBTSxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM3QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJELEdBQUcsQ0FBQyxDQUFDLElBQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxQixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztnQkFDRixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBWSxJQUFJLHVEQUFvRCxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsa0NBQWtDO0lBQzNCLDBCQUFVLEdBQWpCLFVBQXFCLE9BQXVCLEVBQUUsSUFBUztRQUN0RCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzdCLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFckQsR0FBRyxDQUFDLENBQUMsSUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFPLElBQUksTUFBRyxDQUFDLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN4QixFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztvQkFDRCxJQUFJLENBQUMsQ0FBQzt3QkFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztnQkFDRixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBWSxJQUFJLHVEQUFvRCxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDRixDQUFDO1FBQ0YsQ0FBQztJQUNGLENBQUM7SUFHRixZQUFDO0FBQUQsQ0FBQyxBQXBERCxJQW9EQztBQXBEWSxzQkFBSztBQXNEbEIsd0JBQXdCO0FBQ3hCO0lBQUE7UUFFQyx1QkFBdUI7UUFDaEIsWUFBTyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MseUJBQXlCO1FBQ2xCLGNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBcUdoRCxDQUFDO0lBbkdBOztNQUVFO0lBQ0ssd0JBQU0sR0FBYixVQUFjLElBQWE7UUFDMUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDVCw0REFBNEQ7SUFDN0QsQ0FBQztJQUVELDJFQUEyRTtJQUNwRSx3QkFBTSxHQUFiLFVBQWMsS0FBWTtRQUN6QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxlQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkQsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7SUFDRCw2RUFBNkU7SUFDdEUsMEJBQVEsR0FBZixVQUFnQixLQUFZO1FBQzNCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuRCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUNELCtCQUErQjtJQUN4QiwrQkFBYSxHQUFwQixVQUFxQixJQUFZO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO0lBQ0YsQ0FBQztJQUVELDRCQUE0QjtJQUNyQiwyQkFBUyxHQUFoQixVQUFpQixHQUFRO1FBQ3hCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsR0FBRyxHQUFHLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNqQyxJQUFJLElBQUksR0FBRyxlQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNuRCxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVELG1DQUFtQztJQUM1QiwyQkFBUyxHQUFoQixVQUFpQixHQUFRO1FBQ3hCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN0QixFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVELHVDQUF1QztJQUNoQyxrQ0FBZ0IsR0FBdkIsVUFBd0IsWUFBeUM7UUFDaEUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsNENBQTRDO0lBQ3JDLHFDQUFtQixHQUExQixVQUEyQixLQUEyQixFQUFFLEtBQWE7UUFDcEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDL0MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCx1Q0FBdUM7SUFDaEMsdUJBQUssR0FBWixVQUFhLEtBQVk7UUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCw4Q0FBOEM7SUFDdkMsNkJBQVcsR0FBbEIsVUFBbUIsS0FBWTtRQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pDLENBQUM7SUFDRCxnREFBZ0Q7SUFDekMsK0JBQWEsR0FBcEIsVUFBcUIsS0FBWTtRQUNoQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pDLENBQUM7SUFDRCw0Q0FBNEM7SUFDckMsK0JBQWEsR0FBcEIsVUFBcUIsS0FBWTtRQUNoQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ25CLENBQUM7SUFDRCw4Q0FBOEM7SUFDdkMsaUNBQWUsR0FBdEIsVUFBdUIsS0FBWTtRQUNsQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDbkIsQ0FBQztJQUdGLGNBQUM7QUFBRCxDQUFDLEFBMUdELElBMEdDO0FBMUdZLDBCQUFPO0FBNEdwQixvQkFBb0I7QUFDcEI7SUFBQTtJQU1BLENBQUM7SUFMQSxPQUFPO0lBQ1AsdUZBQXVGO0lBQ2hGLGtCQUFJLEdBQVgsVUFBWSxLQUFLO1FBQ2hCLE1BQU0sQ0FBQyxVQUFFLENBQUMsa0RBQWtELEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNGLFVBQUM7QUFBRCxDQUFDLEFBTkQsSUFNQztBQU5ZLGtCQUFHO0FBUWhCLHVCQUF1QjtBQUN2QjtJQUFBO0lBa0lBLENBQUM7SUFoSUEsa0NBQWtDO0lBQzNCLHFDQUF1QixHQUE5QixVQUErQixHQUFXO1FBQ3pDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztZQUM3RCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELG1IQUFtSDtJQUM1Ryx5QkFBVyxHQUFsQixVQUFtQixJQUFXLEVBQUUsV0FBbUIsRUFBRSxVQUFrQjtRQUN0RSxVQUFVLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3JDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksa0NBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsc0hBQXNIO0lBQy9HLGdDQUFrQixHQUF6QixVQUEwQixJQUFXLEVBQUUsV0FBcUIsRUFBRSxVQUFrQjtRQUMvRSxVQUFVLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3JDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBRXpDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMzRyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUVkLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksa0NBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsK0NBQStDO0lBQ3hDLG9CQUFNLEdBQWIsVUFBYyxLQUFhLEVBQUUsU0FBbUI7UUFDL0MsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsd0VBQXdFO0lBQ2pFLHlCQUFXLEdBQWxCLFVBQW1CLEdBQVcsRUFBRSxVQUFvQjtRQUNuRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3QyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDcEQsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsd0dBQXdHO0lBQ2pHLDJCQUFhLEdBQXBCLFVBQXFCLEtBQVksRUFBRSxXQUFtQixFQUFFLFdBQWdCO1FBQ3ZFLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRztZQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRCwyR0FBMkc7SUFDcEcsa0NBQW9CLEdBQTNCLFVBQTRCLElBQVcsRUFBRSxXQUFxQixFQUFFLFVBQWtCO1FBQ2pGLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUM3QixVQUFVLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3JDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBRXpDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMzRyxDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUVkLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUNyQixDQUFDO0lBRUQsaUhBQWlIO0lBQzFHLDBCQUFZLEdBQW5CLFVBQW9CLEtBQVksRUFBRSxXQUFtQixFQUFFLFdBQWdCO1FBQ3RFLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELCtDQUErQztJQUN4Qyw2QkFBZSxHQUF0QixVQUF1QixLQUFrQjtRQUN4QyxNQUFNLENBQUMsSUFBSSxrQ0FBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCwrQ0FBK0M7SUFDeEMsd0JBQVUsR0FBakIsVUFBa0IsR0FBRztRQUNwQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxrQ0FBa0M7SUFDM0IsNkJBQWUsR0FBdEIsVUFBdUIsS0FBaUIsRUFBRSxVQUFrQjtRQUMzRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELG1FQUFtRTtJQUM1RCwwQkFBWSxHQUFuQixVQUFvQixLQUEyQixFQUFFLFNBQWM7UUFDOUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0lBRUQsa0VBQWtFO0lBQzNELHlCQUFXLEdBQWxCLFVBQW1CLEtBQTJCLEVBQUUsU0FBYztRQUM3RCwyRUFBMkU7UUFDM0UsNERBQTREO1FBQzVELG1DQUFtQztRQUNuQyxLQUFLO1FBQ0wsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDdkIsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDdkQsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNCLElBQUksSUFBSSxHQUFHLElBQUksZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHO2dCQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztJQUNGLENBQUM7SUFFTSx5QkFBVyxHQUFsQixVQUFtQixPQUFPO1FBQ3pCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUNyQixHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsQ0FBQztnQkFBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUFBLENBQUM7UUFDRixNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3BCLENBQUM7SUFFRCw4REFBOEQ7SUFDdkQscUJBQU8sR0FBZCxVQUFpQyxDQUFXO1FBQzNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7WUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDWixDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFJRixVQUFDO0FBQUQsQ0FBQyxBQWxJRCxJQWtJQztBQWxJWSxrQkFBRztBQW9JaEIscUJBQXFCO0FBQ3JCO0lBQUE7SUFnSUEsQ0FBQztJQTlITyxtQkFBTSxHQUFiLFVBQWMsSUFBVztRQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDO0lBQ0YsQ0FBQztJQUVELHVGQUF1RjtJQUN2RiwyQkFBMkI7SUFDcEIseUJBQVksR0FBbkIsVUFBb0IsR0FBVyxFQUFFLElBQVc7UUFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUNELG9CQUFvQjtJQUNiLDBCQUFhLEdBQXBCLFVBQXFCLElBQVcsRUFBRSxRQUFpQjtRQUNsRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFFLENBQUM7SUFFRCxrQkFBa0I7SUFDWCx3QkFBVyxHQUFsQixVQUFtQixJQUFXLEVBQUUsUUFBaUI7UUFDaEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN4RSxDQUFDO0lBRUQsdUZBQXVGO0lBQ3ZGLDRCQUE0QjtJQUNyQiwwQkFBYSxHQUFwQixVQUFxQixHQUFXLEVBQUUsSUFBVztRQUM1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBQ0QscUJBQXFCO0lBQ2QsMkJBQWMsR0FBckIsVUFBc0IsSUFBVyxFQUFFLFNBQWtCO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0UsQ0FBQztJQUVELG1CQUFtQjtJQUNaLHlCQUFZLEdBQW5CLFVBQW9CLElBQVcsRUFBRSxTQUFrQjtRQUNsRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNFLENBQUM7SUFFRCx1RkFBdUY7SUFDdkYsMEJBQTBCO0lBQ25CLHdCQUFXLEdBQWxCLFVBQW1CLEdBQVcsRUFBRSxJQUFXO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRCx1RkFBdUY7SUFDdkYsb0JBQW9CO0lBQ2IsMEJBQWEsR0FBcEIsVUFBcUIsSUFBVyxFQUFFLFFBQWlCO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0UsQ0FBQztJQUNELGtCQUFrQjtJQUNYLHdCQUFXLEdBQWxCLFVBQW1CLElBQVcsRUFBRSxRQUFpQjtRQUNoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzNFLENBQUM7SUFHRCxtR0FBbUc7SUFDbkcsOENBQThDO0lBQ3ZDLHlCQUFZLEdBQW5CLFVBQW9CLElBQVc7UUFDOUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQyxDQUFDO0lBQ0YsQ0FBQztJQUVELDhDQUE4QztJQUN2QyxzQkFBUyxHQUFoQixVQUFpQixJQUFXO1FBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCw4Q0FBOEM7SUFDdkMsc0JBQVMsR0FBaEIsVUFBaUIsSUFBVztRQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLHNCQUFTLEdBQWhCLFVBQWlCLElBQVk7UUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDNUMsQ0FBQztJQUNGLENBQUM7SUFDRCx3Q0FBd0M7SUFDakMsd0JBQVcsR0FBbEIsVUFBbUIsSUFBWTtRQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNGLENBQUM7SUFDRCx1Q0FBdUM7SUFDaEMsd0JBQVcsR0FBbEIsVUFBbUIsSUFBVztRQUM3QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzdCLElBQUksTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLHFDQUFxQztRQUN2RSxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzlDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN0RixNQUFNLENBQUMsUUFBUSxDQUFBO0lBQ2hCLENBQUM7SUFDRCx1Q0FBdUM7SUFDaEMsOEJBQWlCLEdBQXhCLFVBQXlCLFdBQW9CO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsdUNBQXVDO0lBQ2hDLHdCQUFXLEdBQWxCLFVBQW1CLElBQVc7UUFDN0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUM5RCxNQUFNLENBQUMsT0FBTyxDQUFBO0lBQ2YsQ0FBQztJQUNELHVDQUF1QztJQUNoQyw4QkFBaUIsR0FBeEIsVUFBeUIsV0FBb0I7UUFDNUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNwQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6RixDQUFDO0lBQ0YsU0FBQztBQUFELENBQUMsQUFoSUQsSUFnSUM7QUFoSVksZ0JBQUU7QUFrSWYsc0NBQXNDO0FBQ3RDO0lBQUE7SUF3QkEsQ0FBQztJQXRCQSwwQ0FBMEM7SUFDbkMsaUNBQWUsR0FBdEIsVUFBdUIsSUFBbUI7UUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUM7UUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELDBDQUEwQztJQUNuQyw0QkFBVSxHQUFqQixVQUFrQixJQUFtQjtRQUNwQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNsQixFQUFFLENBQUMsQ0FBQyxvQkFBUyxDQUFDO1lBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzVELENBQUM7SUFFRCxnREFBZ0Q7SUFDekMsa0NBQWdCLEdBQXZCLFVBQXdCLElBQW1CO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQ2xCLElBQUksQ0FBQztZQUNFLElBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWpCLENBQUM7SUFDRixDQUFDO0lBQ0YsY0FBQztBQUFELENBQUMsQUF4QkQsSUF3QkM7QUF4QlksMEJBQU87QUErQnBCLHlCQUF5QjtBQUN6QjtJQVFDLG1CQUFZLEtBQXlCO1FBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQy9CLENBQUM7SUFKRCxzQkFBSSw2QkFBTTtRQURWLDBCQUEwQjthQUMxQixjQUF1QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQU1sRCxpQ0FBaUM7SUFDMUIsMkJBQU8sR0FBZCxVQUFlLElBQWdCO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxrREFBa0Q7SUFDM0MsZ0NBQVksR0FBbkIsVUFBb0IsSUFBZ0I7UUFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELGtDQUFrQztJQUMzQiw0QkFBUSxHQUFmO1FBQ0MsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDbkIsQ0FBQztJQUVELCtCQUErQjtJQUN4QiwyQkFBTyxHQUFkLFVBQWUsS0FBYTtRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsK0NBQStDO0lBQ3hDLDJCQUFPLEdBQWQsVUFBZSxLQUFhO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsNENBQTRDO0lBQ3JDLGdDQUFZLEdBQW5CO1FBQ0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBYSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVELHVDQUF1QztJQUNoQyw0QkFBUSxHQUFmLFVBQWdCLEtBQWE7UUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDYixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxzRkFBc0Y7SUFFL0UsNEJBQVEsR0FBZixVQUFnQixLQUFVLEVBQUUsWUFBcUI7UUFDaEQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztJQUNqRCxDQUFDO0lBQ0YsZ0JBQUM7QUFBRCxDQUFDLEFBN0RELElBNkRDO0FBN0RZLDhCQUFTO0FBK0R0Qix5QkFBeUI7QUFDekI7SUFlQyxvQkFBWSxLQUFrQixFQUFFLGVBQXdCLEVBQUUsaUJBQTBCO1FBYnBGLGdDQUFnQztRQUN4QixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBTWIsb0JBQWUsR0FBRyxhQUFhLENBQUM7UUFDaEMsc0JBQWlCLEdBQUcsZUFBZSxDQUFDO1FBTTFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFaRCxzQkFBVyw2QkFBSztRQURoQixrQ0FBa0M7YUFDbEMsY0FBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUEsQ0FBQyxDQUFDO1FBQ3pDLGtDQUFrQzthQUNsQyxVQUFpQixLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBQyxDQUFDOzs7T0FGTjtJQVF6QyxzQkFBVyw4QkFBTTtRQURqQiwwQkFBMEI7YUFDMUIsY0FBOEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFNekQsaUNBQWlDO0lBQzFCLDRCQUFPLEdBQWQsVUFBZSxJQUFnQjtRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsaUNBQWlDO0lBQzFCLDZCQUFRLEdBQWYsVUFBZ0IsS0FBaUIsRUFBRSxlQUF1QixFQUFFLGlCQUF5QjtRQUNwRixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUM7WUFBQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUM1RCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztZQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztJQUNuRSxDQUFDO0lBRUQsa0RBQWtEO0lBQzNDLGlDQUFZLEdBQW5CLFVBQW9CLElBQWdCO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFHRCwrQkFBK0I7SUFDeEIsNEJBQU8sR0FBZCxVQUFlLEtBQWE7UUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELCtDQUErQztJQUN4Qyw0QkFBTyxHQUFkLFVBQWUsS0FBYTtRQUMzQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsaURBQWlEO0lBQzFDLGlDQUFZLEdBQW5CO1FBQ0MsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBYSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRUQsNkNBQTZDO0lBQ3RDLDZCQUFRLEdBQWYsVUFBZ0IsS0FBYTtRQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDakUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCw2RkFBNkY7SUFDdEYsNkJBQVEsR0FBZixVQUFnQixLQUFVLEVBQUUsWUFBcUI7UUFDaEQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUNELE1BQU0sQ0FBQyxZQUFZLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQztJQUNqRCxDQUFDO0lBQ0YsaUJBQUM7QUFBRCxDQUFDLEFBMUVELElBMEVDO0FBMUVZLGdDQUFVO0FBNkV2Qiw0QkFBNEI7QUFDNUI7SUFBQTtRQUVRLG1CQUFjLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTNELGVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFbEQsbUJBQWMsR0FBRyxvQkFBUyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLGlDQUFpQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBMkZqSyxDQUFDO0lBeEZBLDRCQUE0QjtJQUNyQixxQkFBTSxHQUFiLFVBQWMsUUFBZ0I7UUFDN0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCwwQkFBMEI7SUFDbkIsdUJBQVEsR0FBZixVQUFnQixRQUFnQixFQUFFLElBQUk7UUFDckMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07WUFDM0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxHQUFHO2dCQUNqQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1osTUFBTSxDQUFDO1lBQ1IsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELDRCQUE0QjtJQUNyQiwyQkFBWSxHQUFuQixVQUFvQixRQUFnQjtRQUNuQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUMzQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsT0FBTztnQkFDckMsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO29CQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRztnQkFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCwwQkFBMEI7SUFDbkIsMkJBQVksR0FBbkIsVUFBb0IsUUFBZ0IsRUFBRSxJQUFJO1FBQ3pDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1lBQzNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLE9BQU87Z0JBQzFELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHO2dCQUNyQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELHNCQUFzQjtJQUNmLDRCQUFhLEdBQXBCLFVBQXFCLFFBQWdCLEVBQUUsSUFBSTtRQUMxQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsdUVBQXVFO0lBQ2hFLDhCQUFlLEdBQXRCLFVBQXVCLFFBQWdCO1FBQ3RDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFDRCw0RUFBNEU7SUFDckUsa0NBQW1CLEdBQTFCLFVBQTJCLFFBQWdCO1FBQzFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFDRCxxQ0FBcUM7SUFDckMsd0VBQXdFO0lBQ3hFLFNBQVM7SUFDVCxJQUFJO0lBR0csMEJBQVcsR0FBbEIsVUFBbUIsR0FBRyxFQUFFLFFBQVE7UUFDL0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07WUFFM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztnQkFDM0MsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDUCxPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7Z0JBQ25CLElBQUksR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLHFCQUFxQixHQUFHLFFBQVEsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRixXQUFDO0FBQUQsQ0FBQyxBQWpHRCxJQWlHQztBQWpHWSxvQkFBSTtBQTZHakIsMkJBQTJCO0FBQzNCO0lBQUE7SUE0REEsQ0FBQztJQTFEQSx1QkFBdUI7SUFDaEIsMkJBQVksR0FBbkIsVUFBb0IsT0FBc0I7UUFDekMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkIsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLGdCQUFnQixDQUFDLENBQUM7WUFDMUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFBQyxPQUFPLENBQUMsSUFBSSxJQUFJLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDbEYsQ0FBQztRQUVELEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7b0JBQ3BCLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ2hCLE9BQU8sRUFBRSxPQUFPO29CQUNoQixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7b0JBQ2xCLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxzQ0FBc0M7aUJBQ3ZFLENBQUMsQ0FBQTtZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDUCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDeEMsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHO1lBQ3JCLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFBQSxDQUFDO0lBQ0wsQ0FBQztJQUVELHdCQUF3QjtJQUNqQix3QkFBUyxHQUFoQixVQUFpQixPQUFlO1FBQy9CLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSx1QkFBUSxHQUFmLFVBQWdCLFFBQWdCO1FBQy9CLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUM7WUFDSixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNiLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxZQUFZLENBQUM7b0JBQUMsUUFBUSxHQUFHLFNBQVMsR0FBRyxRQUFRLENBQUM7Z0JBQ2xILEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBRTlILElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDakQsSUFBSSxJQUFJLEdBQUcsY0FBYyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBRTVILGVBQWU7Z0JBQ2YsSUFBSSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDL0QsV0FBVyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFELENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFDTCxXQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hCLENBQUM7UUFDRixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNaLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxRQUFRLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRCxDQUFDO0lBQ0YsQ0FBQztJQUVGLFdBQUM7QUFBRCxDQUFDLEFBNURELElBNERDO0FBNURZLG9CQUFJO0FBOERqQiwwQ0FBMEM7QUFDMUM7SUFBK0IsNkJBQTZCO0lBRTNELG1CQUFZLElBQVksRUFBRSxLQUFhLEVBQUUsS0FBYztRQUF2RCxZQUNDLGtCQUFNLElBQUksRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLFNBRTFCO1FBREEsS0FBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7O0lBQ3BCLENBQUM7SUFFRixnQkFBQztBQUFELENBQUMsQUFQRCxDQUErQixrQkFBa0IsQ0FBQyxVQUFVLEdBTzNEO0FBUFksOEJBQVM7QUFPckIsQ0FBQztBQUVTLFFBQUEsT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7QUFDeEIsUUFBQSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFBLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUEsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDZCxRQUFBLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFFBQUEsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDbEIsUUFBQSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNsQixRQUFBLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHZhciBzZiA9IHJlcXVpcmUoJ3NmJyk7XHJcblxyXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwiYXBwbGljYXRpb25cIjtcclxuaW1wb3J0ICogYXMgbW9tZW50IGZyb20gXCJtb21lbnRcIjtcclxuaW1wb3J0ICogYXMgdmlldyBmcm9tIFwidWkvY29yZS92aWV3XCI7XHJcbmltcG9ydCAqIGFzIG9ic2VydmFibGVNb2R1bGUgZnJvbSBcImRhdGEvb2JzZXJ2YWJsZVwiO1xyXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtTW9kdWxlIGZyb20gXCJmaWxlLXN5c3RlbVwiO1xyXG5pbXBvcnQgKiBhcyBwaG9uZSBmcm9tIFwibmF0aXZlc2NyaXB0LXBob25lXCI7XHJcbmltcG9ydCAqIGFzIGVtYWlsIGZyb20gXCJuYXRpdmVzY3JpcHQtZW1haWxcIjtcclxuaW1wb3J0ICogYXMgaHR0cCBmcm9tIFwiaHR0cFwiO1xyXG5pbXBvcnQgKiBhcyBhdXRvY29tcGxldGVNb2R1bGUgZnJvbSAnbmF0aXZlc2NyaXB0LXRlbGVyaWstdWktcHJvL2F1dG9jb21wbGV0ZSc7XHJcblxyXG5pbXBvcnQgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlLWFycmF5XCI7XHJcbmltcG9ydCB7IGlzQW5kcm9pZCB9IGZyb20gXCJwbGF0Zm9ybVwiO1xyXG5pbXBvcnQgeyBpb3MgfSBmcm9tIFwidXRpbHMvdXRpbHNcIlxyXG5cclxuZGVjbGFyZSB2YXIgYW5kcm9pZDogYW55O1xyXG5kZWNsYXJlIHZhciBqYXZhOiBhbnk7XHJcblxyXG5cclxuLy9NaXNjZWxsYW5pb3VzIEZ1bmN0aW9uc1xyXG5leHBvcnQgY2xhc3MgVXRpbHMge1xyXG5cclxuXHQvL0NyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBhbiBvYmplY3QgZnJvbSBhbiBleGlzdGluZyBvbmVcclxuXHRwdWJsaWMgY3JlYXRlSW5zdGFuY2VGcm9tSnNvbjxUPihvYmpUeXBlOiB7IG5ldyAoKTogVDsgfSwganNvbjogYW55KSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Y29uc3QgbmV3T2JqID0gbmV3IG9ialR5cGUoKTtcclxuXHRcdGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBvYmpUeXBlW1wicmVsYXRpb25zaGlwc1wiXSB8fCB7fTtcclxuXHJcblx0XHRmb3IgKGNvbnN0IHByb3AgaW4ganNvbikge1xyXG5cdFx0XHRpZiAoanNvbi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG5cdFx0XHRcdGlmIChuZXdPYmpbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0aWYgKHJlbGF0aW9uc2hpcHNbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRuZXdPYmpbcHJvcF0gPSBqc29uW3Byb3BdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdG5ld09ialtwcm9wXSA9IG1lLmNyZWF0ZUluc3RhbmNlRnJvbUpzb24ocmVsYXRpb25zaGlwc1twcm9wXSwganNvbltwcm9wXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBQcm9wZXJ0eSAke3Byb3B9IG5vdCBzZXQgYmVjYXVzZSBpdCBhbHJlYWR5IGV4aXN0ZWQgb24gdGhlIG9iamVjdC5gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3T2JqO1xyXG5cdH1cclxuXHJcblx0Ly9hZGRzIG1pc3NpbmcgZnVuY3Rpb25zIHRvIG9iamVjdFxyXG5cdHB1YmxpYyBpbml0T2JqZWN0PFQ+KG9ialR5cGU6IHsgbmV3ICgpOiBUOyB9LCBqc29uOiBhbnkpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRjb25zdCBuZXdPYmogPSBuZXcgb2JqVHlwZSgpO1xyXG5cdFx0Y29uc3QgcmVsYXRpb25zaGlwcyA9IG9ialR5cGVbXCJyZWxhdGlvbnNoaXBzXCJdIHx8IHt9O1xyXG5cclxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBuZXdPYmopIHtcclxuXHRcdFx0aWYgKG5ld09iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG5cdFx0XHRcdGNvbnNvbGUud2FybihgQWRkICR7cHJvcH0uYCk7XHJcblx0XHRcdFx0aWYgKGpzb25bcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0aWYgKHJlbGF0aW9uc2hpcHNbcHJvcF0gPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHRqc29uW3Byb3BdID0gbmV3T2JqW3Byb3BdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdGpzb25bcHJvcF0gPSBtZS5jcmVhdGVJbnN0YW5jZUZyb21Kc29uKHJlbGF0aW9uc2hpcHNbcHJvcF0sIG5ld09ialtwcm9wXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBQcm9wZXJ0eSAke3Byb3B9IG5vdCBzZXQgYmVjYXVzZSBpdCBhbHJlYWR5IGV4aXN0ZWQgb24gdGhlIG9iamVjdC5gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLyoqIFRhZ2dpbmcgRnVuY3Rpb25zICovXHJcbmV4cG9ydCBjbGFzcyBUYWdnaW5nIHtcclxuXHJcblx0LyoqIGRlZmF1bHQgdGFnIGljb24gKi9cclxuXHRwdWJsaWMgdGFnSWNvbiA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhmMDQ2KTtcclxuXHQvKiogZGVmYXVsdCB1bnRhZyBpY29uICovXHJcblx0cHVibGljIHVuVGFnSWNvbiA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhmMDk2KTtcclxuXHJcblx0LyoqIENyZWF0ZSBhIG5ldyBvYnNlcnZhYmxlIHRhZyBvYmplY3RcclxuXHQqIElmIGljb24gaXMgbGVmdCBibGFuayB0aGUgZGVmYXVsdCBpY29uIGlzIHVzZWQgXHJcblx0Ki9cclxuXHRwdWJsaWMgbmV3VGFnKGljb24/OiBzdHJpbmcpOiBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUge1xyXG5cdFx0aWYgKCFpY29uKSBpY29uID0gdGhpcy51blRhZ0ljb247XHJcblx0XHR2YXIgYSA9IG5ldyBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUoKTtcclxuXHRcdGEuc2V0KFwidmFsdWVcIiwgaWNvbik7XHJcblx0XHRyZXR1cm4gYTtcclxuXHRcdC8vXHRcdHJldHVybiBuZXcgb2JzZXJ2YWJsZU1vZHVsZS5PYnNlcnZhYmxlKHsgdmFsdWU6IGljb24gfSk7XHJcblx0fVxyXG5cclxuXHQvKiogc2V0IGFsbCBhcnJheSBvYmplY3RzIHRhZyBwcm9wZXJ0eSB0byB0aGUgZGVmYXVsdCB0YWdnZWQgaWNvbiBvYmplY3QgKi9cclxuXHRwdWJsaWMgdGFnQWxsKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0aWYgKCFhcnJheVtpXS50YWcpIGFycmF5W2ldLnRhZyA9IHRhZ2dpbmcubmV3VGFnKCk7XHJcblx0XHRcdGFycmF5W2ldLnRhZy5zZXQoXCJ2YWx1ZVwiLCB0YWdnaW5nLnRhZ0ljb24pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGFycmF5O1xyXG5cdH1cclxuXHQvKiogc2V0IGFsbCBhcnJheSBvYmplY3RzIHRhZyBwcm9wZXJ0eSB0byB0aGUgZGVmYXVsdCB1bnRhZ2dlZCBpY29uIG9iamVjdCAqL1xyXG5cdHB1YmxpYyB1blRhZ0FsbChhcnJheTogYW55W10pOiBhbnlbXSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoIWFycmF5W2ldLnRhZykgYXJyYXlbaV0udGFnID0gdGFnZ2luZy5uZXdUYWcoKTtcclxuXHRcdFx0YXJyYXlbaV0udGFnLnNldChcInZhbHVlXCIsIHRhZ2dpbmcudW5UYWdJY29uKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBhcnJheTtcclxuXHR9XHJcblx0LyoqIGdldCB0aGUgdG9nZ2xlZCB0YWcgaWNvbiAqL1xyXG5cdHB1YmxpYyB0b2dnbGVUYWdJY29uKGljb246IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRpZiAoaWNvbiA9PSB0aGlzLnRhZ0ljb24pIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudW5UYWdJY29uO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMudGFnSWNvbjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBUb2dnbGUgdGFnIG9ic2VydmFibGUgKi9cclxuXHRwdWJsaWMgdG9nZ2xlVGFnKHRhZzogYW55KTogYW55IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoIXRhZykgdGFnID0gdGFnZ2luZy5uZXdUYWcoKTtcclxuXHRcdHZhciBpY29uID0gdGFnZ2luZy50b2dnbGVUYWdJY29uKHRhZy5nZXQoXCJ2YWx1ZVwiKSk7XHJcblx0XHR0YWcuc2V0KFwidmFsdWVcIiwgaWNvbik7XHJcblx0XHRyZXR1cm4gdGFnO1xyXG5cdH1cclxuXHJcblx0LyoqIFRvZ2dsZSB0aGUgcm93cyB0YWcgcHJvcGVydHkgKi9cclxuXHRwdWJsaWMgdG9nZ2xlUm93KHJvdzogYW55KTogYW55IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoIXJvdykgcmV0dXJuIG51bGw7XHJcblx0XHRtZS50b2dnbGVUYWcocm93LnRhZyk7XHJcblx0XHRyZXR1cm4gcm93O1xyXG5cdH1cclxuXHJcblx0LyoqIFRvZ2dsZSB0aGUgb2JzZXJ2YWJsZSB0YWcgb2JqZWN0ICovXHJcblx0cHVibGljIHRvZ2dsZU9ic2VydmFibGUob2JlcnZhYmxlVGFnOiBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUpOiBvYnNlcnZhYmxlTW9kdWxlLk9ic2VydmFibGUge1xyXG5cdFx0cmV0dXJuIHRoaXMubmV3VGFnKHRoaXMudG9nZ2xlVGFnSWNvbihvYmVydmFibGVUYWcuZ2V0KFwidmFsdWVcIikpKTtcclxuXHR9XHJcblx0LyoqIFRvZ2dsZSB0aGUgb2JzZXJ2YWJsZSByb3dzIHRhZyBvYmplY3QgKi9cclxuXHRwdWJsaWMgdG9nZ2xlT2JzZXJ2YWJsZVJvdyhhcnJheTogT2JzZXJ2YWJsZUFycmF5PGFueT4sIGluZGV4OiBudW1iZXIpOiBPYnNlcnZhYmxlQXJyYXk8YW55PiB7XHJcblx0XHR2YXIgcm93ID0gdGhpcy50b2dnbGVSb3coYXJyYXkuZ2V0SXRlbShpbmRleCkpO1xyXG5cdFx0YXJyYXkuc2V0SXRlbShpbmRleCwgcm93KTtcclxuXHRcdHJldHVybiBhcnJheTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgbnVtYmVyIG9mIGl0ZW1zIGluIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBjb3VudChhcnJheTogYW55W10pOiBudW1iZXIge1xyXG5cdFx0aWYgKCFhcnJheSkgcmV0dXJuIDA7XHJcblx0XHRyZXR1cm4gYXJyYXkubGVuZ3RoO1xyXG5cdH1cclxuXHQvKiogZ2V0IG51bWJlciBvZiB0YWdnZWQgaXRlbXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGNvdW50VGFnZ2VkKGFycmF5OiBhbnlbXSk6IG51bWJlciB7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gMDtcclxuXHRcdHJldHVybiB0aGlzLmdldFRhZ2dlZFJvd3MoYXJyYXkpLmxlbmd0aDtcclxuXHR9XHJcblx0LyoqIGdldCBudW1iZXIgb2YgdW50YWdnZWQgaXRlbXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGNvdW50VW50YWdnZWQoYXJyYXk6IGFueVtdKTogbnVtYmVyIHtcclxuXHRcdGlmICghYXJyYXkpIHJldHVybiAwO1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGFnZ2VkUm93cyhhcnJheSkubGVuZ3RoO1xyXG5cdH1cclxuXHQvKiogcmV0dXJuIHRoZSB0YWdnZWQgcm93cyBmcm9tIHRoZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBnZXRUYWdnZWRSb3dzKGFycmF5OiBhbnlbXSk6IGFueVtdIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoIWFycmF5KSByZXR1cm4gbnVsbDtcclxuXHRcdHZhciB0YWdnZWRSb3dzID0gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblx0XHRcdHJldHVybiAoeC50YWcgJiYgeC50YWcuZ2V0KFwidmFsdWVcIikgPT0gbWUudGFnSWNvbik7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiB0YWdnZWRSb3dzO1xyXG5cdH1cclxuXHQvKiogcmV0dXJuIHRoZSB1bnRhZ2dlZCByb3dzIGZyb20gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGdldFVuVGFnZ2VkUm93cyhhcnJheTogYW55W10pOiBhbnlbXSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIHRhZ2dlZFJvd3MgPSBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHRcdFx0cmV0dXJuICh4LnRhZyAmJiB4LnRhZy5nZXQoXCJ2YWx1ZVwiKSA9PSBtZS51blRhZ0ljb24pO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdGFnZ2VkUm93cztcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLyoqIFNxbCBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFNxbCB7XHJcblx0Ly9vdGhlclxyXG5cdC8qKiByZXR1cm4gYSBzcWwgc25pcHBlZCB0byBmZXRjaCBhIGNsYXJpb24gZGF0ZSBmcm9tIHRoZSBkYXRhYmFzZSBhcyBhIHN0YW5kYXJkIGRhdGUqL1xyXG5cdHB1YmxpYyBkYXRlKGZpZWxkKSB7XHJcblx0XHRyZXR1cm4gc2YoXCJjb252ZXJ0KHZhcmNoYXIsY29udmVydChkYXRldGltZSx7MH0tMzYxNjMpLDEwMylcIiwgZmllbGQpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqIFN0cmluZyBGdW5jdGlvbnMgKi9cclxuZXhwb3J0IGNsYXNzIFN0ciB7XHJcblxyXG5cdC8qKiByZXR1cm4gYSBVUkkgZW5jb2RlZCBzdHJpbmcgKi9cclxuXHRwdWJsaWMgZml4ZWRFbmNvZGVVUklDb21wb25lbnQodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpLnJlcGxhY2UoL1shJygpKl0vZywgZnVuY3Rpb24gKGMpIHtcclxuXHRcdFx0cmV0dXJuICclJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBvYnNlcnZhYmxlIGFycmF5IHdoZXJlIHRoZSBuYW1lZCBmaWVsZChwcm9wZXJ0eSkgY29udGFpbnMgc3BlY2lmaWMgdGV4dCAoY2FzZSBpbnNlbnNpdGl2ZSkgKi9cclxuXHRwdWJsaWMgZmlsdGVyQXJyYXkoZGF0YTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmcsIHNlYXJjaFRleHQ6IHN0cmluZykge1xyXG5cdFx0c2VhcmNoVGV4dCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKVxyXG5cdFx0dmFyIGZpbHRlcmVkRGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XHJcblx0XHRcdHJldHVybiAoeFtzZWFyY2hGaWVsZF0gJiYgeFtzZWFyY2hGaWVsZF0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFRleHQpID49IDApO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmV3IE9ic2VydmFibGVBcnJheShmaWx0ZXJlZERhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiBhIGZpbHRlcmVkIG9ic2VydmFibGUgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkcyhwcm9wZXJ0aWVzKSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBmaWx0ZXJBcnJheUJ5QXJyYXkoZGF0YTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmdbXSwgc2VhcmNoVGV4dDogc3RyaW5nKSB7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoRmllbGQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoeFtzZWFyY2hGaWVsZFtpXV0gJiYgeFtzZWFyY2hGaWVsZFtpXV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIG5ldyBPYnNlcnZhYmxlQXJyYXkoZmlsdGVyZWREYXRhKTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gdHJ1ZSBpZiB0ZSBzdHJpbmcgaXMgaW4gdGhlIGFycmF5ICovXHJcblx0cHVibGljIGluTGlzdCh2YWx1ZTogc3RyaW5nLCBsaXN0QXJyYXk6IHN0cmluZ1tdKTogYm9vbGVhbiB7XHJcblx0XHRpZiAobGlzdEFycmF5LmluZGV4T2YodmFsdWUpID49IDApIHJldHVybiB0cnVlO1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqIHJldHVybiB0cnVlIGlmIGEgc3RyaW5nIGNvbnRhaW5zIGFueSBpdGVtIGluIHRoZSBzdWJzdHJpbmcgYXJyYXkpICovXHJcblx0cHVibGljIGNvbnRhaW5zQW55KHN0cjogc3RyaW5nLCBzdWJzdHJpbmdzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgIT0gc3Vic3RyaW5ncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoc3RyLmluZGV4T2Yoc3Vic3RyaW5nc1tpXSkgIT0gLSAxKSByZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKiByZXR1cm4gYSBmaWx0ZXJlZCBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGQocHJvcGVydHkpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGdldEFycmF5SXRlbXMoYXJyYXk6IGFueVtdLCBzZWFyY2hGaWVsZDogc3RyaW5nLCBzZWFyY2hWYWx1ZTogYW55KSB7XHJcblx0XHRyZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChvYmopIHtcclxuXHRcdFx0cmV0dXJuIG9ialtzZWFyY2hGaWVsZF0gPT0gc2VhcmNoVmFsdWU7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogcmV0dXJuIGEgZmlsdGVyZWQgYXJyYXkgd2hlcmUgdGhlIG5hbWVkIGZpZWxkcyhwcm9wZXJ0aWVzKSBjb250YWlucyBzcGVjaWZpYyB0ZXh0IChjYXNlIGluc2Vuc2l0aXZlKSAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheUl0ZW1zQnlBcnJheShkYXRhOiBhbnlbXSwgc2VhcmNoRmllbGQ6IHN0cmluZ1tdLCBzZWFyY2hUZXh0OiBzdHJpbmcpIHtcclxuXHRcdGlmICghc2VhcmNoVGV4dCkgcmV0dXJuIGRhdGE7XHJcblx0XHRzZWFyY2hUZXh0ID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpXHJcblx0XHR2YXIgZmlsdGVyZWREYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoRmllbGQubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAoeFtzZWFyY2hGaWVsZFtpXV0gJiYgeFtzZWFyY2hGaWVsZFtpXV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVGV4dCkgPj0gMCkgcmV0dXJuIHRydWU7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIGZpbHRlcmVkRGF0YTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGZpcnN0IGl0ZW0gZnJvbSBhbiBhcnJheSB3aGVyZSB0aGUgbmFtZWQgZmllbGQocHJvcGVydHkpIGNvbnRhaW5zIHNwZWNpZmljIHRleHQgKGNhc2UgaW5zZW5zaXRpdmUpICovXHJcblx0cHVibGljIGdldEFycmF5SXRlbShhcnJheTogYW55W10sIHNlYXJjaEZpZWxkOiBzdHJpbmcsIHNlYXJjaFZhbHVlOiBhbnkpIHtcclxuXHRcdHJldHVybiB0aGlzLmdldEFycmF5SXRlbXMoYXJyYXksIHNlYXJjaEZpZWxkLCBzZWFyY2hWYWx1ZSlbMF07XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhbiBhcnJheSB0byBhbmQgb2JzZXJ2YWJsZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBvYnNlcnZhYmxlQXJyYXkoYXJyYXk/OiBBcnJheTxhbnk+KSB7XHJcblx0XHRyZXR1cm4gbmV3IE9ic2VydmFibGVBcnJheShhcnJheSk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhbiBhcnJheSB0byBhbmQgb2JzZXJ2YWJsZSBhcnJheSAqL1xyXG5cdHB1YmxpYyBvYnNlcnZhYmxlKG9iaikge1xyXG5cdFx0cmV0dXJuIG9ic2VydmFibGVNb2R1bGUuZnJvbU9iamVjdChvYmopO1xyXG5cdH1cclxuXHJcblx0LyoqIEV4dHJhY3Qgb2JqZWN0cyBmcm9tIGFycmF5ICAqL1xyXG5cdHB1YmxpYyBnZXRBcnJheU9iamVjdHMoYXJyYXk6IEFycmF5PGFueT4sIG9iamVjdE5hbWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xyXG5cdFx0cmV0dXJuIGFycmF5Lm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geFtvYmplY3ROYW1lXTsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogcmVwbGFjZXMgYW4gZXhpc3Rpbmcgb2JzZXJ2YWJsZUFycmF5cyBkYXRhIHdpdGggYSBuZXcgYXJyYXkgICovXHJcblx0cHVibGljIHJlcGxhY2VBcnJheShhcnJheTogT2JzZXJ2YWJsZUFycmF5PGFueT4sIHdpdGhBcnJheTogYW55KSB7XHJcblx0XHRhcnJheS5zcGxpY2UoMCk7XHJcblx0XHR0aGlzLmFwcGVuZEFycmF5KGFycmF5LCB3aXRoQXJyYXkpXHJcblx0fVxyXG5cclxuXHQvKiogYXBwZW5kcyBhbiBleGlzdGluZyBvYnNlcnZhYmxlQXJyYXlzIGRhdGEgd2l0aCBhIG5ldyBhcnJheSAgKi9cclxuXHRwdWJsaWMgYXBwZW5kQXJyYXkoYXJyYXk6IE9ic2VydmFibGVBcnJheTxhbnk+LCB3aXRoQXJyYXk6IGFueSkge1xyXG5cdFx0Ly9cdG9ic2VydmFibGUgYXJyYXkgY2F1c2VzIHByb2JsZW1zIGlmIHRoZSBhcnJheSBpdGVtIGlzIG5vdCBhbiBvYnNlcnZhYmxlLlxyXG5cdFx0Ly8gIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB3aXRoQXJyYXkubGVuZ3RoOyBpbmRleCsrKSB7XHJcblx0XHQvLyBcdCAgYXJyYXkucHVzaCh3aXRoQXJyYXlbaW5kZXhdKTtcclxuXHRcdC8vICB9XHJcblx0XHRpZiAoIXdpdGhBcnJheSkgcmV0dXJuO1xyXG5cdFx0Zm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHdpdGhBcnJheS5sZW5ndGg7IGluZGV4KyspIHtcclxuXHRcdFx0dmFyIHJvdyA9IHdpdGhBcnJheVtpbmRleF07XHJcblx0XHRcdHZhciBvUm93ID0gbmV3IG9ic2VydmFibGVNb2R1bGUuT2JzZXJ2YWJsZSgpO1xyXG5cdFx0XHRPYmplY3Qua2V5cyhyb3cpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG5cdFx0XHRcdG9Sb3cuc2V0KGtleSwgcm93W2tleV0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0YXJyYXkucHVzaChvUm93KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBFbnVtVG9BcnJheShFbnVtT2JqKTogc3RyaW5nW10ge1xyXG5cdFx0dmFyIHJldHVyblZhbHVlID0gW107XHJcblx0XHRmb3IgKHZhciBrZXkgaW4gRW51bU9iaikge1xyXG5cdFx0XHRpZiAodHlwZW9mIEVudW1PYmpba2V5XSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuVmFsdWUucHVzaChFbnVtT2JqW2tleV0ucmVwbGFjZSgvXy9nLCBcIiBcIikpO1xyXG5cdFx0fTtcclxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcclxuXHR9XHJcblxyXG5cdC8qKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIEs6ViBmcm9tIGEgbGlzdCBvZiBzdHJpbmdzICovXHJcblx0cHVibGljIHN0ckVudW08VCBleHRlbmRzIHN0cmluZz4obzogQXJyYXk8VD4pOiB7W0sgaW4gVF06IEt9IHtcclxuXHRcdHJldHVybiBvLnJlZHVjZSgocmVzLCBrZXkpID0+IHtcclxuXHRcdFx0cmVzW2tleV0gPSBrZXk7XHJcblx0XHRcdHJldHVybiByZXM7XHJcblx0XHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcclxuXHR9XHJcblxyXG5cclxuXHJcbn1cclxuXHJcbi8qKiBEYXRlIEZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgRHQge1xyXG5cclxuXHRwdWJsaWMgbW9tZW50KGRhdGU/OiBEYXRlKTogbW9tZW50Lk1vbWVudCB7XHJcblx0XHRpZiAoIWRhdGUpIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vWWVhcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8qKiBhZGQgYSB5ZWFyIHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkWWVhcnMoZGF5OiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoZGF5LCAneWVhcnMnKS50b0RhdGUoKTtcclxuXHR9XHJcblx0LyoqIHN0YXJ0IG9mIHllYXIgKi9cclxuXHRwdWJsaWMgZGF0ZVllYXJTdGFydChkYXRlPzogRGF0ZSwgYWRkWWVhcnM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLnN0YXJ0T2YoJ3llYXInKS5hZGQoYWRkWWVhcnMgfHwgMCwgXCJ5ZWFyc1wiKS50b0RhdGUoKTtcclxuXHR9XHJcblxyXG5cdC8qKiBlbmQgb2YgeWVhciAqL1xyXG5cdHB1YmxpYyBkYXRlWWVhckVuZChkYXRlPzogRGF0ZSwgYWRkWWVhcnM/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmVuZE9mKCd5ZWFyJykuYWRkKGFkZFllYXJzIHx8IDAsIFwieWVhcnNcIikudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL01vbnRocyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgbW9udGggdG8gYSBkYXRlICovXHJcblx0cHVibGljIGRhdGVBZGRNb250aHMoZGF5OiBudW1iZXIsIGRhdGU/OiBEYXRlKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5hZGQoZGF5LCAnbW9udGhzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cdC8qKiBzdGFydCBvZiBtb250aCAqL1xyXG5cdHB1YmxpYyBkYXRlTW9udGhTdGFydChkYXRlPzogRGF0ZSwgYWRkTW9udGhzPzogbnVtYmVyKTogRGF0ZSB7XHJcblx0XHRpZiAoIWRhdGUpIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5zdGFydE9mKCdtb250aCcpLmFkZChhZGRNb250aHMgfHwgMCwgJ21vbnRocycpLnRvRGF0ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGVuZCBvZiBtb250aCAqL1xyXG5cdHB1YmxpYyBkYXRlTW9udGhFbmQoZGF0ZT86IERhdGUsIGFkZE1vbnRocz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZW5kT2YoJ21vbnRoJykuYWRkKGFkZE1vbnRocyB8fCAwLCAnbW9udGhzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL0RheXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogYWRkIGEgZGF5IHRvIGEgZGF0ZSAqL1xyXG5cdHB1YmxpYyBkYXRlQWRkRGF5cyhkYXk6IG51bWJlciwgZGF0ZT86IERhdGUpOiBEYXRlIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmFkZChkYXksICdkYXlzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHQvL1dlZWtzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvKiogc3RhcnQgb2Ygd2VlayAqL1xyXG5cdHB1YmxpYyBkYXRlV2Vla1N0YXJ0KGRhdGU/OiBEYXRlLCBhZGRXZWVrcz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuc3RhcnRPZignaXNvV2VlaycpLmFkZChhZGRXZWVrcyB8fCAwLCAnd2Vla3MnKS50b0RhdGUoKTtcclxuXHR9XHJcblx0LyoqIGVuZCBvZiB3ZWVrICovXHJcblx0cHVibGljIGRhdGVXZWVrRW5kKGRhdGU/OiBEYXRlLCBhZGRXZWVrcz86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZW5kT2YoJ2lzb1dlZWsnKS5hZGQoYWRkV2Vla3MgfHwgMCwgJ3dlZWtzJykudG9EYXRlKCk7XHJcblx0fVxyXG5cclxuXHJcblx0Ly9jb252ZXJ0IHRvIHN0cmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChZWVlZLU1NLUREKSAqL1xyXG5cdHB1YmxpYyBkYXRlVG9TdHJZTUQoZGF0ZT86IERhdGUpOiBzdHJpbmcge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBzdHJpbmcgKEREL01NL1lZWVkpICovXHJcblx0cHVibGljIGRhdGVUb1N0cihkYXRlPzogRGF0ZSk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnREQvTU0vWVlZWScpO1xyXG5cdH1cclxuXHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgc3RyaW5nIChERC9NTS9ZWVlZKSAqL1xyXG5cdHB1YmxpYyB0aW1lVG9TdHIoZGF0ZT86IERhdGUpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIG1vbWVudChkYXRlKS5mb3JtYXQoJ2hoOm1tIEEnKTtcclxuXHR9XHJcblxyXG5cdC8qKiBjb252ZXJ0IGEgc3RyaW5nIChERC9NTS9ZWVlZKSB0byBhIGRhdGUgKi9cclxuXHRwdWJsaWMgc3RyVG9EYXRlKGRhdGU6IHN0cmluZyk6IERhdGUge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdG1vbWVudCgpLnRvRGF0ZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG1vbWVudChkYXRlLCAnREQvTU0vWVlZWScpLnRvRGF0ZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBtb21lbnQgb2JqZWN0ICovXHJcblx0cHVibGljIHN0clRvTW9tZW50KGRhdGU6IHN0cmluZykge1xyXG5cdFx0aWYgKCFkYXRlKSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBtb21lbnQoZGF0ZSwgJ0REL01NL1lZWVknKTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyoqIGNvbnZlcnQgYSBkYXRlIHRvIGEgY2xhcmlvbiBkYXRlICovXHJcblx0cHVibGljIGNsYXJpb25EYXRlKGRhdGU/OiBEYXRlKTogbnVtYmVyIHtcclxuXHRcdGlmICghZGF0ZSkgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcblx0XHR2YXIgb25lRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMDsgLy8gaG91cnMqbWludXRlcypzZWNvbmRzKm1pbGxpc2Vjb25kc1xyXG5cdFx0dmFyIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKFwiRGVjZW1iZXIgMjgsIDE4MDBcIik7XHJcblx0XHR2YXIgZGlmZkRheXMgPSBNYXRoLnJvdW5kKE1hdGguYWJzKChkYXRlLmdldFRpbWUoKSAtIHN0YXJ0RGF0ZS5nZXRUaW1lKCkpIC8gKG9uZURheSkpKVxyXG5cdFx0cmV0dXJuIGRpZmZEYXlzXHJcblx0fVxyXG5cdC8qKiBjb252ZXJ0IGEgZGF0ZSB0byBhIGNsYXJpb24gZGF0ZSAqL1xyXG5cdHB1YmxpYyBjbGFyaW9uRGF0ZVRvRGF0ZShjbGFyaW9uRGF0ZT86IG51bWJlcik6IERhdGUge1xyXG5cdFx0aWYgKCFjbGFyaW9uRGF0ZSkgcmV0dXJuIG5ldyBEYXRlKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5kYXRlQWRkRGF5cyhjbGFyaW9uRGF0ZSwgbmV3IERhdGUoXCJEZWNlbWJlciAyOCwgMTgwMFwiKSk7XHJcblx0fVxyXG5cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIGRhdGUgKi9cclxuXHRwdWJsaWMgY2xhcmlvblRpbWUoZGF0ZT86IERhdGUpOiBudW1iZXIge1xyXG5cdFx0aWYgKCFkYXRlKSBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdHZhciBtbXRNaWRuaWdodCA9IG1vbWVudChkYXRlKS5zdGFydE9mKCdkYXknKTtcclxuXHRcdHZhciBzZWNvbmRzID0gbW9tZW50KGRhdGUpLmRpZmYobW10TWlkbmlnaHQsICdzZWNvbmRzJykgKiAxMDA7XHJcblx0XHRyZXR1cm4gc2Vjb25kc1xyXG5cdH1cclxuXHQvKiogY29udmVydCBhIGRhdGUgdG8gYSBjbGFyaW9uIHRpbWUgKi9cclxuXHRwdWJsaWMgY2xhcmlvblRpbWVUb0RhdGUoY2xhcmlvbkRhdGU/OiBudW1iZXIpOiBEYXRlIHtcclxuXHRcdGlmICghY2xhcmlvbkRhdGUpIHJldHVybiBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuIG1vbWVudChuZXcgRGF0ZShcIkRlY2VtYmVyIDI4LCAxODAwXCIpKS5hZGQoY2xhcmlvbkRhdGUgLyAxMDAsICdzZWNvbmRzJykudG9EYXRlKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKiogRXh0cmEgZnVuY3Rpb25zIHVzZWQgd2l0aCB2aWV3cyAqL1xyXG5leHBvcnQgY2xhc3MgVmlld0V4dCB7XHJcblxyXG5cdC8qKiByZW1vdmUgdGhlIGZvY3VzIGZyb20gYSB2aWV3IG9iamVjdCAqL1xyXG5cdHB1YmxpYyBjbGVhckFuZERpc21pc3Modmlldzogdmlldy5WaWV3QmFzZSkge1xyXG5cdFx0aWYgKCF2aWV3KSByZXR1cm47XHJcblx0XHR0aGlzLmRpc21pc3NTb2Z0SW5wdXQodmlldyk7XHJcblx0XHR0aGlzLmNsZWFyRm9jdXModmlldyk7XHJcblx0fVxyXG5cclxuXHQvKiogcmVtb3ZlIHRoZSBmb2N1cyBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgY2xlYXJGb2N1cyh2aWV3OiB2aWV3LlZpZXdCYXNlKSB7XHJcblx0XHRpZiAoIXZpZXcpIHJldHVybjtcclxuXHRcdGlmIChpc0FuZHJvaWQpIGlmICh2aWV3LmFuZHJvaWQpIHZpZXcuYW5kcm9pZC5jbGVhckZvY3VzKCk7XHJcblx0fVxyXG5cclxuXHQvKiogaGlkZSB0aGUgc29mdCBrZXlib2FyZCBmcm9tIGEgdmlldyBvYmplY3QgKi9cclxuXHRwdWJsaWMgZGlzbWlzc1NvZnRJbnB1dCh2aWV3OiB2aWV3LlZpZXdCYXNlKSB7XHJcblx0XHRpZiAoIXZpZXcpIHJldHVybjtcclxuXHRcdHRyeSB7XHJcblx0XHRcdCg8YW55PnZpZXcpLmRpc21pc3NTb2Z0SW5wdXQoKTtcclxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJVmFsdWVJdGVtIHtcclxuXHRWYWx1ZU1lbWJlcjogYW55O1xyXG5cdERpc3BsYXlNZW1iZXI6IHN0cmluZztcclxufVxyXG5cclxuLyoqIGEgdmFsdWUgbGlzdCBhcnJheSAqL1xyXG5leHBvcnQgY2xhc3MgVmFsdWVMaXN0IHtcclxuXHJcblx0LyoqIHRoaXMgYXJyYXkgb2YgdmFsdWUgaXRlbXMgKi9cclxuXHRwcml2YXRlIGl0ZW1zOiBBcnJheTxJVmFsdWVJdGVtPjtcclxuXHJcblx0LyoqIHRoZSBudW1iZXIgb2YgaXRlbXMgKi9cclxuXHRnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLml0ZW1zLmxlbmd0aDsgfVxyXG5cclxuXHRjb25zdHJ1Y3RvcihhcnJheT86IEFycmF5PElWYWx1ZUl0ZW0+KSB7XHJcblx0XHRpZiAoYXJyYXkpIHRoaXMuaXRlbXMgPSBhcnJheTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtKGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaXN0ICovXHJcblx0cHVibGljIGFkZEl0ZW1Gcm9udChpdGVtOiBJVmFsdWVJdGVtKSB7XHJcblx0XHR0aGlzLml0ZW1zLnVuc2hpZnQoaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBsaXN0IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHVibGljIGdldEl0ZW1zKCk6IEFycmF5PElWYWx1ZUl0ZW0+IHtcclxuXHRcdHJldHVybiB0aGlzLml0ZW1zO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCBhbiBpdGVtIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRJdGVtKGluZGV4OiBudW1iZXIpIHtcclxuXHRcdHJldHVybiB0aGlzLmdldFRleHQoaW5kZXgpO1xyXG5cdH1cclxuXHJcblx0LyoqIGdldCB0aGUgaXRlbXMgZGlzcGxheSB2YWx1ZSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VGV4dChpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5pdGVtcy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5pdGVtc1tpbmRleF0uRGlzcGxheU1lbWJlcjtcclxuXHR9XHJcblx0LyoqIGdldCBhbiBhcnJheSBvZiB0aGUgaXRlbXMgdGV4dCBmaWVsZCAgKi9cclxuXHRwdWJsaWMgZ2V0VGV4dEFycmF5KCk6IEFycmF5PGFueT4ge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBtZS5pdGVtcy5tYXAoZnVuY3Rpb24gKHg6IElWYWx1ZUl0ZW0pIHsgcmV0dXJuIHguRGlzcGxheU1lbWJlcjsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyB2YWx1ZSBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VmFsdWUoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0aWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLml0ZW1zLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLml0ZW1zW2luZGV4XS5WYWx1ZU1lbWJlcjtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGluZGV4IGJ5IGl0cyB2YWx1ZSwgdXNlIGRlZmF1bHQgaW5kZXggaWYgbm90IGZvdW5kIGVsc2UgcmV0dXJuIC0xICovXHJcblxyXG5cdHB1YmxpYyBnZXRJbmRleCh2YWx1ZTogYW55LCBkZWZhdWx0SW5kZXg/OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGlmICh0aGlzLmdldFZhbHVlKGkpID09IHZhbHVlKSByZXR1cm4gaTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBkZWZhdWx0SW5kZXggPT0gbnVsbCA/IC0xIDogZGVmYXVsdEluZGV4O1xyXG5cdH1cclxufVxyXG5cclxuLyoqIGEgdmFsdWUgbGlzdCBhcnJheSAqL1xyXG5leHBvcnQgY2xhc3MgRGljdGlvbmFyeSB7XHJcblxyXG5cdC8qKiB0aGlzIGFycmF5IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHJpdmF0ZSBfaXRlbXMgPSBbXTtcclxuXHQvKiogZ2V0IHRoZSBsaXN0IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHVibGljIGdldCBpdGVtcygpIHsgcmV0dXJuIHRoaXMuX2l0ZW1zIH1cclxuXHQvKiogc2V0IHRoZSBsaXN0IG9mIHZhbHVlIGl0ZW1zICovXHJcblx0cHVibGljIHNldCBpdGVtcyhhcnJheSkgeyB0aGlzLl9pdGVtcyA9IGFycmF5IH1cclxuXHJcblx0cHVibGljIHZhbHVlTWVtYmVyTmFtZSA9IFwiVmFsdWVNZW1iZXJcIjtcclxuXHRwdWJsaWMgZGlzcGxheU1lbWJlck5hbWUgPSBcIkRpc3BsYXlNZW1iZXJcIjtcclxuXHJcblx0LyoqIHRoZSBudW1iZXIgb2YgaXRlbXMgKi9cclxuXHRwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5pdGVtcy5sZW5ndGg7IH1cclxuXHJcblx0Y29uc3RydWN0b3IoYXJyYXk/OiBBcnJheTxhbnk+LCB2YWx1ZU1lbWJlck5hbWU/OiBzdHJpbmcsIGRpc3BsYXlNZW1iZXJOYW1lPzogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmFkZEl0ZW1zKGFycmF5LCB2YWx1ZU1lbWJlck5hbWUsIGRpc3BsYXlNZW1iZXJOYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtKGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHRoaXMuaXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblxyXG5cdC8qKiBhZGQgYSBuZXcgaXRlbSB0byB0aGUgbGlzdCAqL1xyXG5cdHB1YmxpYyBhZGRJdGVtcyhhcnJheTogQXJyYXk8YW55PiwgdmFsdWVNZW1iZXJOYW1lOiBzdHJpbmcsIGRpc3BsYXlNZW1iZXJOYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRpZiAoYXJyYXkpIG1lLml0ZW1zID0gYXJyYXk7XHJcblx0XHRpZiAodmFsdWVNZW1iZXJOYW1lKSB0aGlzLnZhbHVlTWVtYmVyTmFtZSA9IHZhbHVlTWVtYmVyTmFtZTtcclxuXHRcdGlmIChkaXNwbGF5TWVtYmVyTmFtZSkgdGhpcy5kaXNwbGF5TWVtYmVyTmFtZSA9IGRpc3BsYXlNZW1iZXJOYW1lO1xyXG5cdH1cclxuXHJcblx0LyoqIGFkZCBhIG5ldyBpdGVtIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpc3QgKi9cclxuXHRwdWJsaWMgYWRkSXRlbUZyb250KGl0ZW06IElWYWx1ZUl0ZW0pIHtcclxuXHRcdHRoaXMuaXRlbXMudW5zaGlmdChpdGVtKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKiogZ2V0IGFuIGl0ZW0gYnkgaXRzIGluZGV4ICovXHJcblx0cHVibGljIGdldEl0ZW0oaW5kZXg6IG51bWJlcikge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0VGV4dChpbmRleCk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyBkaXNwbGF5IHZhbHVlIGJ5IGl0cyBpbmRleCAqL1xyXG5cdHB1YmxpYyBnZXRUZXh0KGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG1lLml0ZW1zW2luZGV4XVttZS5kaXNwbGF5TWVtYmVyTmFtZV07XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IGFuIGFycmF5IG9mIHRoZSBpdGVtcyBkaXNwbGF5IG1lbWJlcnMgICovXHJcblx0cHVibGljIGdldFRleHRBcnJheSgpOiBBcnJheTxhbnk+IHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gbWUuaXRlbXMubWFwKGZ1bmN0aW9uICh4OiBJVmFsdWVJdGVtKSB7IHJldHVybiB4W21lLmRpc3BsYXlNZW1iZXJOYW1lXTsgfSk7XHJcblx0fVxyXG5cclxuXHQvKiogZ2V0IHRoZSBpdGVtcyB2YWx1ZU1lbWJlciBieSBpdHMgaW5kZXggKi9cclxuXHRwdWJsaWMgZ2V0VmFsdWUoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGlmICghbWUuaXRlbXMgfHwgbWUuaXRlbXMubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xyXG5cdFx0aWYgKCFpbmRleCB8fCBpbmRleCA8IDAgfHwgaW5kZXggPj0gbWUuaXRlbXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcclxuXHRcdHJldHVybiBtZS5pdGVtc1tpbmRleF1bbWUudmFsdWVNZW1iZXJOYW1lXTtcclxuXHR9XHJcblxyXG5cdC8qKiBnZXQgdGhlIGl0ZW1zIGluZGV4IGJ5IGl0cyB2YWx1ZU1lbWViZXIsIHVzZSBkZWZhdWx0IGluZGV4IGlmIG5vdCBmb3VuZCBlbHNlIHJldHVybiAtMSAqL1xyXG5cdHB1YmxpYyBnZXRJbmRleCh2YWx1ZTogYW55LCBkZWZhdWx0SW5kZXg/OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAobWUuZ2V0VmFsdWUoaSkgPT0gdmFsdWUpIHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGRlZmF1bHRJbmRleCA9PSBudWxsID8gLTEgOiBkZWZhdWx0SW5kZXg7XHJcblx0fVxyXG59XHJcblxyXG5cclxuLyoqIEZpbGUgYWNjZXNzIGZ1bmN0aW9ucyAqL1xyXG5leHBvcnQgY2xhc3MgRmlsZSB7XHJcblxyXG5cdHB1YmxpYyBkb2N1bWVudEZvbGRlciA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLmRvY3VtZW50cygpO1xyXG5cclxuXHRwdWJsaWMgdGVtcEZvbGRlciA9IGZpbGVTeXN0ZW1Nb2R1bGUua25vd25Gb2xkZXJzLnRlbXAoKTtcclxuXHJcblx0cHVibGljIGRvd25sb2FkRm9sZGVyID0gaXNBbmRyb2lkID8gYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VQdWJsaWNEaXJlY3RvcnkoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5ESVJFQ1RPUllfRE9XTkxPQURTKS5nZXRBYnNvbHV0ZVBhdGgoKSA6ICcnO1xyXG5cclxuXHJcblx0LyoqIGxvYWQganNvbiBmcm9tIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBleGlzdHMoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBtZS5kb2N1bWVudEZvbGRlci5jb250YWlucyhmaWxlbmFtZSk7XHJcblx0fVxyXG5cclxuXHQvKiogc2F2ZSBqc29uIHRvIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBzYXZlRmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS53cml0ZVN5bmMoZGF0YSwgZnVuY3Rpb24gKGVycikge1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fSk7XHJcblx0XHRcdHJlc29sdmUoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqIGxvYWQganNvbiBmcm9tIGEgZmlsZSAqL1xyXG5cdHB1YmxpYyBsb2FkSlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZykge1xyXG5cdFx0dmFyIG1lID0gdGhpcztcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdHZhciBmaWxlID0gbWUuZG9jdW1lbnRGb2xkZXIuZ2V0RmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdGZpbGUucmVhZFRleHQoKS50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XHJcblx0XHRcdFx0dmFyIHJldHVyblZhbHVlID0gbnVsbDtcclxuXHRcdFx0XHRpZiAoY29udGVudCAhPSBcIlwiKSByZXR1cm5WYWx1ZSA9IEpTT04ucGFyc2UoY29udGVudCk7XHJcblx0XHRcdFx0cmVzb2x2ZShyZXR1cm5WYWx1ZSk7XHJcblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0XHRyZWplY3QoZXJyKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKiBzYXZlIGpzb24gdG8gYSBmaWxlICovXHJcblx0cHVibGljIHNhdmVKU09ORmlsZShmaWxlbmFtZTogc3RyaW5nLCBkYXRhKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHRcdFx0dmFyIGZpbGUgPSBtZS5kb2N1bWVudEZvbGRlci5nZXRGaWxlKGZpbGVuYW1lKTtcclxuXHRcdFx0ZmlsZS53cml0ZVRleHQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcclxuXHRcdFx0XHRyZXNvbHZlKGNvbnRlbnQpO1xyXG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyoqIGVtcHR5IHRoZSBmaWxlICovXHJcblx0cHVibGljIGNsZWFySlNPTkZpbGUoZmlsZW5hbWU6IHN0cmluZywgZGF0YSkge1xyXG5cdFx0dmFyIGZpbGUgPSB0aGlzLmRvY3VtZW50Rm9sZGVyLmdldEZpbGUoZmlsZW5hbWUpO1xyXG5cdFx0ZmlsZS53cml0ZVRleHQoSlNPTi5zdHJpbmdpZnkoe30pKTtcclxuXHR9XHJcblxyXG5cdC8vKiogY3JlYXRlIGEgZnVsbCBmaWxlbmFtZSBpbmNsdWRpbmcgdGhlIGZvbGRlciBmb3IgdGhlIGN1cnJlbnQgYXBwICovXHJcblx0cHVibGljIGdldEZ1bGxGaWxlbmFtZShmaWxlbmFtZTogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIGZpbGVTeXN0ZW1Nb2R1bGUucGF0aC5qb2luKG1lLmRvY3VtZW50Rm9sZGVyLnBhdGgsIGZpbGVuYW1lKTtcclxuXHR9XHJcblx0Ly8qKiBjcmVhdGUgYSBmdWxsIGZpbGVuYW1lIGluY2x1ZGluZyB0aGUgdGVtcCBmb2xkZXIgZm9yIHRoZSBjdXJyZW50IGFwcCAqL1xyXG5cdHB1YmxpYyBnZXRGdWxsVGVtcEZpbGVuYW1lKGZpbGVuYW1lOiBzdHJpbmcpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHRyZXR1cm4gZmlsZVN5c3RlbU1vZHVsZS5wYXRoLmpvaW4obWUudGVtcEZvbGRlci5wYXRoLCBmaWxlbmFtZSk7XHJcblx0fVxyXG5cdC8vIHB1YmxpYyBkZWxldGVGaWxlKHBhcnR5OiBzdHJpbmcpIHtcclxuXHQvLyBcdHZhciBmaWxlID0gZmlsZVN5c3RlbU1vZHVsZS5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCkuZ2V0RmlsZShwYXJ0eSk7XHJcblx0Ly8gXHRmaWxlLlxyXG5cdC8vIH1cclxuXHJcblxyXG5cdHB1YmxpYyBkb3dubG9hZFVybCh1cmwsIGZpbGVQYXRoKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuXHJcblx0XHRcdGh0dHAuZ2V0RmlsZSh1cmwsIGZpbGVQYXRoKS50aGVuKGZ1bmN0aW9uIChyKSB7XHJcblx0XHRcdFx0dmFyIGRhdGEgPSByLnJlYWRTeW5jKCk7XHJcblx0XHRcdFx0Y2FsbC5vcGVuRmlsZShmaWxlUGF0aCk7XHJcblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHR2YXIgZXJyID0gbmV3IEVycm9yKFwiRXJyb3IgZG93bmxvYWRpbmcgJ1wiICsgZmlsZVBhdGggKyBcIicuIFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7XHJcblx0XHRcdFx0YWxlcnQoZXJyLm1lc3NhZ2UpO1xyXG5cdFx0XHRcdHJlamVjdChlcnIpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJY29tcG9zZUVtYWlsIHtcclxuXHR0bzogc3RyaW5nO1xyXG5cdHN1YmplY3Q/OiBzdHJpbmc7XHJcblx0Ym9keT86IHN0cmluZztcclxuXHRzYWx1dGF0aW9uPzogc3RyaW5nO1xyXG5cdGRlYXI/OiBzdHJpbmc7XHJcblx0cmVnYXJkcz86IHN0cmluZztcclxufVxyXG5cclxuLyoqIGNhbGwgdGhpcmRwYXJ0eSBhcHBzICovXHJcbmV4cG9ydCBjbGFzcyBDYWxsIHtcclxuXHJcblx0LyoqIGNvbXBvc2UgYW4gZW1haWwgKi9cclxuXHRwdWJsaWMgY29tcG9zZUVtYWlsKG1lc3NhZ2U6IEljb21wb3NlRW1haWwpIHtcclxuXHRcdHZhciBtZSA9IHRoaXM7XHJcblx0XHR2YXIgc3ViamVjdCA9IChtZXNzYWdlLnN1YmplY3QgfHwgXCJTdXBwb3J0XCIpO1xyXG5cdFx0aWYgKCFtZXNzYWdlLmJvZHkpIHtcclxuXHRcdFx0bWVzc2FnZS5ib2R5ID0gKG1lc3NhZ2Uuc2FsdXRhdGlvbiB8fCAobWVzc2FnZS5kZWFyID8gXCJEZWFyIFwiICsgbWVzc2FnZS5kZWFyIDogbnVsbCkgfHwgXCJEZWFyIE1hZGFtL1NpclwiKTtcclxuXHRcdFx0aWYgKG1lc3NhZ2UucmVnYXJkcykgbWVzc2FnZS5ib2R5ICs9IFwiPEJSPjxCUj48QlI+UmVnYXJkczxCUj5cIiArIG1lc3NhZ2UucmVnYXJkcztcclxuXHRcdH1cclxuXHJcblx0XHRlbWFpbC5hdmFpbGFibGUoKS50aGVuKGZ1bmN0aW9uIChhdmFpbCkge1xyXG5cdFx0XHRpZiAoYXZhaWwpIHtcclxuXHRcdFx0XHRyZXR1cm4gZW1haWwuY29tcG9zZSh7XHJcblx0XHRcdFx0XHR0bzogW21lc3NhZ2UudG9dLFxyXG5cdFx0XHRcdFx0c3ViamVjdDogc3ViamVjdCxcclxuXHRcdFx0XHRcdGJvZHk6IG1lc3NhZ2UuYm9keSxcclxuXHRcdFx0XHRcdGFwcFBpY2tlclRpdGxlOiAnQ29tcG9zZSB3aXRoLi4nIC8vIGZvciBBbmRyb2lkLCBkZWZhdWx0OiAnT3BlbiB3aXRoLi4nXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbWFpbCBub3QgYXZhaWxhYmxlXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJFbWFpbCBjb21wb3NlciBjbG9zZWRcIik7XHJcblx0XHR9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XHJcblx0XHRcdGFsZXJ0KGVyci5tZXNzYWdlKTtcclxuXHRcdH0pOztcclxuXHR9XHJcblxyXG5cdC8qKiBtYWtlIGEgcGhvbmUgY2FsbCAqL1xyXG5cdHB1YmxpYyBwaG9uZURpYWwoUGhvbmVObzogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0cGhvbmUuZGlhbChQaG9uZU5vLCB0cnVlKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBvcGVuRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7XHJcblx0XHR2YXIgbWUgPSB0aGlzO1xyXG5cdFx0dmFyIGZpbGVuYW1lID0gZmlsZVBhdGgudG9Mb3dlckNhc2UoKTtcclxuXHRcdHRyeSB7XHJcblx0XHRcdGlmIChhbmRyb2lkKSB7XHJcblx0XHRcdFx0aWYgKGZpbGVuYW1lLnN1YnN0cigwLCA3KSAhPSBcImZpbGU6Ly9cIiB8fCBmaWxlbmFtZS5zdWJzdHIoMCwgMTApICE9IFwiY29udGVudDovL1wiKSBmaWxlbmFtZSA9IFwiZmlsZTovL1wiICsgZmlsZW5hbWU7XHJcblx0XHRcdFx0aWYgKGFuZHJvaWQub3MuQnVpbGQuVkVSU0lPTi5TREtfSU5UID4gYW5kcm9pZC5vcy5CdWlsZC5WRVJTSU9OX0NPREVTLk0pIGZpbGVuYW1lID0gZmlsZW5hbWUucmVwbGFjZShcImZpbGU6Ly9cIiwgXCJjb250ZW50Oi8vXCIpO1xyXG5cclxuXHRcdFx0XHR2YXIgdXJpID0gYW5kcm9pZC5uZXQuVXJpLnBhcnNlKGZpbGVuYW1lLnRyaW0oKSk7XHJcblx0XHRcdFx0dmFyIHR5cGUgPSBcImFwcGxpY2F0aW9uL1wiICsgKChleHBvcnRzLnN0ci5pbkxpc3QoZmlsZW5hbWUuc2xpY2UoLTQpLCBbJy5wZGYnLCAnLmRvYycsICcueG1sJ10pKSA/IGZpbGVuYW1lLnNsaWNlKC0zKSA6IFwiKlwiKTtcclxuXHJcblx0XHRcdFx0Ly9DcmVhdGUgaW50ZW50XHJcblx0XHRcdFx0dmFyIGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1ZJRVcpO1xyXG5cdFx0XHRcdGludGVudC5zZXREYXRhQW5kVHlwZSh1cmksIHR5cGUpO1xyXG5cdFx0XHRcdGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfQUNUSVZJVFlfTkVXX1RBU0spO1xyXG5cdFx0XHRcdGFwcGxpY2F0aW9uLmFuZHJvaWQuY3VycmVudENvbnRleHQuc3RhcnRBY3Rpdml0eShpbnRlbnQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGlvcy5vcGVuRmlsZShmaWxlbmFtZSk7XHJcblx0XHRcdH1cclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0YWxlcnQoJ0Nhbm5vdCBvcGVuIGZpbGUgJyArIGZpbGVuYW1lICsgJy4gJyArIGUubWVzc2FnZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG5cclxuLyoqIEV4dGVuZGluZyBOYXRpdmVzY3JpcHQgQXV0b2NvbXBsZXRlICovXHJcbmV4cG9ydCBjbGFzcyBUb2tlbkl0ZW0gZXh0ZW5kcyBhdXRvY29tcGxldGVNb2R1bGUuVG9rZW5Nb2RlbCB7XHJcblx0dmFsdWU6IG51bWJlcjtcclxuXHRjb25zdHJ1Y3Rvcih0ZXh0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIGltYWdlPzogc3RyaW5nKSB7XHJcblx0XHRzdXBlcih0ZXh0LCBpbWFnZSB8fCBudWxsKTtcclxuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuXHR9XHJcblxyXG59O1xyXG5cclxuZXhwb3J0IHZhciB0YWdnaW5nID0gbmV3IFRhZ2dpbmcoKTtcclxuZXhwb3J0IHZhciBzdHIgPSBuZXcgU3RyKCk7XHJcbmV4cG9ydCB2YXIgc3FsID0gbmV3IFNxbCgpO1xyXG5leHBvcnQgdmFyIGR0ID0gbmV3IER0KCk7XHJcbmV4cG9ydCB2YXIgdmlld0V4dCA9IG5ldyBWaWV3RXh0KCk7XHJcbmV4cG9ydCB2YXIgZmlsZSA9IG5ldyBGaWxlKCk7XHJcbmV4cG9ydCB2YXIgY2FsbCA9IG5ldyBDYWxsKCk7XHJcbmV4cG9ydCB2YXIgdXRpbHMgPSBuZXcgVXRpbHMoKTtcclxuIl19