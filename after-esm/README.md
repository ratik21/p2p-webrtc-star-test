# After esm

Running two nodes (1 behind NAT) with latest libp2p version (at current time) using webrtc-star transport in nodejs. In this case discovery and connection is not happening. Related issue [https://discuss.libp2p.io/t/cant-discover-peers-with-webrtc-star-on-js-libp2p-0-37-0/1438](https://discuss.libp2p.io/t/cant-discover-peers-with-webrtc-star-on-js-libp2p-0-37-0/1438).

Node1 (on local)

<img width="1142" alt="image" src="https://user-images.githubusercontent.com/33264364/196118833-f7515808-69dd-40d6-b2f6-c13374e5bb08.png">

Node 2 (on an ec2, behind NAT)

<img width="1268" alt="image" src="https://user-images.githubusercontent.com/33264364/196118867-c1754426-3af5-4ba3-bd40-7e0220cfff70.png">

Discovery and connection is NOT happening now.