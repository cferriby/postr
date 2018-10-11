const { basename } = require('path')
const { parse: parseUrl } = require('url')
const fetch = require('node-fetch')
const moment = require('moment')
const Microformats = require('microformat-node')
const unfluff = require('unfluff')
const Metaphor = require('metaphor')
const engine = new Metaphor.Engine()
// const mf2ExpandUrls = require('./mf2-expand-urls')
const saveFile = require('./save-file.js')

const getEmbed = url =>
  new Promise(resolve => {
    engine.describe(url, data => resolve(data.embed || false))
  })

/**
 * Fetches the given url and either parses mf2 or creates it form other metadata
 */
async function getHEntry(url, storeFiles = true) {
  try {
    const response = await fetch(url, { type: 'get' })
    if (!response.ok) {
      return false
    }
    const mimeType = response.headers.get('content-type')

    let mf2 = {
      type: ['h-entry'],
      properties: {
        url: [url],
      },
    }

    const bufferToFile = async (type, mime) => {
      if (mimeType.indexOf(mime + '/') === 0) {
        if (storeFiles) {
          const buffer = await response.buffer()
          const fileUrl = await saveFile(
            buffer,
            basename(parseUrl(url).pathname)
          )
          if (fileUrl) {
            mf2.properties[type] = [fileUrl]
          } else {
            mf2.properties[type] = [url]
          }
        } else {
          mf2.properties[type] = [url]
        }
      }
    }

    // TODO: Save files to media directory
    // Handle media files followed by html handling
    await bufferToFile('audio', 'audio')
    await bufferToFile('photo', 'image')
    await bufferToFile('video', 'video')
    if (mimeType.indexOf('text/') === 0) {
      const html = await response.text()
      const meta = unfluff(html)
      const embed = await getEmbed(meta.canonicalLink || url)

      // Create a base mf2 object from the metadata
      mf2 = {
        type: ['h-entry'],
        properties: {
          name: [meta.title],
          summary: [meta.description],
          featured: [meta.image],
          url: [meta.canonicalLink],
          content: [meta.text],
          author: meta.author,
        },
      }

      Object.keys(mf2.properties).forEach(key => {
        const value = mf2.properties[key]
        if (!value.length || value[0] == '' || value[0] == null) {
          delete mf2.properties[key]
        }
      })

      if (meta.date) {
        // TODO: Get a better version of this date
        const published = moment(meta.date)
        if (published.isValid()) {
          mf2.properties.pubished = [published.toISOString()]
        }
      }

      const embedDomains = [
        'imgur.com',
        'youtu.be',
        'youtube.com',
        'vimeo.com',
        'reddit.com',
        'redd.it',
        'producthunt.com',
        'todomap.xyz',
        'twitter.com',
      ]

      if (embed) {
        const domain = parseUrl(meta.canonicalLink || url)
          .hostname.split('.')
          .slice(-2)
          .join('.')
        if (embedDomains.indexOf(domain) > -1) {
          mf2.properties.content = [embed.html]
        }
        mf2._cms = { embeds: [embed.html] }
      }

      // Parse actual mf2
      const { items } = Microformats.get({ html: html, filters: ['h-entry'] })
      if (items && items.length === 1) {
        const item = items[0]
        if (Object.keys(item.properties).length > 1) {
          mf2 = item
          // TODO: Maybe should grab author from a h-card elsewhere on the page
          // TODO: Expand urls to make sure they are not relative links
          // mf2 = mf2ExpandUrls(mf2, url)
          // TODO: Check all urls and make sure they are not relative
        }
      }
    }

    if (!Object.keys(mf2.properties).length) {
      return false
    }

    return mf2
  } catch (err) {
    console.log('Error generating mf2 for url', err)
    return false
  }
}

module.exports = getHEntry