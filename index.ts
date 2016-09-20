export var sf = require('sf');
export var moment = require("moment");
import {ObservableArray} from "data/observable-array";
import {isAndroid} from "platform";
import view = require("ui/core/view");
import * as observableModule from "data/observable";
import * as fileSystemModule from "file-system";

/** Tagging Functions */
class Tagging {

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
		var me = this;
		for (var i = 0; i < array.length; i++) {
			array[i].tag = me.newTag(me.tagIcon);
		}
		return array;
	}
	/** set all array objects tag property to the default untagged icon object */
	public unTagAll(array: any[]): any[] {
		var me = this;
		for (var i = 0; i < array.length; i++) {
			array[i].tag = me.newTag();
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
	/** Toggle the rows tag property */
	public toggleRow(row: any): any {
		if (!row) return null;
		row.tag = this.newTag(this.toggleTagIcon(row.tag));
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
class Sql {
	//other
	/** return a sql snipped to fetch a clarion date from the database as a standard date*/
	public date(field) {
		return sf("convert(varchar,convert(datetime,{0}-36163),103)", field);
	}
}

/** String Functions */
class Str {

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
				if (x[searchField[i]] && x[searchField[i]].toLowerCase().indexOf(searchText) >= 0) return true;
			}
			return false;

		});
		return new ObservableArray(filteredData);
	}

	/** return true if a string contains any item in the substring array) */
	public containsAny(str: string, substrings: string[]): boolean {
        for (var i = 0; i != substrings.length; i++) {
			if (str.indexOf(substrings[i]) != - 1) return true;
        }
        return false;
    }

	/** return a filtered array where the named field(property) contains specific text (case insensitive) */
	public getArrayItems(array: any[], searchField: string, searchValue: any) {
		return array.filter(function (obj) {
			return obj[searchField] == searchValue;
		});
	}

	/** get the first item from an array where the named field(property) contains specific text (case insensitive) */
	public getArrayItem(array: any[], searchField: string, searchValue: any) {
		return this.getArrayItems(array, searchField, searchValue)[0];
	}

	/** convert an array to and observable array */
	public observableArray(array?: Array<any>) {
		return new ObservableArray(array);
	}

	/** Extract objects from array  */
	public getArrayObjects(array: Array<any>, objectName: string): Array<any> {
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
		Object.keys(EnumObj).forEach(function (key) {
			if (typeof EnumObj[key] === "string") returnValue.push(EnumObj[key]);
		});
		return returnValue;
	}


}

/** Date Functions */
class Dt {

	/** convert a date to a string (DD/MM/YYYY) */
	public dateToStr(date?: Date): string {
		if (!date) {
			return moment().format('DD/MM/YYYY');
		} else {
			return moment(date).format('DD/MM/YYYY');
		}
	}

	/** convert a string (DD/MM/YYYY) to a date */
	public strToDate(date: string): Date {
		if (!date) {
			moment().toDate();
		} else {
			return moment(date, 'DD/MM/YYYY').toDate();
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
	public clarionDate(date: Date): number {
		var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		var startDate = new Date("December 28, 1800");
		var diffDays = Math.round(Math.abs((date.getTime() - startDate.getTime()) / (oneDay)))
		return diffDays
	}
}

class ViewExt {

	/** remove the focus from a view object */
	public clearAndDismiss(view: view.View) {
		if (!view) return;
		this.dismissSoftInput(view);
		this.clearFocus(view);
	}

	/** remove the focus from a view object */
	public clearFocus(view: view.View) {
		if (!view) return;
        if (isAndroid) if (view.android) view.android.clearFocus();
	}

	/** hide the soft keyboard from a view object */
	public dismissSoftInput(view: view.View) {
		if (!view) return;
		try {
			(<any>view).dismissSoftInput();
		} catch (error) {

		}
	}
}

export interface IValueItem {
    ValueMember: any
    DisplayMember: string
}

/** a value list array */
export class ValueList {

	/** this array of value items */
    private items: Array<IValueItem>;

	/** the number of items */
    get length(): number { return this.items.length; }

    constructor(array: Array<IValueItem>) {
        this.items = array;
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
    public getItem(index: number): IValueItem {
        if (index < 0 || index >= this.items.length) {
            return null;
        }
        return this.items[index];
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
        let loop: number;
        for (loop = 0; loop < this.items.length; loop++) {
            if (this.getValue(loop) == value) {
                return loop;
            }
        }
        return defaultIndex == null ? -1 : defaultIndex;
    }
}

class File {

	public folder = fileSystemModule.knownFolders.documents();

	/** load json from a file */
	public exists(filename: string) {
		var me = this;
        return me.folder.contains(filename);
	}

	/** load json from a file */
	public loadJSONFile(filename: string) {
		var me = this;
        return new Promise(function (resolve, reject) {
			var file = me.folder.getFile(filename);
			file.readText().then(function (content) {
				var returnValue = null;
				if (content != "") JSON.parse(content);
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
			var file = me.folder.getFile(filename);
			file.writeText(JSON.stringify(data)).then(function (content) {
				resolve(content);
			}).catch(function (err) {
				reject(err);
			});
        });
	}

	//** empty the file */
	public clearJSONFile(filename: string, data) {
		var file = this.folder.getFile(filename);
		file.writeText(JSON.stringify({}));
	}

	//** create a full filename including the folder for the current app */
	public getFullFilename(party: string) {
		var me = this;
		return fileSystemModule.path.join(me.folder.path, party);
	}
	// public deleteFile(party: string) {
	// 	var file = fileSystemModule.knownFolders.documents().getFile(party);
	// 	file.
	// }

}


export var tagging = new Tagging();
export var str = new Str();
export var sql = new Sql();
export var dt = new Dt();
export var viewExt = new ViewExt();
export var file = new File();
