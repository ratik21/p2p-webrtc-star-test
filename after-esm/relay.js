/* eslint-disable no-console */

import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'
import { webRTCStar } from "@libp2p/webrtc-star";
import wrtc from "@koush/wrtc";
import { Multiaddr } from 'multiaddr';
import { webSockets } from '@libp2p/websockets'

const createNode = async () => {
  const star = webRTCStar({ wrtc: wrtc });
  const node = await createLibp2p({
    addresses: {
      listen: [
        //'/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
        // custom deployed webrtc-star signalling server
        //'/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
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
      tcp(),
      webSockets(),
      star.transport
    ],
    streamMuxers: [
      mplex({
        maxInboundStreams: Infinity,
        maxOutboundStreams: Infinity
      })
    ],
    peerDiscovery: [
      mdns({
        interval: 1000
      }),
      star.discovery
    ],
    connectionEncryption: [
      noise()
    ],
    dht: kadDHT(),
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      emitSelf: true,
      enabled: true
    }),
    relay: {
        enabled: true,
        hop: {
            enabled: true
        },
        advertise: {
            enabled: true,
        }
    }
  })

  await node.start()
  return node
}

;(async () => {
  const node = await createNode();
  console.log("started relay node with id: ", node.peerId.toString());
  node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
//   node.addEventListener('peer:discovery', async (event) => {
//     const peerInfo = event.detail;
//     //console.log('Discovered:', peerInfo.id.toString());

//     // console.log("dialing..");
//     // try {
//     //   const ma = new Multiaddr(`/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/${peerInfo.id.toString()}`);
//     //   await node.dial(ma);
//     // } catch (error) {
//     //   console.log(error);
//     // }
//   });

  node.connectionManager.addEventListener('peer:connect', async (event) => {
    const connection = event.detail;
    console.log('Connection established to:', connection.remotePeer.toString());
  });
})()
