# Before esm

Running two nodes (1 behind NAT) with old libp2p version (before esm upgrade) using webrtc-star transport in nodejs. In this case discovery and connection **is happening**. Nodes are able to discover each other, and connect with each other as well.

Node1 (on local)

<img width="1084" alt="image" src="https://user-images.githubusercontent.com/33264364/196118293-63665315-8765-48d2-9c84-8f798ae41bbd.png">

Node 2 (on an ec2, behind NAT)

<img width="1110" alt="image" src="https://user-images.githubusercontent.com/33264364/196118354-159f46c7-9ad6-4748-a7ca-9bb1d4b1b298.png">

Discovery and connection is happening.