"tt.js" Highspeed SelectorBased Library
--------

tt.js is javascript library for modern smartphone browser.

This library is intended to make lightweight, high-speed DOM manipulation.

## Support platforms

### Mobile browsers

- iOS4+ Mobile safari, Chrome for iOS
- Android2+ Android browser and Android4+ Chrome for Android 
- iOS4+, Android2+ Webkit based webviews
- Firefox for Android
- Opera Mobile

### and more

Will support the most modern desktop browsers.

Please note that in some cases may not work (Often in IE :p)

## Usage

Include tt.js to html.

I recommend that you include at the bottom of html.

```
<script src="tt.js"></script>
<script src="other_script.js"></script>
</body>
</html>
```

### Examples
```
//// HTML

<div id="foo">hoge</div>
<div class="bar">fuga</div>
<div name="baz">piyo</div>


//// JavaScript

// Search id name
tt("#foo");

// Search by class name 
tt(".bar");

// Search by query selector type 
tt("div[name=baz]");

// Search by tag name 
tt("div");

// Get HTMLElement
var ttDiv = tt("div"),
    firstDiv = ttDiv.get(0),    // or ttDiv.get(), ttDiv[0]
    secondDiv = ttDiv.get(1);   // or ttDiv[1]

// Add class name
tt("#foo").addClass('new-class');

// Bind event(by direct listen)
tt("#foo").on("click", function() {
    // something   
});

// Bind event(by delegate listen)
tt(document).on("click", "#foo", function() {
    // something    
});

```

### and more

tt.js provides the following TTWorker class methods and tt object methods, environment data.

You can see more information on [documents](http://dameleon.github.io/tt.js/docs/) or source codes.

#### TTWorker class methods

##### TTWorker core and Iteration

- each
- find
- get
- indexOf
- match
- push
- toArray

##### Attributes & Styles

- addClass
- attr
- css
- data
- hasClass
- height
- hide
- offset
- removeClass
- show
- toggleClass
- val
- width

##### DOM manipulation

- append
- children
- clear
- closest
- contains
- html
- parent
- parents
- prepend
- remove
- replace

##### Events

- bind
- delegate
- off
- on
- trigger
- unbind
- undelegate


#### tt object methods

- tt.ajax
- tt.camelizer
- tt.createEnvData
- tt.cssPrefix
- tt.each
- tt.extend
- tt.hyphenizer
- tt.isNodeList
- tt.match
- tt.param
- tt.parseJSON
- tt.proxy
- tt.query2object
- tt.tag
- tt.triggerEvent
- tt.type


#### environment data

- tt.env

Create an object of environmental information based on the information of the navigator.

Environmental information can be obtained based on the following key

```
Decision os:         ios, android, windowsPhone
Decision browsers:   mobileSafari, androidBrowser, chrome, firefox, opera, ie, other
version information: (only mobileSafari androidBrowser)
                     version (raw data)
                     versionCode (version number of the 4-digit or higher)
```

## Benchmarks

- [http://jsperf.com/ttjs-bench-dom-search](http://jsperf.com/ttjs-bench-dom-search)
- [http://jsperf.com/ttjs-add-class](http://jsperf.com/ttjs-add-class)
- [http://jsperf.com/ttjs-add-dom](http://jsperf.com/ttjs-add-dom)
- [http://jsperf.com/ttjs-add-html](http://jsperf.com/ttjs-add-html)
- [http://jsperf.com/ttjs-closest](http://jsperf.com/ttjs-closest)

## Bug report and pull request

Bug reports and pull requests are always accepted.
The beer is very welcome treat to the author.

Thanks to all who use this library.

## License

tt.js is licensed under the terms of the MIT License.
