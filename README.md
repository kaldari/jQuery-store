# $.store jQuery plugin #

<code>$.store</code> is a simple, yet easily extensible, plugin to persistently store data on the client side of things. It uses <code>window.localStore</code> where available. Older Internet Explorers will use <code>userData</code>. If all else fails <code>$.store</code> will save your data to <code>cookies</code>.

## Usage ##

<pre><code>
//initialize
$.storage = new $.store();

// save a value
$.storage.set( key, value );

// read a value
$.storage.get( key );

// deletes a value
$.storage.remove( key );

// see which storage method is being used
$.storage.driverInUse();
</code></pre>

## License ##

$.store is published under the [MIT license](http://www.opensource.org/licenses/mit-license) and [GPL v3](http://opensource.org/licenses/GPL-3.0).