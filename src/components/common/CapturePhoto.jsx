import React, { useEffect, useRef } from "react";
import { IoCamera, IoClose } from "react-icons/io5";

function CapturePhoto({ setImage, hideCapturePhoto }) {
	const videoRef = useRef(null);

	useEffect(() => {
		let stream;
		const startCamera = async () => {
			stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			});
			videoRef.current.srcObject = stream;
		};
		startCamera();
		return () => {
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, []);

	const capturePhoto = () => {
		const canvas = document.createElement("canvas");
		canvas.getContext("2d").drawImage(videoRef.current, 0, 0, 300, 150);
		setImage(canvas.toDataURL("image/jpeg"));
		const stream = videoRef.current.srcObject;
		const videoTrack = stream.getVideoTracks()[0];
		if (videoTrack) {
			videoTrack.stop();
		}

		hideCapturePhoto();
	};
	return (
		<div className="absolute h-4/6 w-2/6 top-1/4 left-1/3 bg-gray-900 gap-3 rounded-lg pt-2 flex items-center justify-center">
			<div className="flex flex-col gap-4 w-full items-center justify-center">
				<div
					className="p-2 cursor-pointer"
					onClick={() => hideCapturePhoto()}
				>
					<IoClose className="h-10 w-10" />
				</div>
				<div>
					<video
						id="video"
						width={400}
						autoPlay
						ref={videoRef}
					></video>
				</div>
				<button
					className="w-fit bg-white rounded-full cursor-pointer border-8 border-teal-light p-2 mb-10 mx-auto"
					onClick={capturePhoto}
				>
					<IoCamera className="text-teal-light text-2xl" />
				</button>
			</div>
		</div>
	);
}

export default CapturePhoto;
