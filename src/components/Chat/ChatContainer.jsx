import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
const VoiceMessage = dynamic(() => import("./VoiceMessage"), { ssr: false });

function ChatContainer() {
	const [{ userInfo, messages }] = useStateProvider();
	return (
		<div className="h-[80vh] w-full relative flex-grow custom-scrollbar overflow-auto">
			<div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed top-0 left-0 z-0"></div>
			<div className="px-10 my-6 relative bottom-0 left-0 z-40">
				<div className="flex w-full">
					<div className="flex flex-col w-full justify-end gap-1 overflow-auto">
						{messages.map((message, index) => (
							<div
								key={message.id}
								className={`flex ${
									message.senderId === userInfo.id
										? "justify-end"
										: "justify-start"
								}`}
							>
								{message.type === "text" && (
									<div
										className={`text-white px-2 py-[5px] text-sm rounded-md flex gap-2 items-start max-w-[45%] ${
											message.senderId === userInfo.id
												? "bg-outgoing-background"
												: "bg-incoming-background"
										}`}
									>
										<span className="break-all">
											{message.message}
										</span>
										<div className="flex gap-1 items-end">
											<span className="text-bubble-meta text-[11px] pt-1.5 min-w-fit">
												{calculateTime(
													message.createdAt
												)}
											</span>
											<span>
												{message.senderId ===
													userInfo.id && (
													<MessageStatus
														status={
															message.messageStatus
														}
													/>
												)}
											</span>
										</div>
									</div>
								)}
								{message.type === "image" && (
									<ImageMessage message={message} />
								)}
								{message.type === "audio" && (
									<VoiceMessage message={message} />
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChatContainer;
