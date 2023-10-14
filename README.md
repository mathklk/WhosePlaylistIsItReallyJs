# Whose playlist is it really?

A simple web app that analyzes Spotify collaborative playlists and determines who added most of the songs.

Live demo: TBD

# Dependencies

I'm using [spotify-web-api-js](https://github.com/JMPerez/spotify-web-api-js) to access the Spotify API.
Since it's a Node.js library, it is converted to a browser module using [browserify](http://browserify.org/).

```bash
$ npm install -S spotify-web-api-js
$ npm install -g browserify
```

`app.js` is written like a Node.js app and then converted to `bundle.js` which can be run in a browser.

```bash
$ browserify app.js --s bundle > bundle.js
```
(on Windows it's `browserify.cmd` instead of `browserify`)
