import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { Square } from "./useTetris";

interface gameState {
  board: Square[][];
  level: number;
  lines: number;
  score: number;
}

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = new RTCPeerConnection(configuration);

const useRTC = () => {
  const [dataChannel, setDataChannel] = useState<RTCDataChannel>();
  const [opponent, setOpponent] = useState<gameState>({
    board: new Array(20).fill(new Array(10).fill({})),
    level: 0,
    lines: 0,
    score: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState("");
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);

  const getRooms = async () => {
    const roomDocs = await getDocs(collection(db, "calls"));
    const ids: string[] = [];
    roomDocs.forEach((line) => {
      ids.push(line.id);
    });
    return ids;
  };

  const startUp = async () => {
    const currentRooms = await getRooms();

    setConnectionStatus("Searching");
    // If no current rooms create a new room
    if (!currentRooms.length) {
      createRoom();
      return;
    }

    // Go through rooms until one can be connected to
    while (currentRooms.length) {
      const didJoin = await joinRoom(currentRooms.pop()!);
      if (didJoin) {
        return;
      }
    }

    // Create room if did not connect to any
    peerConnection = new RTCPeerConnection();
    createRoom();
  };

  const createRoom = async () => {
    const callDoc = doc(collection(db, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    // Create data channel
    const sendChannel = peerConnection.createDataChannel("sendDataChannel");
    setDataChannel(sendChannel);
    sendChannel.onmessage = (e) => {
      receiveData(e.data);
    };

    // Collect ICE candidates
    peerConnection.addEventListener("icecandidate", async (e: any) => {
      if (!e.candidate) {
        return;
      }
      setIceCandidates((i) => [...i, e.candidate]);
      await addDoc(offerCandidates, e.candidate.toJSON());
    });

    // Create offer
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      offer: {
        type: offerDescription.type,
        sdp: offerDescription.sdp,
      },
    };

    await setDoc(callDoc, offer);

    // Listen for remote answer
    onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data!.answer);
        await peerConnection.setRemoteDescription(answerDescription);
        setConnectionStatus("connected");
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    setConnectionStatus("Waiting for opponent");
  };

  const joinRoom = async (id: string): Promise<boolean> => {
    const callDoc = doc(collection(db, `calls`), id);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    // Check if room already has been answered before and delete if has
    if (!(await getDocs(answerCandidates)).empty) {
      await deleteRoom(id);
      return false;
    }

    // Collect ICE candidates
    peerConnection.addEventListener("icecandidate", async (e: any) => {
      if (!e.candidate) {
        return;
      }
      setIceCandidates((i) => [...i, e.candidate]);
      await addDoc(answerCandidates, e.candidate.toJSON());
    });

    const callData = (await getDoc(callDoc)).data();
    if (!callData) {
      return false;
    }

    const offerDescription = callData.offer;
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer });

    // Listen to remote ICE candidates
    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    setConnectionStatus("Searching");

    try {
      const isConnected: boolean = await new Promise((resolve, reject) => {
        peerConnection.addEventListener("connectionstatechange", (e) => {
          if (peerConnection.connectionState === "connected") {
            resolve(true);
            setConnectionStatus("connected");
          } else if (peerConnection.connectionState === "failed") {
            reject(false);
          }
        });
      });

      if (isConnected) {
        peerConnection.addEventListener("datachannel", (e) => {
          setDataChannel(e.channel);
          e.channel.addEventListener("message", (e) => {
            receiveData(e.data);
          });
        });
      }
      return isConnected;
    } catch (err) {
      return false;
    }
  };

  const deleteRoom = async (id: string) => {
    await deleteDoc(doc(collection(db, "calls"), id));
  };

  const receiveData = (opponentState: string) => {
    setOpponent(JSON.parse(opponentState));
  };

  const sendData = (userState: gameState) => {
    if (!dataChannel || dataChannel.readyState !== "open") {
      return;
    }
    dataChannel.send(JSON.stringify(userState));
  };

  // On first load
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      startUp();
    }, 100);
    return () => {
      clearTimeout(startTimeout);
    };
  }, []);

  return { sendData, opponent, connectionStatus };
};

export default useRTC;
