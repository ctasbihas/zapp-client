import { useStateProvider } from "@/context/StateContext";
import dynamic from "next/dynamic";
import React, { useEffect } from "react";
const Container = dynamic(() => import("./Container"), { ssr: false });

function AudioCall() {
	const [{ audioCall, socket, userInfo }] = useStateProvider();

	useEffect(() => {
		if (audioCall.type === "out-going") {
			socket.current.emit("outgoing-audio-call", {
				to: audioCall.id,
				from: {
					id: userInfo.id,
					profilePicture: userInfo.profileImage,
					name: userInfo.name,
				},
				callType: audioCall.callType,
				roomId: audioCall.roomId,
			});
		}
	}, [audioCall]);
	return <Container data={audioCall} />;
}

export default AudioCall;
