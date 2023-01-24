/* eslint-disable no-console */

import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { mdns } from '@libp2p/mdns'
import { webRTCStar } from "@libp2p/webrtc-star";
import { bootstrap } from "@libp2p/bootstrap";
import { webSockets } from '@libp2p/websockets'
import wrtc from "@koush/wrtc";
import { Multiaddr } from 'multiaddr';
import delay from "delay";
import { webTransport } from '@libp2p/webtransport'
import { webRTC } from "js-libp2p-webrtc";

const createNode = async () => {
  const star = webRTCStar({ wrtc: wrtc });
  const node = await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0/',

        //'/ip4/0.0.0.0/tcp/0/ws',

        // TOMORROW :: check with new js-webrtc SERVERRRRR
        // custom deployed webrtc-star signalling server
        //'/ip4/3.87.239.223/tcp/13579/ws/p2p-webrtc-star/'
      ]
    },
    addressManager: {
      autoDial: false
    },
    connectionManager: {
      autoDial: false,
      dialTimeout: 60000
    },
    transports: [
      tcp(),
      webRTC(),
      //webSockets(),
      //webTransport(),
      //star.transport
    ],
    streamMuxers: [
      mplex({
        maxInboundStreams: Infinity,
        maxOutboundStreams: Infinity
      })
    ],
    peerDiscovery: [
      //bootstrap({ list: [ '/ip4/3.87.239.223/tcp/43311/ws/p2p/12D3KooWErNPNEv8oJd65jWrGyX8c4LuRZdrYCD7x7hYAbpgHaru' ] }),
      mdns({
        interval: 1000
      }),
      //star.discovery
    ],
    connectionEncryption: [
      noise()
    ],
    dht: kadDHT({
      kBucketSize: 20,
      clientMode: false
    }),
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      emitSelf: true,
      enabled: true
    }),
    // relay: {
    //   enabled: true,
    //   autoRelay: {
    //     enabled: true,
    //     maxListeners: 10
    //   }
    // },
    nat: {
      description: 'my-node', // set as the port mapping description on the router, defaults the current libp2p version and your peer id
      enabled: true, // defaults to true
      gateway: '', // leave unset to auto-discover
      externalIp: '', // leave unset to auto-discover
      localAddress: '129.168.1.123', // leave unset to auto-discover
      ttl: 7200, // TTL for port mappings (min 20 minutes)
      keepAlive: true, // Refresh port mapping after TTL expires
    }
  })

  await node.start()
  return node
}

;(async () => {
  const node = await createNode();
  console.log("started node with id: ", node.peerId.toString());


  console.log("dialing..");
  try {
    //const ma = new Multiaddr(`/ip4/127.0.0.1/tcp/57090/http/webrtc/p2p/12D3KooWBePkiaZG7RacekCNpgVs2Lnq1ndSJRctX2iNvwr4gP3J`);
    await node.dial(`/ip4/127.0.0.1/tcp/57090/webrtc/p2p/12D3KooWDmw4tBZs5H3HJecB8bUGjAD6qgmVc3noLY9gvesHqEoa`);
  } catch (error) {
    console.log(error);
  }

  // Wait for connection and relay to be bind for the example purpose
  node.peerStore.addEventListener('change:multiaddrs', (evt) => {
    // Updated self multiaddrs?
    if (evt.detail.peerId.equals(node.peerId)) {
      console.log(`Advertising with a relay address of ${node.getMultiaddrs()[0].toString()}`)
    }
  })

  node.addEventListener('peer:discovery', async (event) => {
    const peerInfo = event.detail;
    console.log('Discovered:', peerInfo.id.toString());

    let ctr = 0;
    // if (peerInfo.id.toString() !== '12D3KooWEtPTSacBptvpDxT8yJxXforaEHhP6FjmE7e6jjucULRE' && ctr === 0) {
    //   ctr++;
    //   const ma = new Multiaddr(`/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/12D3KooWEtPTSacBptvpDxT8yJxXforaEHhP6FjmE7e6jjucULRE/p2p-circuit/p2p/${peerInfo.id.toString()}`);
      
    //   console.log("discover but watinggg...");
      
    //   await delay(20 * 1000);

    //   console.log("dialing....");
    //   await node.dial(ma);

    //   ctr++;
    // }

    // console.log("dialing..");
    // try {
    //   const ma = new Multiaddr(`/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/p2p/${peerInfo.id.toString()}`);
    //   await node.dial(ma);
    // } catch (error) {
    //   console.log(error);
    // }
  });

  node.connectionManager.addEventListener('peer:connect', async (event) => {
    const connection = event.detail;
    console.log('Connection established to:', connection.remotePeer.toString());
  });


})()
