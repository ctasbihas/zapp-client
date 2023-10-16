import React, { useEffect, useRef, useState } from "react";
import ChatList from "./ChatList/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import { useRouter } from "next/router";
import axios from "axios";
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE, HOST } from "@/utils/ApiRoutes";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import AudioCall from "./Call/AudioCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingAudioCall from "./common/IncomingAudioCall";

function Main() {
	const [
		{
			userInfo,
			currentChatUser,
			messagesSearch,
			audioCall,
			videoCall,
			incomingAudioCall,
			incomingVideoCall,
		},
		dispatch,
	] = useStateProvider();
	const [socketEvent, setSocketEvent] = useState(false);
	const router = useRouter();
	const socket = useRef();

	useEffect(() => {
		onAuthStateChanged(firebaseAuth, async (currentUser) => {
			if (!currentUser) {
				router.push("/login");
				return;
			}

			if (!userInfo && currentUser.email) {
				const { data } = await axios.post(CHECK_USER_ROUTE, {
					email: currentUser.email,
				});
				if (!data.status) {
					router.push("/login");
				}
				if (data.data) {
					const {
						id,
						name,
						email,
						profilePicture: profileImage,
						status,
					} = data.data;
					dispatch({
						type: reducerCases.SET_USER_INFO,
						userInfo: {
							id,
							name,
							email,
							profileImage,
							status,
						},
					});
				}
			}
		});
	}, [dispatch, router, userInfo]);

	useEffect(() => {
		if (userInfo) {
			socket.current = io(HOST);
			socket.current.emit("add-user", userInfo.id);
			dispatch({ type: reducerCases.SET_SOCKET, socket });
		}
	}, [userInfo]);
	useEffect(() => {
		if (socket.current && !socketEvent) {
			socket.current.on("msg-receive", (data) => {
				dispatch({
					type: reducerCases.ADD_MESSAGE,
					newMessage: {
						...data.message,
					},
				});
			});

			socket.current.on(
				"incoming-audio-call",
				({ from, roomId, callType }) => {
					dispatch({
						type: reducerCases.SET_INCOMING_AUDIO_CALL,
						incomingAudioCall: { ...from, roomId, callType },
					});
				}
			);
			socket.current.on(
				"incoming-video-call",
				({ from, roomId, callType }) => {
					dispatch({
						type: reducerCases.SET_INCOMING_VIDEO_CALL,
						incomingVideoCall: { ...from, roomId, callType },
					});
				}
			);

			socket.current.on("audio-call-rejected", () => {
				dispatch({
					type: reducerCases.END_CALL,
				});
			});
			socket.current.on("video-call-rejected", () => {
				dispatch({
					type: reducerCases.END_CALL,
				});
			});

			socket.current.on("online-users", ({ onlineUsers }) => {
				dispatch({ type: reducerCases.SET_ONLINE_USERS, onlineUsers });
			});

			setSocketEvent(true);
		}
	}, [socket.current]);

	useEffect(() => {
		const getMessages = async () => {
			const {
				data: { messages },
			} = await axios.get(
				`${GET_MESSAGES_ROUTE}/${userInfo?.id}/${currentChatUser?.id}`
			);
			dispatch({ type: reducerCases.SET_MESSAGES, messages });
		};
		if (currentChatUser?.id) {
			getMessages();
		}
	}, [currentChatUser]);

	if (!userInfo) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-800">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
			</div>
		);
	}

	return (
		<>
			{incomingVideoCall && <IncomingVideoCall />}
			{incomingAudioCall && <IncomingAudioCall />}
			{audioCall && (
				<div className="h-screen w-screen max-h-full overflow-hidden">
					<AudioCall />
				</div>
			)}
			{videoCall && (
				<div className="h-screen w-screen max-h-full overflow-hidden">
					<VideoCall />
				</div>
			)}
			{!audioCall && !videoCall && (
				<div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full">
					<ChatList />
					{currentChatUser ? (
						<div
							className={
								messagesSearch
									? "grid grid-cols-2"
									: "grid-cols-2"
							}
						>
							<Chat />
							{messagesSearch && <SearchMessages />}
						</div>
					) : (
						<Empty />
					)}
				</div>
			)}
		</>
	);
}

export default Main;
