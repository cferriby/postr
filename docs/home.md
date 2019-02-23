## Usage

```bash
npm install @postr/code
```

```js
const express = require('express')
const micropubEndpoint = require('@postr/core')
const app = express()
const myEndpoint = micropubEndpoint(/_config_/)

app.use('/micropub', myEndpoint.router)
app.listen(80)
```

### Config

Configuration can be passed as an object when using this as a node module

#### Options

`permalinkPattern` - String - What your site permalinks look like. Written in express style. Must include year month and day at the moment. Default: `:siteBaseUrl/:year/:month/:day/:slug`

`sendWebmentions` - Boolean - Send webmentions automatically or not. Default: `true`

`formatContent` - Boolean - Whether or not to format plain text content. Default: `true`

`getRefs` - Boolean - Enables parsing of refereced urls. Default: `true`

`downloadExternalMedia` - Boolean - Whether or not to download referenced media files (`photo`, `audio` and `video` properties). They will be saved to the default media endpoint. Default: `true`

`syndication` - Array - Your syndication providers that will be returned in micropub config queries. Default: `[]`

`port` - Number - Port to listen on. Default: 80

`mediaDir` - String - The local media directory. Default: `dirname + '/../media'`

`dbName` - String - The database name. Note: Must adhere to RxDB rules. Default: `micropubendpoint`

`dbAdapter` - String/Object - The database adapter. Note: To use a different adapter you must also load the appropriate RxDB plugin. Default: `leveldb`

`imageSizes` - Object - A set of sizes to scale images to. should be in the format `{name: [width, height]}` eg. `{thumbnail: [200, 200], large: [1800, 0]}`, Note: If you pass 0 as the height the image will retain its original ratio. Default: `{}`

`siteBaseUrl` - String(url) - The base url of your website with no trailing slash. Eg. `https://grant.codes`

`endpointBaseUrl` - String(url) - The base url of this media endpoint with no trailing slash. Eg. `https://micropub.grant.codes` or `https://grant.codes/micropub`

`mediaBaseUrl` - String(url) - The base url of your media folder. If you are running the endpoint in standalone mode it will default to `{{endpointBaseUrl}}/static`. If you are running this as a module you should statically serve the `mediaDir` and set this option

`dbPassword` - String - The database password

`tokenEndpoint` - String(url) - Your token endpoint. Used for authenticating requests

`dangerousDevMode` - Boolean - Set to true and the endpoint will skip checking tokens. It may do more in the future

`mediaEndpoint` - String(url) - If you want to post media to a different media endpoint pass the url here and all file storage will be handled by your media endpoint. No image resizing will be done.