const kad = require('kad')
const zlib = require('zlib')
const topics = require('./topics.json')

const cb = () => {}
const address = { address: '127.0.0.1', port: 1330 }
const contact = kad.contacts.AddressPortContact(address)
const transport = kad.transports.UDP(contact)
const storage = kad.storage.MemStore()
const dht = new kad.Node({ transport, storage })

const toBuffer = obj => new Buffer(JSON.stringify(obj), 'utf8')

const searchIndex = Object.keys(topics).reduce((obj, id) =>
  Object.assign({}, obj, { [id]: topics[id].keywords }), {})

zlib.deflateRaw(toBuffer(searchIndex), (err, buffer) =>
  dht.put('searchIndex', buffer.toString('base64'), cb))

Object.keys(topics).forEach(id =>
  zlib.deflateRaw(toBuffer(topics[id]), (err, buffer) =>
    dht.put(id, buffer.toString('base64'), cb)))
