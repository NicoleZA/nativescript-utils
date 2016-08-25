# NativeScript Utils

A NativeScript module providing a collection of useful functions

## Installation

```
npm install nativescript-utils
```

## Usage

var utils = require("nativescript-utils");

After you have a reference to the module you can then call the available methods.

### Function list

#### class str
String Functions
* filterArray(data, searchField, searchText) returns ObservableArray
* filterArrayByArray(data: any[], searchField: string[], searchText: string) returns ObservableArray
* fixedEncodeURIComponent(url) returns string
* getArrayItem(data, searchField, searchValue) returns json 
* observableArray(array) returns observableArray

#### class tagging
Tagging Functions
* tagClearAll(array) returns array
* tagAll(array) returns array
* unTagAll(array) returns array
* tagToggle(obj) returns json 

#### class viewExt
Extended View Methods 
* clearFocus(view) 
* dismissSoftInput(view)

#### class ValueList
A class for managing a keyPair of type IValueItem {ValueMember: any; DisplayMember: string}
* public addItem(item: IValueItem)
* addItemFront(item: IValueItem)
* getItems() :Array<IValueItem>
* getItem(index: number): IValueItem
* getText(index: number): string
* getValue(index: number): any
* getIndex(value: any): number

### str Functions

#### filterArray(data: any[], searchField: string, searchText: string) returns any[]

##### Parameters
* data: the json array to filter.
* searchField: the name of a json object in the array 
* the text to search for in that object 

For example, the code below returns 2 rows where the letter 'o' is containted in lastname

###### javascript
```js
var str = require('nativescript-utils').str
var data = {"employees":[
    {"firstName":"John", "lastName":"Doe"},
    {"firstName":"Anna", "lastName":"Smith"},
    {"firstName":"Peter", "lastName":"Jones"}
]};
var filteredData = str.filterArray(data,"lastName","o");
```
###### typescript
```ts
import {str} from 'nativescript-utils';
var data = {"employees":[
    {"firstName":"John", "lastName":"Doe"},
    {"firstName":"Anna", "lastName":"Smith"},
    {"firstName":"Peter", "lastName":"Jones"}
]};
var filteredData = str.filterArray(data,"lastName","o");
```
