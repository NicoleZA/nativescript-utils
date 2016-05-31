# NativeScript Utils

A NativeScript module providing a collection of useful functions

## Installation

```
npm install nativescript-utils
```

## Usage

var utils = require("nativescript-utils");

After you have a reference to the module you can then call the available methods.


### Functions
#### 	public filterArray(data: any[], searchField: string, searchText: string) {

##### Parameters
* data: the json array to filter.
* searchField: the json object name 
* the value to filter by 

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
```js
import {str} from 'nativescript-utils';
var data = {"employees":[
    {"firstName":"John", "lastName":"Doe"},
    {"firstName":"Anna", "lastName":"Smith"},
    {"firstName":"Peter", "lastName":"Jones"}
]};
var filteredData = str.filterArray(data,"lastName","o");
```
