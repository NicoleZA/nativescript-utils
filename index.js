"use strict";
var observable_array_1 = require("data/observable-array");
var sf = require('sf');
var Tagging = (function () {
    function Tagging() {
    }
    //Tagging ------------
    Tagging.prototype.tagClearAll = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].tag = "";
        }
        return arr;
    };
    Tagging.prototype.tagAll = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].tag = String.fromCharCode(0xf046);
        }
        return arr;
    };
    Tagging.prototype.unTagAll = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].tag = String.fromCharCode(0xf096);
        }
        return arr;
    };
    Tagging.prototype.tagToggle = function (obj) {
        if (obj.tag == String.fromCharCode(0xf046)) {
            obj.tag = String.fromCharCode(0xf096);
        }
        else {
            obj.tag = String.fromCharCode(0xf046);
        }
        return obj;
    };
    return Tagging;
}());
var Sql = (function () {
    function Sql() {
    }
    //other
    Sql.prototype.dateField = function (field, description) {
        return sf("convert(varchar,convert(datetime,{0}-36163),103) {0}", field, description || field);
    };
    Sql.prototype.date = function (field) {
        return sf("convert(varchar,convert(datetime,{0}-36163),103)", field);
    };
    return Sql;
}());
var Str = (function () {
    function Str() {
    }
    Str.prototype.fixedEncodeURIComponent = function (str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    };
    Str.prototype.filterArray = function (data, searchField, searchText) {
        var filteredData = data.filter(function (x) {
            return x[searchField] == searchText;
        });
        return new observable_array_1.ObservableArray(filteredData);
    };
    Str.prototype.getArrayItem = function (data, searchField, searchValue) {
        return data.filter(function (obj) {
            return obj[searchField] == searchValue;
        })[0];
    };
    Str.prototype.observableArray = function (array) {
        return new observable_array_1.ObservableArray(array);
    };
    return Str;
}());
exports.tagging = new Tagging();
exports.str = new Str();
exports.sql = new Sql();
