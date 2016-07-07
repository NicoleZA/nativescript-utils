export var sf = require('sf');
import {ObservableArray} from "data/observable-array";
export var moment = require("moment");

class Tagging {
	
	//Tagging ------------
	public tagClearAll(arr) : any[] {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tag = ""
		}
		return arr;
	}
	public tagAll(arr) : any[] {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tag = String.fromCharCode(0xf046);
		}
		return arr;
	}
	public unTagAll(arr) : any[] {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tag = String.fromCharCode(0xf096);
		}
		return arr;
	}
	public tagToggle(obj) : any {
		if(obj.tag == String.fromCharCode(0xf046)) {
			obj.tag = String.fromCharCode(0xf096);
		} else {
			obj.tag = String.fromCharCode(0xf046);
		}
		return obj;
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

	public getArrayItem(data: any[], searchField: string, searchValue: any) {
		return data.filter(function (obj) {
			return obj[searchField] == searchValue;
		})[0];
	}

	public observableArray (array: Array<any>) {
		return new ObservableArray(array);
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

export var tagging = new Tagging();
export var str = new Str();
export var sql = new Sql();
export var dt = new Dt();