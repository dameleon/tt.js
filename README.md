"tt.js" Highspeed SelectorBased Library
--------

tt.js is javascript library for modern smartphone browser.

This library has been produced in order to edit also get a very fast operation DOM element.

## Usage

tt.js offers based on jQuery


```
<script src="./tt.js"></script>
```

### ex. Search DOM Elements
```
<div id="id-name">hoge</div>
<div class="class-name">fuga</div>
<div name="attr-name">piyo</div>


// Search id name
tt("#id-name");

// Search on class name 
tt(".class-name");

// Search on query selector type 
tt("div[name=attr-name]");

// Search on tag name 
tt("div");
```

### ex. Get Element 
```
<div id="id-name">hoge</div>
<div class="class-name">fuga</div>
<div name="attr-name">piyo</div>

// tt.js provides a get method
var idElement = tt("id-name").get();    // Get div#id-name
var firstElement = tt("div").get(0);    // Get div#id-name Its first element of HTMLDivElement
var secondElement = tt("div").get(1);   // Get div.class-name Its second element of HTMLDivElement

// Notice: Does not work with tt.js is seen often in jQuery usage such as
var element = $("div")[0];

// It was decided not to work with tt.js for this is also the visibility of code and speed 
```
 
### and more

tt.js provides the following functions and environment data,  object methods.
You can see more information on docs or source codes.

#### object methods

- add
- addClass
- attr
- bind
- clear
- contains
- css
- data
- each
- find
- get
- hasClass
- hide
- html
- march
- off
- offset
- on
- remove
- removeClass
- replace
- show
- toArray
- toggleClass
- trigger
- unbind

#### functions

- tt.createEnvData
- tt.cssCamelizer
- tt.cssHyphenizer
- tt.cssPrefix
- tt.each
- tt.extend
- tt.isArray
- tt.isNodeList
- tt.match
- tt.param
- tt.plugin
- tt.query2object
- tt.triggerEvent

### environment data

- tt.env

```
Create an object of environmental information based on the information of the navigator
Environmental information can be obtained based on the following key
Decision os:         ios, android, windowsPhone
Decision browsers:   mobileSafari, androidBrowser, chrome, firefox, opera, ie, other
version information: (only mobileSafari androidBrowser)
                     version (raw data)
                     versionCode (version number of the 5-digit)
```

## Benchmarks

- http://jsperf.com/tt-js-id-search
- http://jsperf.com/tt-js-class-search
- http://jsperf.com/tt-js-add-class
- http://jsperf.com/tt-js-add-css
- http://jsperf.com/tt-js-add-html (html is very slow. I want you to tell me if there is a hint something.)

## Bug report and pull request

Bug reports and pull requests are always accepted.
The beer is very welcome treat to the author.

Thanks to all who use this library.

## License

tt.js is is licensed under the terms of the MIT License.
