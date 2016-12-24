const kad = require('kad')
const zlib = require('zlib')
const crypto = require('crypto')

const cb = () => {}
const toBuffer = obj => new Buffer(JSON.stringify(obj), 'utf8')

const dht = new kad.Node({
  transport: kad.transports.UDP(
    kad.contacts.AddressPortContact({
      address: '127.0.0.1',
      port: 1331
    })
  ),
  storage: kad.storage.MemStore()
})

dht.connect({ address: '127.0.0.1', port: 1330 }, cb)

const pushTopic = () => {
  const currentTime = new Date().getTime()
  const key = crypto.createHash('sha1').update(currentTime.toString()).digest('hex')
  const topic = {
    key,
    title: `Generated title at ${currentTime} #${key}`,
    header: `Generated #${key}`,
    desc: `Generated description for #${key}`,
    tags: [ key ],
    created: currentTime,
    updated: null,
    magnet: 'magnet:?xt=urn:ed2k:31D6CFE0D16AE931B73C59D7E0C089C0&xl=0&dn=zero_len.fil&xt=urn:bitprint:3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ.LWPNACQDBZRYXW3VHJVCJ64QBZNGHOHHHZWCLNQ&xt=urn:md5:D41D8CD98F00B204E9800998ECF8427E&dn'
  }
  zlib.deflateRaw(toBuffer(topic), (err, buffer) =>
    dht.put(key, buffer.toString('base64'), cb))
}

setInterval(pushTopic, 5000)
