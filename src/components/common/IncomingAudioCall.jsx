import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Image from "next/image";
import React from "react";

function IncomingAudioCall() {
	const [{ incomingAudioCall, socket }, dispatch] = useStateProvider();
	const acceptCall = () => {
		dispatch({
			type: reducerCases.SET_AUDIO_CALL,
			audioCall: { ...incomingAudioCall, type: "in-coming" },
		});
		socket.current.emit("accept-incoming-call", {
			id: incomingAudioCall.id,
		});
		dispatch({
			type: reducerCases.SET_INCOMING_AUDIO_CALL,
			incomingAudioCall: undefined,
		});
	};
	const rejectCall = () => {
		socket.current.emit("reject-audio-call", {
			from: incomingAudioCall.id,
		});
		dispatch({ type: reducerCases.END_CALL });
	};
	return (
		<div className="h-24 w-80 fixed bottom-8 mb-0 right-6 z-50 rounded-sm flex gap-5 items-center justify-start p-4 bg-conversation-panel-background text-white drop-shadow-2xl border-icon-green border-2 py-14">
			<div>
				<Image
					src={incomingAudioCall.profilePicture}
					alt="avatar"
					width={70}
					height={70}
					className="rounded-full"
				/>
			</div>
			<div>
				<div>{incomingAudioCall.name}</div>
				<div className="text-sm">Incoming Audio Call</div>
				<div className="flex gap-2 mt-2">
					<button
						onClick={rejectCall}
						className="bg-red-500 p-1 px-3 text-sm rounded-full"
					>
						Reject
					</button>
					<button
						onClick={acceptCall}
						className="bg-green-500 p-1 px-3 text-sm rounded-full"
					>
						Accept
					</button>
				</div>
			</div>
		</div>
	);
}

export default IncomingAudioCall;
