import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import {
	ADD_IMAGE_MESSAGES_ROUTE,
	ADD_MESSAGE_ROUTE,
} from "@/utils/ApiRoutes.js";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaMicrophone } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";
const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
	ssr: false,
});

function MessageBar() {
	const [{ userInfo, currentChatUser, socket }, dispatch] =
		useStateProvider();
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const emojiPickerRef = useRef(null);
	const [grabPhoto, setGrabPhoto] = useState(false);
	const [showAudioRecorder, setShowAudioRecorder] = useState(false);

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (event.target.id !== "emoji-open") {
				if (
					emojiPickerRef.current &&
					!emojiPickerRef.current.contains(event.target)
				) {
					setShowEmojiPicker(false);
				}
			}
		};
		document.addEventListener("click", handleOutsideClick);
		return () => {
			document.removeEventListener("click", handleOutsideClick);
		};
	}, []);
	useEffect(() => {
		if (grabPhoto) {
			const data = document.getElementById("photo-picker");
			data.click();
			document.body.onfocus = () => {
				setTimeout(() => {
					setGrabPhoto(false);
				}, 1000);
			};
		}
	}, [grabPhoto]);

	const photoPickerChange = async (e) => {
		try {
			const file = e.target.files[0];
			const formData = new FormData();
			formData.append("image", file);
			const response = await axios.post(
				ADD_IMAGE_MESSAGES_ROUTE,
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

	const sendMessage = async () => {
		try {
			setMessage("");
			const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
				to: currentChatUser.id,
				from: userInfo.id,
				message,
			});
			socket.current.emit("send-msg", {
				to: currentChatUser.id,
				from: userInfo.id,
				message: data.message,
			});
			dispatch({
				type: reducerCases.ADD_MESSAGE,
				newMessage: { ...data.message },
				fromSelf: true,
			});
		} catch (err) {
			console.log(err);
		}
	};
	const handleEnterKeyPress = (event) => {
		if (event.key === "Enter" && message.trim() !== "") {
			sendMessage();
		}
	};
	return (
		<div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
			{!showAudioRecorder && (
				<>
					<div className="flex gap-6">
						<BsEmojiSmile
							title="Emoji"
							className="text-panel-header-icon cursor-pointer text-2xl"
							id="emoji-open"
							onClick={() => setShowEmojiPicker(!showEmojiPicker)}
						/>
						{showEmojiPicker && (
							<div
								className="absolute bottom-24 z-40"
								ref={emojiPickerRef}
							>
								<EmojiPicker
									onEmojiClick={(emoji) =>
										setMessage(
											(prevMessage) =>
												(prevMessage += emoji.emoji)
										)
									}
									theme="dark"
								/>
							</div>
						)}
						<ImAttachment
							title="Attach"
							className="text-panel-header-icon cursor-pointer text-2xl"
							onClick={() => setGrabPhoto(true)}
						/>
					</div>
					<div className="w-full rounded-lg h-10 flex items-center">
						<input
							type="text"
							placeholder="Type a message"
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleEnterKeyPress}
							value={message}
							className="bg-input-background text-base h-10 focus:outline-none px-5 py-4 text-white rounded-lg w-full"
						/>
					</div>
					<div className="flex w-10 items-center justify-center">
						<button>
							{message ? (
								<MdSend
									className="text-panel-header-icon cursor-pointer text-2xl"
									onClick={sendMessage}
								/>
							) : (
								<FaMicrophone
									className="text-panel-header-icon cursor-pointer text-2xl"
									onClick={() => setShowAudioRecorder(true)}
								/>
							)}
						</button>
					</div>
				</>
			)}
			{grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
			{showAudioRecorder && (
				<CaptureAudio setShowAudioRecorder={setShowAudioRecorder} />
			)}
		</div>
	);
}

export default MessageBar;
