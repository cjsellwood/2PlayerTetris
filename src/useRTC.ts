import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const useRTC = () => {
  const [peerConnection, setPeerConnection] = useState(
    new RTCPeerConnection(configuration)
  );
  const [rooms, setRooms] = useState<string[]>([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel>();

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
    setRooms(currentRooms);
    console.log(currentRooms);
    if (!currentRooms.length) {
      createRoom();
    }
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
    peerConnection.addEventListener("icecandidate", async (e) => {
      if (!e.candidate) {
        console.log("Got final candidate");
        return;
      }
      // console.log("Got candidate: ", e.candidate);
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
    console.log(`New room created with SDP offer. Room ID: ${callDoc.id}`);

    // Listen for remote answer
    onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        console.log("Got remote description: ", data.answer);
        const answerDescription = new RTCSessionDescription(data!.answer);
        await peerConnection.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const receiveData = (data: any) => {};

  const sendData = (data: any) => {
    dataChannel?.send(data);
  };

  // On startup
  // useEffect(() => {
  //   startUp();
  // }, []);

  // Test with click button
  const startRTC = () => {
    startUp();
  };

  return { sendData, startRTC };
};

export default useRTC;
