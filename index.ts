export var sf = require('sf');
export var moment = require("moment");
import {ObservableArray} from "data/observable-array";
import {isAndroid} from "platform";
import view = require("ui/core/view");
import * as observableModule from "data/observable";

/// Tagging ------------
class Tagging {

	public tagIcon = String.fromCharCode(0xf046);
	public unTagIcon = String.fromCharCode(0xf096);

	public newTag(icon?: string ) : observableModule.Observable {
		if(!icon) icon = this.unTagIcon;
		return new observableModule.Observable({value:icon});
	}

	public clearAll(array: any[]) : any[] {
		for (var i = 0; i < array.length; i++) {
//			array[i].tag = ""
			array[i].tag = this.newTag(); 
		}
		return array;
	}
	public tagAll(array: any[]) : any[] {
		var me = this;
		for (var i = 0; i < array.length; i++) {
			array[i].tag = me.newTag(me.tagIcon); 
		}
		return array;
	}
	public unTagAll(array: any[]) : any[] {
		var me = this;
		for (var i = 0; i < array.length; i++) {
			array[i].tag = me.newTag(me.unTagIcon); 
		}
		return array;
	}
	public toggleTagIcon(icon: string) : string {
		if(icon == this.tagIcon) {
			return this.unTagIcon;
		} else {
			return this.tagIcon;
		}
	}
	public toggleRow(row : any) : any {
		if(!row) return null;
		row.tag = this.newTag(this.toggleTagIcon(row.tag));
		return row;
	}
	public toggleObservable(obervableTag: observableModule.Observable) : observableModule.Observable {
		return this.newTag(this.toggleTagIcon(obervableTag.get("value")));
	}
	public toggleObservableRow(array: ObservableArray<any>, index : number) : ObservableArray<any> {
		var row = this.toggleRow(array.getItem(index));
        array.setItem(index,row);
		return array;
	}

	public count(array: any[]) : number {
		if(!array) return 0;
		return  array.length;
	}
	public countTagged(array: any[]) : number {
		if(!array) return 0;
		return this.getTaggedRows(array).length;
	}
	public countUntagged(array: any[]) : number {
		if(!array) return 0;
		return this.getTaggedRows(array).length;
	}
	public getTaggedRows(array: any[]) : any[] {
		var me = this;
		if(!array) return null;
		var taggedRows =array.filter(function (x) {
			return (x.tag && x.tag.get("value") == me.tagIcon);
		});
		return taggedRows;
	}
	public getUnTaggedRows(array: any[]) : any[] {
		var me = this;
		var taggedRows =array.filter(function (x) {
			return (x.tag && x.tag.get("value") == me.unTagIcon);
		});
		return taggedRows;
	}


}

class Sql {
	//other
	public dateField(field, description) : string {
		return sf("convert(varchar,convert(datetime,{0}-36163),103) {0}",field, description || field );
	}
	public date(field) {
		return sf("convert(varchar,convert(datetime,{0}-36163),103)",field );
	}
}

class Str {

	public fixedEncodeURIComponent(url: string) : string {
		return encodeURIComponent(url).replace(/[!'()*]/g, function(c) {
			return '%' + c.charCodeAt(0).toString(16);
		});
	}

	public filterArray(data: any[], searchField: string, searchText: string) {
		searchText = searchText.toLowerCase()
		var filteredData =data.filter(function (x) {
			return (x[searchField] && x[searchField].toLowerCase().indexOf(searchText)>=0);
		});
		return new ObservableArray(filteredData);
	}

	public filterArrayByArray(data: any[], searchField: string[], searchText: string) {
		searchText = searchText.toLowerCase()
		var filteredData =data.filter(function (x) {

			for (var i = 0; i < searchField.length; i++) {
				if (x[searchField[i]] && x[searchField[i]].toLowerCase().indexOf(searchText)>=0) return true;
			}
			return false;

		});
		return new ObservableArray(filteredData);
	}
	
	public containsAny(str, substrings) : boolean {
        for (var i = 0; i != substrings.length; i++) {
           if (str.indexOf(substrings[i]) != - 1) return true;
        }
        return false; 
    }

	///get all rows where an object has a specific value
	public getArrayItems(array: any[], searchField: string, searchValue: any) {
		return array.filter(function (obj) {
			return obj[searchField] == searchValue;
		});
	}

	public getArrayItem(array: any[], searchField: string, searchValue: any) {
		return this.getArrayItems(array,searchField,searchValue)[0];
	}

	///convert an array to and observable array
	public observableArray (array?: Array<any>) {
		return new ObservableArray(array);
	}

	///Extract objects from array 
	public getArrayObjects (array: Array<any>, objectName: string) : Array<any> {
		return array.map(function (x) { return x[objectName]; });
	}	

}

class Dt {
	public dateToStr(date?: Date) : string {
		if(!date) {
	        return moment().format('DD/MM/YYYY');
		} else {
	        return moment(date).format('DD/MM/YYYY');
		}
	}
	public strToDate(date: string) : Date {
		if(!date) {
		   moment().toDate();
		} else {
		   return moment(date, 'DD/MM/YYYY').toDate();
		}
	}
	public strToMoment(date: string) {
		if(!date) {
		   return moment();
		} else {
		   return moment(date, 'DD/MM/YYYY');
		}
	}
	public clarionDate(date: Date) : number {
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var startDate = new Date("December 28, 1800");
		var diffDays = Math.round(Math.abs((date.getTime() - startDate.getTime())/(oneDay)))
		return diffDays
	}
}

class ViewExt {
	public clearFocus(view: view.View)  {
		if(!view) return;
        if(isAndroid) view.android.clearFocus();
	}
	public dismissSoftInput(view: view.View)  {
		if(!view) return;
	  	try {
	       (<any>view).dismissSoftInput();
	  	} catch (error) {
		  
	  	}
	}
}


export var tagging = new Tagging();
export var str = new Str();
export var sql = new Sql();
export var dt = new Dt();
export var viewExt = new ViewExt();