import Peer from 'peerjs'

let peerInstance = null

export function createPeer(userId) {
  return new Promise((resolve, reject) => {
    if (peerInstance) {
      resolve(peerInstance)
      return
    }

    const peer = new Peer(`askuni-${userId}-${Date.now()}`, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    })

    peer.on('open', () => {
      peerInstance = peer
      resolve(peer)
    })

    peer.on('error', (err) => {
      console.error('PeerJS error:', err)
      peerInstance = null
      reject(err)
    })

    peer.on('disconnected', () => {
      if (peerInstance === peer) peerInstance = null
    })
  })
}

export function getPeer() {
  return peerInstance
}

export function destroyPeer() {
  if (peerInstance) {
    peerInstance.destroy()
    peerInstance = null
  }
}

export function callPeer(peer, remotePeerId, localStream) {
  if (localStream) {
    return peer.call(remotePeerId, localStream)
  } else {
    return peer.call(remotePeerId, undefined)
  }
}

export function answerCall(call, onStream) {
  call.on('stream', (remoteStream) => {
    onStream(remoteStream, call.peer)
  })
}

export function listenForIncomingCalls(peer, onCall) {
  peer.on('call', (call) => {
    onCall(call)
  })
}
