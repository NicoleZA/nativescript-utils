import * as application from "application";
import * as moment from "moment";
import * as view from "ui/core/view";
import * as observableModule from "data/observable";
import * as fileSystemModule from "file-system";
import { topmost } from 'ui/frame';
import { Page } from 'ui/page';

import * as phone from "nativescript-phone";
import * as email from "nativescript-email";
import * as http from "tns-core-modules/http";
//import * as autocompleteModule from 'nativescript-telerik-ui-pro/autocomplete';

import { ObservableArray } from "data/observable-array";
import { isAndroid, isIOS } from "platform";
import { ios } from "utils/utils"

declare var android: any;
declare var java: any;
declare var NSData: any;

//Miscellanious Functions
export class Utils {

	//Create a new instance of an object from an existing one
	public createInstanceFromJson<T>(objType: { new(): T; }, json: any) {
		var me = this;
		const newObj = new objType();
		const relationships = objType["relationships"] || {};

		for (const prop in json) {
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
					console.warn(`Property ${prop} not set because it already existed on the object.`);
				}
			}
		}

		return newObj;
	}

	//adds missing functions to object
	public initObject<T>(objType: { new(): T; }, json: any) {
		var me = this;
		const newObj = new objType();
		const relationships = objType["relationships"] || {};

		for (const prop in newObj) {
			if (newObj.hasOwnProperty(prop)) {
				console.warn(`Add ${prop}.`);
				if (json[prop] == null) {
					if (relationships[prop] == null) {
						json[prop] = newObj[prop];
					}
					else {
						json[prop] = me.createInstanceFromJson(relationships[prop], newObj[prop]);
					}
				}
				else {
					console.warn(`Property ${prop} not set because it already existed on the object.`);
				}
			}
		}
	}


}

/** Tagging Functions */
export class Tagging {

	/** default tag icon */
	public tagIcon = String.fromCharCode(0xf046);
	/** default untag icon */
	public unTagIcon = String.fromCharCode(0xf096);

	/** Create a new observable tag object
	* If icon is left blank the default icon is used 
	*/
	public newTag(icon?: string): observableModule.Observable {
		if (!icon) icon = this.unTagIcon;
		var a = new observableModule.Observable();
		a.set("value", icon);
		return a;
		//		return new observableModule.Observable({ value: icon });
	}

	/** set all array objects tag property to the default tagged icon object */
	public tagAll(array: any[]): any[] {
		for (var i = 0; i < array.length; i++) {
			if (!array[i].tag) array[i].tag = tagging.newTag();
			array[i].tag.set("value", tagging.tagIcon);
		}
		return array;
	}
	/** set all array objects tag property to the default untagged icon object */
	public unTagAll(array: any[]): any[] {
		var me = this;
		for (var i = 0; i < array.length; i++) {
			if (!array[i].tag) array[i].tag = tagging.newTag();
			array[i].tag.set("value", tagging.unTagIcon);
		}
		return array;
	}
	/** get the toggled tag icon */
	public toggleTagIcon(icon: string): string {
		if (icon == this.tagIcon) {
			return this.unTagIcon;
		} else {
			return this.tagIcon;
		}
	}

	/** Toggle tag observable */
	public toggleTag(tag: any): any {
		var me = this;
		if (!tag) tag = tagging.newTag();
		var icon = tagging.toggleTagIcon(tag.get("value"));
		tag.set("value", icon);
		return tag;
	}

	/** Toggle the rows tag property */
	public toggleRow(row: any): any {
		var me = this;
		if (!row) return null;
		me.toggleTag(row.tag);
		return row;
	}

	/** Toggle the observable tag object */
	public toggleObservable(obervableTag: observableModule.Observable): observableModule.Observable {
		return this.newTag(this.toggleTagIcon(obervableTag.get("value")));
	}
	/** Toggle the observable rows tag object */
	public toggleObservableRow(array: ObservableArray<any>, index: number): ObservableArray<any> {
		var row = this.toggleRow(array.getItem(index));
		array.setItem(index, row);
		return array;
	}

	/** get number of items in the array */
	public count(array: any[]): number {
		if (!array) return 0;
		return array.length;
	}
	/** get number of tagged items in the array */
	public countTagged(array: any[]): number {
		if (!array) return 0;
		return this.getTaggedRows(array).length;
	}
	/** get number of untagged items in the array */
	public countUntagged(array: any[]): number {
		if (!array) return 0;
		return this.getTaggedRows(array).length;
	}
	/** return the tagged rows from the array */
	public getTaggedRows(array: any[]): any[] {
		var me = this;
		if (!array) return null;
		var taggedRows = array.filter(function (x) {
			return (x.tag && x.tag.get("value") == me.tagIcon);
		});
		return taggedRows;
	}
	/** return the untagged rows from the array */
	public getUnTaggedRows(array: any[]): any[] {
		var me = this;
		var taggedRows = array.filter(function (x) {
			return (x.tag && x.tag.get("value") == me.unTagIcon);
		});
		return taggedRows;
	}


}

/** Sql Functions */
export class Sql {
	//other
	/** return a sql snipped to fetch a clarion date from the database as a standard date*/
	public date(field) {
		return `convert(varchar,convert(datetime,${field}-36163),103)`;
	}
}

/** String Functions */
export class Str {

	public capitalise(value: string): string {
		var returnValue = value.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
		return returnValue;

	}

	public base64Encode(bytes: any): string {
		if (isAndroid) {
			return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP);
		} else if (isIOS) {
			return bytes.base64EncodedStringWithOptions(0);
		}
	}

	public base64Decode(string: string): any {
		if (isAndroid) {
			return android.util.Base64.decode(string, android.util.Base64.DEFAULT);
		} else if (isIOS) {
			return NSData.alloc().initWithBase64Encoding(string);;
		}
	}

	/** return a URI encoded string */
	public fixedEncodeURIComponent(url: string): string {
		return encodeURIComponent(url).replace(/[!'()*]/g, function (c) {
			return '%' + c.charCodeAt(0).toString(16);
		});
	}

	/** return a filtered observable array where the named field(property) contains specific text (case insensitive) */
	public filterArray(data: any[], searchField: string, searchText: string) {
		searchText = searchText.toLowerCase()
		var filteredData = data.filter(function (x) {
			return (x[searchField] && x[searchField].toLowerCase().indexOf(searchText) >= 0);
		});
		return new ObservableArray(filteredData);
	}

	/** return a filtered observable array where the named fields(properties) contains specific text (case insensitive) */
	public filterArrayByArray(data: any[], searchField: string[], searchText: string) {
		searchText = searchText.toLowerCase()
		var filteredData = data.filter(function (x) {

			for (var i = 0; i < searchField.length; i++) {
				if (x[searchField[i]] && x[searchField[i]].toString().toLowerCase().indexOf(searchText) >= 0) return true;
			}
			return false;

		});
		return new ObservableArray(filteredData);
	}

	/** return true if te string is in the array */
	public inList(value: string, listArray: string[]): boolean {
		if (listArray.indexOf(value) >= 0) return true;
		return false;
	}

	/** return true if a string contains any item in the substring array) */
	public containsAny(str: string, substrings: string[]): boolean {
		for (var i = 0; i != substrings.length; i++) {
			if (str.indexOf(substrings[i]) != - 1) return true;
		}
		return false;
	}

	/** find index in array of objects */
	public arrayIndexOf(array: any[], searchField: string, searchValue: any): number {
		for (var i = 0; i != array.length; i++) {
			var field = array[i][searchField];
			if (field == searchValue) return i;
		}
		return -1;
	}

	/** return a filtered array where the named field(property) contains specific text (case insensitive) */
	public getArrayItems(array: any[], searchField: string, searchValue: any) {
		return array.filter(function (obj) {
			return obj[searchField] == searchValue;
		});
	}


	/** return a filtered array where the named fields(properties) contains specific text (case insensitive) */
	public getArrayItemsByArray(data: any[], searchField: string[], searchText: string) {
		if (!searchText) return data;
		searchText = searchText.toLowerCase()
		var filteredData = data.filter(function (x) {

			for (var i = 0; i < searchField.length; i++) {
				if (x[searchField[i]] && x[searchField[i]].toString().toLowerCase().indexOf(searchText) >= 0) return true;
			}
			return false;

		});
		return filteredData;
	}

	/** get the first item from an array where the named field(property) contains specific text (case insensitive) */
	public getArrayItem(array: any[], searchField: string, searchValue: any) {
		return this.getArrayItems(array, searchField, searchValue)[0];
	}

	/** convert an array to and observable array */
	public observableArray<T>(array?: Array<any>): ObservableArray<T> {
		var returnValue = new ObservableArray(array);
		returnValue.splice(0);
		return returnValue;
	}

	/** convert an array to and observable array */
	public observable(obj) {
		return observableModule.fromObject(obj);
	}

	/** Create observableed row fields as Observables objects to parent as tablename_fieldname  */
	public objToObservable(me: observableModule.Observable, obj: object, prefix?: string) {
		if (!me) return;
		Object.keys(obj).forEach(function (key) {
			me.set((prefix || '') + "_" + key, obj[key]);
		});
	}

	/** check if object is empty  */
	public isEmptyObject(obj) {
		return Object.getOwnPropertyNames(obj).length === 0;
	}

	/** get a column array from an object  */
	public getItemArrayFromObject(array: Array<any>, objectName: string): Array<any> {
		return array.map(function (x) { return x[objectName]; });
	}

	/** replaces an existing observableArrays data with a new array  */
	public replaceArray(array: ObservableArray<any>, withArray: any) {
		array.splice(0);
		this.appendArray(array, withArray)
	}

	/** appends an existing observableArrays data with a new array  */
	public appendArray(array: ObservableArray<any>, withArray: any) {
		//	observable array causes problems if the array item is not an observable.
		//  for (var index = 0; index < withArray.length; index++) {
		// 	  array.push(withArray[index]);
		//  }
		if (!withArray) return;
		for (var index = 0; index < withArray.length; index++) {
			var row = withArray[index];
			var oRow = new observableModule.Observable();
			Object.keys(row).forEach(function (key) {
				oRow.set(key, row[key]);
			});
			array.push(oRow);
		}
	}

	public EnumToArray(EnumObj): string[] {
		var returnValue = [];
		for (var key in EnumObj) {
			if (typeof EnumObj[key] === "string") returnValue.push(EnumObj[key].replace(/_/g, " "));
		};
		return returnValue;
	}

	/** Utility function to create a K:V from a list of strings */
	public strEnum<T extends string>(o: Array<T>): {[K in T]: K } {
		return o.reduce((res, key) => {
			res[key] = key;
			return res;
		}, Object.create(null));
	}



}

/** Date Functions */
export class Dt {

	public moment(date?: Date): moment.Moment {
		if (!date) {
			return moment();
		} else {
			return moment(date);
		}
	}

	public Duration(seconds: number): string {
		var me = this;
		var seconds = Math.floor(seconds);
		var hours = Math.floor(seconds / 3600);
		var minutes = Math.floor((seconds - (hours * 3600)) / 60);
		var seconds = seconds - (hours * 3600) - (minutes * 60);

		var hoursStr = (hours < 10 ? '0' : '') + hours.toString();
		var minutesStr = (minutes < 10 ? '0' : '') + minutes.toString();
		var secondsStr = (seconds < 10 ? '0' : '') + seconds.toString();
		return (hours ? hoursStr + ':' : '') + minutesStr + ':' + secondsStr;
	}

	//Years -------------------------------------------------------------------------------
	/** add a year to a date */
	public dateAddYears(day: number, date?: Date): Date {
		if (!date) date = new Date();
		return moment(date).add(day, 'years').toDate();
	}
	/** start of year */
	public dateYearStart(date?: Date, addYears?: number): Date {
		if (!date) date = new Date();
		return moment(date).startOf('year').add(addYears || 0, "years").toDate();
	}

	/** end of year */
	public dateYearEnd(date?: Date, addYears?: number): Date {
		if (!date) date = new Date();
		return moment(date).endOf('year').add(addYears || 0, "years").toDate();
	}

	//Months ------------------------------------------------------------------------------
	/** add a month to a date */
	public dateAddMonths(day: number, date?: Date): Date {
		if (!date) date = new Date();
		return moment(date).add(day, 'months').toDate();
	}
	/** start of month */
	public dateMonthStart(date?: Date, addMonths?: number): Date {
		if (!date) date = new Date();
		return moment(date).startOf('month').add(addMonths || 0, 'months').toDate();
	}

	/** end of month */
	public dateMonthEnd(date?: Date, addMonths?: number): Date {
		if (!date) date = new Date();
		return moment(date).endOf('month').add(addMonths || 0, 'months').toDate();
	}

	//Days --------------------------------------------------------------------------------
	/** add a day to a date */
	public dateAddDays(day: number, date?: Date): Date {
		if (!date) date = new Date();
		return moment(date).add(day, 'days').toDate();
	}

	//Weeks -------------------------------------------------------------------------------
	/** start of week */
	public dateWeekStart(date?: Date, addWeeks?: number): Date {
		if (!date) date = new Date();
		return moment(date).startOf('isoWeek').add(addWeeks || 0, 'weeks').toDate();
	}
	/** end of week */
	public dateWeekEnd(date?: Date, addWeeks?: number): Date {
		if (!date) date = new Date();
		return moment(date).endOf('isoWeek').add(addWeeks || 0, 'weeks').toDate();
	}

	//Hours --------------------------------------------------------------------------------
	/** add a hour to a date */
	public dateAddHours(hour: number, date?: Date): Date {
		if (!date) date = new Date();
		return moment(date).add(hour, 'hours').toDate();
	}

	//Minutes --------------------------------------------------------------------------------
	/** add a minutes to a date */
	public dateAddMinutes(minutes: number, date?: Date): Date {
		if (!date) date = new Date();
		return moment(date).add(minutes, 'minutes').toDate();
	}

	//convert to string -------------------------------------------------------------------------------
	/** convert a date to a string (YYYY-MM-DD) */
	public dateToStrYMD(date?: Date): string {
		if (!date) {
			return moment().format('YYYY-MM-DD');
		} else {
			return moment(date).format('YYYY-MM-DD');
		}
	}

	/** convert a date to a string (DD/MM/YYYY) */
	public dateToStr(date?: Date, format?: 'DD/MM/YYY' | 'YYYY-MM-DD' | 'D MMM YYYY' | 'D MMMM YYYY' | "YYYYMMDDHHmmss"): string {
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
	}

	/** convert a date to a string (DD/MM/YYYY) */
	public timeToStr(date?: Date): string {
		return moment(date).format('hh:mm A');
	}

	/** convert a string to a date 
	 ** Default format:  (DD/MM/YYYY)  
	*/
	public strToDate(date: string, format?: string): Date {
		if (!date) {
			moment().toDate();
		} else {
			if (format) date = date.substr(0, format.length);
			return moment(date, format || 'DD/MM/YYYY').toDate();
		}
	}
	/** convert a date to a moment object */
	public strToMoment(date: string) {
		if (!date) {
			return moment();
		} else {
			return moment(date, 'DD/MM/YYYY');
		}
	}
	/** convert a date to a clarion date */
	public clarionDate(date?: Date): number {
		if (!date) date = new Date();
		var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		var startDate = new Date("December 28, 1800");
		var diffDays = Math.round(Math.abs((date.getTime() - startDate.getTime()) / (oneDay)))
		return diffDays
	}
	/** convert a date to a clarion date */
	public clarionDateToDate(clarionDate?: number): Date {
		if (!clarionDate) return new Date();
		return this.dateAddDays(clarionDate, new Date("December 28, 1800"));
	}

	/** convert a date to a clarion date */
	public shortMonth(clarionDate?: number): string {
		var me = this;
		var date = me.clarionDateToDate(clarionDate);
		return me.monthShortName(date.getMonth() + 1);
	}

	/** convert a date to a clarion date */
	public monthYear(clarionDate?: number): string {
		var me = this;
		var date = me.clarionDateToDate(clarionDate);
		return me.monthShortName(date.getMonth() + 1) + '`' + date.getFullYear().toString().substr(2, 2);
	}

	/** get short description for month */
	public monthShortName(month: number): string {
		if (!month) return '';
		var month_names_short = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var monthName = month_names_short[month];
		return monthName;
	}

	/** get short description for month */
	public monthName(month: number): string {
		if (!month) return '';
		var month_names_short = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octover', 'November', 'December'];
		var monthName = month_names_short[month];
		return monthName;
	}

	/** get short description for month */
	public dayOfWeek(date: Date, option?: "Short" | "Long"): string {
		if (!date) return '';
		var day_names_short = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Fridate', 'Saturday'];
		var day_names_long = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		if (option == "Short") {
			return day_names_short[date.getDay()]
		} else {
			return day_names_long[date.getDay()]
		}
	}

	/** convert a date to a clarion date */
	public clarionTime(date?: Date): number {
		if (!date) date = new Date();
		var mmtMidnight = moment(date).startOf('day');
		var seconds = moment(date).diff(mmtMidnight, 'seconds') * 100;
		return seconds
	}
	/** convert a date to a clarion time */
	public clarionTimeToDate(clarionDate?: number): Date {
		if (!clarionDate) return new Date();
		return moment(new Date("December 28, 1800")).add(clarionDate / 100, 'seconds').toDate();
	}



	/** convert a date to a string (DD/MM/YYYY) */
	public diffDays(fromDate: Date, toDate?: Date): number {
		var me = this;
		var date = moment(toDate);
		var returnValue = date.diff(fromDate, "days");
		return isNaN(returnValue) ? null : returnValue;
	}


	/** get the days different in words */
	public diffDaysWords(date: Date): string {
		var me = this;
		if (!date) return '';
		var days = me.diffDays(date);
		switch (days) {
			case null:
				return '';
			case -1:
				return 'tomorrow';
			case 0:
				return dt.timeToStr(date);
			case 1:
				return 'yesterday';
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				return dt.dayOfWeek(date);
			default:
				return dt.dateToStr(date, "D MMMM YYYY")
		}

	}


}

/** Extra functions used with views */
export class ViewExt {

	/** remove the focus from a view object */
	public clearAndDismiss(view: view.ViewBase) {
		if (!view) return;
		this.dismissSoftInput(view);
		this.clearFocus(view);
	}

	/** remove the focus from a view object */
	public clearFocus(view: view.ViewBase) {
		if (!view) return;
		if (isAndroid) if (view.android) view.android.clearFocus();
	}

	/** hide the soft keyboard from a view object */
	public dismissSoftInput(view: view.ViewBase) {
		if (!view) return;
		try {
			(<any>view).dismissSoftInput();
		} catch (error) {

		}
	}
}

export interface IValueItem {
	ValueMember: any;
	DisplayMember: string;
}

/** a value list array */
export class ValueList {

	/** this array of value items */
	private items: Array<IValueItem>;

	/** the number of items */
	get length(): number { return this.items.length; }

	constructor(array?: Array<IValueItem>) {
		if (array) this.items = array;
	}

	/** add a new item to the list */
	public addItem(item: IValueItem) {
		this.items.push(item);
	}

	/** add a new item to the beginning of the list */
	public addItemFront(item: IValueItem) {
		this.items.unshift(item);
	}

	/** get the list of value items */
	public getItems(): Array<IValueItem> {
		return this.items;
	}

	/** get an item by its index */
	public getItem(index: number) {
		return this.getText(index);
	}

	/** get the items display value by its index */
	public getText(index: number): string {
		if (index < 0 || index >= this.items.length) {
			return "";
		}
		return this.items[index].DisplayMember;
	}
	/** get an array of the items text field  */
	public getTextArray(): Array<any> {
		var me = this;
		return me.items.map(function (x: IValueItem) { return x.DisplayMember; });
	}

	/** get the items value by its index */
	public getValue(index: number) {
		if (index < 0 || index >= this.items.length) {
			return null;
		}
		return this.items[index].ValueMember;
	}

	/** get the items index by its value, use default index if not found else return -1 */

	public getIndex(value: any, defaultIndex?: number): number {
		for (var i = 0; i < this.items.length; i++) {
			if (this.getValue(i) == value) return i;
		}
		return defaultIndex == null ? -1 : defaultIndex;
	}
}

/** a value list array */
export class Dictionary {

	/** this array of value items */
	private _items = [];
	/** get the list of value items */
	public get items() { return this._items }
	/** set the list of value items */
	public set items(array) { this._items = array }

	public valueMemberName = "ValueMember";
	public displayMemberName = "DisplayMember";

	/** the number of items */
	public get length(): number { return this.items.length; }

	constructor(array?: Array<any>, valueMemberName?: string, displayMemberName?: string) {
		this.addItems(array, valueMemberName, displayMemberName);
	}

	/** add a new item to the list */
	public addItem(item: IValueItem) {
		this.items.push(item);
	}

	/** add a new item to the list */
	public addItems(array: Array<any>, valueMemberName: string, displayMemberName: string) {
		var me = this;
		if (array) me.items = array;
		if (valueMemberName) this.valueMemberName = valueMemberName;
		if (displayMemberName) this.displayMemberName = displayMemberName;
	}

	/** add a new item to the beginning of the list */
	public addItemFront(item: IValueItem) {
		var me = this;
		var addItem = {};
		addItem[me.valueMemberName] = item.ValueMember;
		addItem[me.displayMemberName] = item.DisplayMember;
		this.items.unshift(addItem);
	}


	/** get an item by its index */
	public getItem(index: number) {
		return this.getText(index);
	}

	/** get the items display value by its index */
	public getText(index: number): string {
		var me = this;
		if (index < 0 || index >= me.items.length) {
			return "";
		}
		return me.items[index][me.displayMemberName];
	}

	/** get an array of the items display members  */
	public getTextArray(): Array<any> {
		var me = this;
		return me.items.map(function (x: IValueItem) { return x[me.displayMemberName]; });
	}

	/** get the items valueMember by its index */
	public getValue(index: number) {
		var me = this;
		if (!me.items || me.items.length == 0) return null;
		if (index == undefined || index < 0 || index >= me.items.length) return null;
		return me.items[index][me.valueMemberName];
	}

	/** get the items index by its valueMemeber, use default index if not found else return -1 */
	public getIndex(value: any, defaultIndex?: number): number {
		var me = this;
		for (var i = 0; i < this.items.length; i++) {
			if (me.getValue(i) == value) return i;
		}
		return defaultIndex == null ? -1 : defaultIndex;
	}
}

/** File access functions */
export class File {

	public documentFolder = fileSystemModule.knownFolders.documents();

	/** get an application folder */
	public getAppFolder(folder: string) {
		return fileSystemModule.knownFolders.currentApp().getFolder(folder);
	};

	/** get an application folder */
	public getAppFolderPath(folder: string) {
		return fileSystemModule.knownFolders.currentApp().getFolder(folder).path;
	};

	/** get an application full filename */
	public getAppFilename(filename: string, folder: string) {
		return fileSystemModule.knownFolders.currentApp().getFolder(folder).path + '/' + filename;
	};

	/** get an application full filename */
	public getAppFileExists(filename: string, folder: string): boolean {
		return fileSystemModule.knownFolders.currentApp().getFolder(folder).contains(filename);
	};

	/** return an application file */
	public getAppFile(filename: string, folder: string) {
		return fileSystemModule.knownFolders.currentApp().getFolder(folder).getFile(filename);
	};

	/** extract file from path */
	public getFilename(path: string): string {
		if (!path) return ''
		if (path.indexOf("/") == -1) return path;
		return path.split("/").pop();
	};

	/** check if media file exists */
	public mediaFileExists(filename: string): boolean {
		var me = this;
		filename = me.getFilename(filename);
		return me.getAppFileExists(filename, "media");
	}

	/** get a media file object */
	public mediaGetFile(filename: string): fileSystemModule.File {
		var me = this;
		filename = me.getFilename(filename);
		return file.getAppFolder("media").getFile(filename);
	}

	/** get fullname for media file */
	public mediaGetFullName(filename: string): string {
		var me = this;
		filename = me.getFilename(filename);
		return me.getAppFolderPath("media") + `/${filename}`;
	}

	public tempFolder = fileSystemModule.knownFolders.temp();

	public downloadFolder = isAndroid ? android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() : '';

	/** load json from a file */
	public exists(filename: string) {
		var me = this;
		return me.documentFolder.contains(filename);
	}

	/** save json to a file */
	public saveFile(filename: string, data) {
		var me = this;
		return new Promise(function (resolve, reject) {
			var file = me.documentFolder.getFile(filename);
			file.writeSync(data, function (err) {
				reject(err);
				return;
			});
			resolve();
		});
	}

	/** load json from a file */
	public loadJSONFile(filename: string) {
		var me = this;
		return new Promise(function (resolve, reject) {
			var file = me.documentFolder.getFile(filename);
			file.readText().then(function (content) {
				var returnValue = null;
				if (content != "") returnValue = JSON.parse(content);
				resolve(returnValue);
			}).catch(function (err) {
				reject(err);
			});
		});
	}

	/** save json to a file */
	public saveJSONFile(filename: string, data) {
		var me = this;
		return new Promise(function (resolve, reject) {
			var file = me.documentFolder.getFile(filename);
			file.writeText(JSON.stringify(data)).then(function (content) {
				resolve(content);
			}).catch(function (err) {
				reject(err);
			});
		});
	}

	//** empty the file */
	public clearJSONFile(filename: string, data) {
		var file = this.documentFolder.getFile(filename);
		file.writeText(JSON.stringify({}));
	}

	//** create a full filename including the folder for the current app */
	public getFullFilename(filename: string) {
		var me = this;
		return fileSystemModule.path.join(me.documentFolder.path, filename);
	}
	//** create a full filename including the temp folder for the current app */
	public getFullTempFilename(filename: string) {
		var me = this;
		return fileSystemModule.path.join(me.tempFolder.path, filename);
	}
	// public deleteFile(party: string) {
	// 	var file = fileSystemModule.knownFolders.documents().getFile(party);
	// 	file.
	// }


	public downloadUrl(url, filePath) {
		var me = this;
		return new Promise(function (resolve, reject) {

			http.getFile(url, filePath).then(() => {
				call.openFile(filePath);
			}).then(function () {
				resolve();
			}).catch(function (e) {
				var err = new Error("Error downloading '" + filePath + "'. " + e.message);
				console.log(err.message);
				alert(err.message);
				reject(err);
			});
		});
	}


}

export interface IcomposeEmail {
	to: string;
	subject?: string;
	body?: string;
	salutation?: string;
	dear?: string;
	regards?: string;
}

/** call thirdparty apps */
export class Call {

	/** compose an email */
	public composeEmail(message: IcomposeEmail) {
		var me = this;
		var subject = (message.subject || "Support");
		if (!message.body) {
			message.body = (message.salutation || (message.dear ? "Dear " + message.dear : null) || "Dear Madam/Sir");
			if (message.regards) message.body += "<BR><BR><BR>Regards<BR>" + message.regards;
		}

		email.available().then(function (avail) {
			if (avail) {
				return email.compose({
					to: [message.to],
					subject: subject,
					body: message.body,
					appPickerTitle: 'Compose with..' // for Android, default: 'Open with..'
				})
			} else {
				throw new Error("Email not available");
			}
		}).then(function () {
			console.log("Email composer closed");
		}).catch(function (err) {
			alert(err.message);
		});;
	}

	/** make a phone call */
	public phoneDial(PhoneNo: string) {
		var me = this;
		phone.dial(PhoneNo, true);
	}

	public openFile(filePath: string) {
		var me = this;
		var filename = filePath.toLowerCase();
		try {
			if (android) {
				if (filename.substr(0, 7) != "file://" || filename.substr(0, 10) != "content://") filename = "file://" + filename;
				if (android.os.Build.VERSION.SDK_INT > android.os.Build.VERSION_CODES.M) filename = filename.replace("file://", "content://");

				var uri = android.net.Uri.parse(filename.trim());
				var type = "application/" + ((exports.str.inList(filename.slice(-4), ['.pdf', '.doc', '.xml'])) ? filename.slice(-3) : "*");

				//Create intent
				var intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
				intent.setDataAndType(uri, type);
				intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
				application.android.currentContext.startActivity(intent);
			}
			else {
				ios.openFile(filename);
			}
		} catch (e) {
			alert('Cannot open file ' + filename + '. ' + e.message);
		}
	}

}

// /** Extending Nativescript Autocomplete */
// export class TokenItem extends autocompleteModule.TokenModel {
// 	value: number;
// 	constructor(text: string, value: number, image?: string) {
// 		super(text, image || null);
// 		this.value = value;
// 	}

// };


export class Form {

	public get currentPage(): Page {
		return topmost().currentPage;
	};

	public showPage(me, pageName: string, context?: any, folder?: string) {

		if (me) me.childPage = pageName;
		var data = {
			moduleName: (folder || '') + pageName + '/' + pageName,
			context: context || {},
			animated: true,
			transition: { name: "slide", duration: 380, curve: "easeIn" },
			clearHistory: false,
			backstackVisible: true
		};
		topmost().navigate(data);
	}

	public device(): "android" | "ios" | "" {
		if (isAndroid) return "android";
		if (isIOS) return "ios";
		return "";
	}

	public goBack() {
		topmost().goBack();
	};

	public showModal(path: string, params?, fullscreen?: boolean): Promise<any> {
		var me = this;
		return new Promise(function (resolve, reject) {
			topmost().currentPage.showModal(path, params, function (args) {
				resolve(args);
			}, fullscreen)
		});
	}


}

export var form = new Form();
export var tagging = new Tagging();
export var str = new Str();
export var sql = new Sql();
export var dt = new Dt();
export var viewExt = new ViewExt();
export var file = new File();
export var call = new Call();
export var utils = new Utils();
