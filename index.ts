import {ObservableArray} from "data/observable-array";
var sf = require('sf');

class Tagging {
	
	//Tagging ------------
	public tagClearAll(arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tag = ""
		}
		return arr;
	}
	public tagAll(arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tag = String.fromCharCode(0xf046);
		}
		return arr;
	}
	public unTagAll(arr) {
		for (var i = 0; i < arr.length; i++) {
			arr[i].tag = String.fromCharCode(0xf096);
		}
		return arr;
	}
	public tagToggle(obj) {
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
	public dateField(field, description) {
		return sf("convert(varchar,convert(datetime,{0}-36163),103) {0}",field, description || field );
	}
	public date(field) {
		return sf("convert(varchar,convert(datetime,{0}-36163),103)",field );
	}
}

class Str {

	public fixedEncodeURIComponent(url: string) {
		return encodeURIComponent(url).replace(/[!'()*]/g, function(c) {
			return '%' + c.charCodeAt(0).toString(16);
		});
	}

	public filterArray(data: any[], searchField: string, searchText: string) {
		var filteredData =data.filter(function (x) {
			return x[searchField] == searchText;
		});
		return new ObservableArray(filteredData);
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

export var tagging = new Tagging();
export var str = new Str();
export var sql = new Sql();
