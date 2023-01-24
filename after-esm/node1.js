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
import delay from "delay";

const createNode = async () => {
  const star = webRTCStar({ wrtc: wrtc });
  const node = await createLibp2p({
    addresses: {
      listen: [
        //'/ip4/0.0.0.0/tcp/0',
        
        '/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'

        // TOMORROW :: check with new js-webrtc SERVERRRRR
        // custom deployed webrtc-star signalling server
        //'/ip4/3.87.239.223/tcp/13579/ws/p2p-webrtc-star/'
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
      tcp({
        outboundSocketInactivityTimeout: 0,
        inboundSocketInactivityTimeout: 0
      }),
      //webRTC(),
      //webSockets(),
      //webTransport(),
      star.transport
    ],
    streamMuxers: [
      mplex()
    ],
    peerDiscovery: [
      //bootstrap({ list: [ '/ip4/3.87.239.223/tcp/43311/ws/p2p/12D3KooWErNPNEv8oJd65jWrGyX8c4LuRZdrYCD7x7hYAbpgHaru' ] }),
      mdns({
        interval: 1000
      }),
      star.discovery
    ],
    connectionEncryption: [
      noise()
    ],
    // dht: kadDHT({
    //   kBucketSize: 20,
    //   clientMode: false
    // }),

  })

  await node.start()
  return node
}

;(async () => {
  const node = await createNode();
  console.log("started node with id: ", node.peerId.toString());

  console.log("multiaddr ", node.getMultiaddrs());

  // // Wait for connection and relay to be bind for the example purpose
  // node.peerStore.addEventListener('change:multiaddrs', (evt) => {
  //   // Updated self multiaddrs?
  //   if (evt.detail.peerId.equals(node.peerId)) {
  //     console.log(`Advertising with a relay address of ${node.getMultiaddrs()[0].toString()}`)
  //   }
  // })

  const set = new Set([]);
  node.addEventListener('peer:discovery', async (event) => {
    const peerInfo = event.detail;
    if (!set.has(peerInfo.id.toString())) {
      console.log('Discovered:', peerInfo.id.toString());
      set.add(peerInfo.id.toString());
    }

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
