const kad = require('kad')
const traverse = require('kad-traverse')
const zlib = require('zlib')
const topics = require('./topics.json')

const cb = () => {}
const address = { address: '127.0.0.1', port: 1330 }
const transportProps = {
  traverse: {
    upnp: { forward: 1330, ttl: 6000 },
    stun: { server: { address: 'stun1.l.google.com', port: 19302 } },
    turn: false
  }
}

const contact = kad.contacts.AddressPortContact(address)
const NatTransport = traverse.TransportDecorator(kad.transports.UDP)
const transport = new NatTransport(contact, transportProps)
const storage = kad.storage.MemStore()
const dht = new kad.Node({ transport, storage })

const searchIndex = Object.keys(topics).reduce((obj, id) =>
  Object.assign({}, obj, { [id]: topics[id].title }), {})

const toBuffer = obj => new Buffer(JSON.stringify(obj), 'utf8')

zlib.deflateRaw(toBuffer(searchIndex), (err, buffer) =>
  dht.put('searchIndex', buffer.toString('base64'), cb))

Object.keys(topics).forEach(id =>
  zlib.deflateRaw(toBuffer(topics[id]), (err, buffer) =>
    dht.put(id, buffer.toString('base64'), cb)))
