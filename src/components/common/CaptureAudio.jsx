import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { ADD_AUDIO_MESSAGES_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
	FaMicrophone,
	FaPauseCircle,
	FaPlay,
	FaStop,
	FaTrash,
} from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";

function CaptureAudio({ setShowAudioRecorder }) {
	const [{userInfo, currentChatUser, socket}, dispatch] = useStateProvider();
	const [isRecording, setIsRecording] = useState(false);
	const [recordedAudio, setRecordedAudio] = useState(null);
	const [waveform, setWaveform] = useState(null);
	const [recordingDuration, setRecordingDuration] = useState(0);
	const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [renderedAudio, setRenderedAudio] = useState(null);

	const audioRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const waveformRef = useRef(null);

	useEffect(() => {
		let interval;
		if (isRecording) {
			interval = setInterval(() => {
				setRecordingDuration((prevDuration) => {
					setTotalDuration(prevDuration + 1);
					return prevDuration + 1;
				});
			}, 1000);
		}
		return () => {
			clearInterval(interval);
		};
	}, [isRecording]);
	useEffect(() => {
		const waveSurfer = WaveSurfer.create({
			container: waveformRef.current,
			waveColor: "#ccc",
			progressColor: "#4a9eff",
			cursorColor: "#7ae3c3",
			barWidth: 2,
			height: 30,
			responsive: true,
		});
		setWaveform(waveSurfer);

		waveSurfer.on("finish", () => {
			setIsPlaying(false);
		});
		return () => {
			waveSurfer.destroy();
		};
	}, []);
	useEffect(() => {
		if (waveform) handleStartRecording();
	}, [waveform]);

	const handleStartRecording = () => {
		setRecordingDuration(0);
		setCurrentPlaybackTime(0);
		setTotalDuration(0);
		setIsRecording(true);
		setRecordedAudio(null)
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				const mediaRecorder = new MediaRecorder(stream);
				mediaRecorderRef.current = mediaRecorder;
				audioRef.current.srcObject = stream;

				const chunks = [];
				mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
				mediaRecorder.onstop = () => {
					const blob = new Blob(chunks, {
						type: "audio/ogg; codecs=opus",
					});
					const audioURL = URL.createObjectURL(blob);
					const audio = new Audio(audioURL);
					setRecordedAudio(audio);

					waveform.load(audioURL);
				};
				mediaRecorder.start();
			})
			.catch((err) => {
				console.log("Error accessing microphone:", err);
			});
	};
	const handleStopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			waveform.stop();
			const audioChunks = [];
			mediaRecorderRef.current.addEventListener(
				"dataavailable",
				(event) => {
					audioChunks.push(event.data);
				}
			);
			mediaRecorderRef.current.addEventListener("stop", () => {
				const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
				const audioFile = new File([audioBlob], "recording.mp3");
				setRenderedAudio(audioFile);
			});
		}
	};

	useEffect(() => {
		if (recordedAudio) {
			const updatePlaybackTime = () => {
				setCurrentPlaybackTime(recordedAudio.currentTime);
			};
			recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
			return () => {
				recordedAudio.removeEventListener(
					"timeupdate",
					updatePlaybackTime
				);
			};
		}
	}, [recordedAudio]);

	const handlePlayRecording = () => {
		if (recordedAudio) {
			waveform.stop();
			waveform.play();
			recordedAudio.play();
			setIsPlaying(true);
		}
	};
	const handlePauseRecording = () => {
		waveform.stop();
		recordedAudio.pause();
		setIsPlaying(false);
	};

	const formatTime = (time) => {
		if (isNaN(time)) return "00:00";
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	};
	const handleSendRecording = async () => {
		try {
			const formData = new FormData();
			formData.append("audio", renderedAudio);
			const response = await axios.post(
				ADD_AUDIO_MESSAGES_ROUTE,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
					params: {
						from: userInfo.id,
						to: currentChatUser.id,
					},
				}
			);
			if (response.status === 201) {
				socket.current.emit("send-msg", {
					to: currentChatUser.id,
					from: userInfo.id,
					message: response.data.message,
				});
				dispatch({
					type: reducerCases.ADD_MESSAGE,
					newMessage: { ...response.data.message },
					fromSelf: true,
				});
			}
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<div className="flex items-center justify-end w-full text-2xl">
			<div className="p-1">
				<FaTrash
					className="text-panel-header-icon cursor-pointer"
					onClick={() => setShowAudioRecorder(false)}
				/>
			</div>
			<div className="mx-4 py-2 px-4 text-white text-lg flex items-center justify-center gap-3 bg-search-input-container-background rounded-full drop-shadow-lg">
				{isRecording ? (
					<div className="text-red-500 animate-pulse w-60 text-center">
						Recording <span>{recordingDuration}s</span>
					</div>
				) : (
					<div>
						{recordedAudio && (
							<>
								{!isPlaying ? (
									<FaPlay
										className="cursor-pointer"
										onClick={handlePlayRecording}
									/>
								) : (
									<FaStop
										className="cursor-pointer"
										onClick={handlePauseRecording}
									/>
								)}
							</>
						)}
					</div>
				)}
				<div
					className="w-60"
					ref={waveformRef}
					hidden={isRecording}
				/>
				{recordedAudio && isPlaying && (
					<span>{formatTime(currentPlaybackTime)}</span>
				)}
				{recordedAudio && !isPlaying && (
					<span>{formatTime(totalDuration)}</span>
				)}
				<audio
					ref={audioRef}
					hidden
				/>
			</div>
			<div className="mr-4">
				{!isRecording ? (
					<FaMicrophone
						className="text-red-500 cursor-pointer"
						onClick={handleStartRecording}
					/>
				) : (
					<FaPauseCircle
						className="text-red-500 cursor-pointer"
						onClick={handleStopRecording}
					/>
				)}
			</div>
			<div>
				<MdSend
					className="text-panel-header-icon cursor-pointer mr-4"
					onClick={handleSendRecording}
				/>
			</div>
		</div>
	);
}

export default CaptureAudio;