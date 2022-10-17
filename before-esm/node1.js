/* eslint-disable no-console */

import { NOISE } from '@chainsafe/libp2p-noise';
import Libp2p from "libp2p";
import Gossipsub from "libp2p-gossipsub";
import KadDHT from 'libp2p-kad-dht';
import Mplex from "libp2p-mplex";
import TCP from 'libp2p-tcp';
import wrtc from "@koush/wrtc";
import WebRTCStar from "libp2p-webrtc-star";
import WebSocket from 'libp2p-websockets'

const createNode = async () => {
  const transportKey = WebRTCStar.prototype[Symbol.toStringTag]
  const node = await Libp2p.create({
    addresses: {
      listen: [
        //'/ip4/0.0.0.0/tcp/0',

        // custom deployed webrtc-star signalling server
        '/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
      ]
    },
    modules: {
      transport: [TCP, WebSocket, WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      dht: KadDHT,
      pubsub: Gossipsub,
      peerDiscovery: []
    },
    config: {
      dht: {
        enabled: false
      },
      pubsub: {
        enabled: true,
      },
      transport: {
        [transportKey]: {
          wrtc // You can use `wrtc` when running in Node.js
        }
      }
    }
  })

  await node.start()
  return node
}

;(async () => {
  const node = await createNode();
  console.log("started node with id: ", node.peerId.toB58String());

  node.on('peer:discovery', (peerId) => {
    console.log('Discovered:', peerId.toB58String());
  });

  node.connectionManager.on('peer:connect', async (connection) => {
    console.log('Disconnected from peer:', connection.remotePeer.toB58String());
  });
})()
