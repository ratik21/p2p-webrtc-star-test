/* eslint-disable no-console */

import { createLibp2p } from 'libp2p'
import { TCP } from '@libp2p/tcp'
import { Mplex } from '@libp2p/mplex'
import { Noise } from '@chainsafe/libp2p-noise'
import { GossipSub } from '@chainsafe/libp2p-gossipsub'
import { KadDHT } from '@libp2p/kad-dht'
import { MulticastDNS } from '@libp2p/mdns'
import { WebRTCStar } from "@libp2p/webrtc-star";
import { WebSockets } from '@libp2p/websockets'
import wrtc from "@koush/wrtc";

const createNode = async () => {
  const transportKey = WebRTCStar.prototype[Symbol.toStringTag]
  const webRTC = new WebRTCStar({ wrtc: wrtc });
  const node = await createLibp2p({
    addresses: {
      listen: [
        //'/ip4/0.0.0.0/tcp/0',

        // custom deployed webrtc-star signalling server
        '/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
      ]
    },
    addressManager: {
      autoDial: true
    },
    connectionManager: {
      autoDial: true,
      dialTimeout: 60000
    },
    transports: [
      webRTC, new WebSockets(), new TCP()
    ],
    streamMuxers: [
      new Mplex({
        maxInboundStreams: Infinity,
        maxOutboundStreams: Infinity
      })
    ],
    peerDiscovery: [
      webRTC.discovery,
      new MulticastDNS({
        interval: 1000
      })
    ],
    connectionEncryption: [
      new Noise()
    ],
    dht: new KadDHT(),
    pubsub: new GossipSub({
      allowPublishToZeroPeers: true,
      emitSelf: true,
      enabled: true
    }),
    config: {
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
  console.log("started node with id: ", node.peerId.toString());

  node.addEventListener('peer:discovery', (event) => {
    const peerInfo = event.detail;
    console.log('Discovered:', peerInfo.id.toString());
  });

  node.connectionManager.addEventListener('peer:connect', async (event) => {
    const connection = event.detail;
    console.log('Connection established to:', connection.remotePeer.toString());
  });

  // after applying this hack, discovery starts, but connection is still not 
  // happening (with nodes behind NAT). Same code works with before-esm version for connectivity
  // using webrtc-star servers.
  
  /*
  node.components.getTransportManager()
    .transports.get("@libp2p/webrtc-star")
    .discovery.addEventListener('peer', evt => {
      const peerInfo = evt.detail;
      console.log('Discovered:', peerInfo.id.toString());
  });

  await node.components.getTransportManager().
  transports.get("@libp2p/webrtc-star").discovery.start();
  */
})()
