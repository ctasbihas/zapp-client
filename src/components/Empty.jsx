import Image from "next/image";
import React from "react";

function Empty() {
	return (
		<div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-screen border-b-4 border-b-icon-green justify-center items-center">
			<Image src="/whatsapp.gif" alt="ZApp" height={300} width={300} />
		</div>
	);
}

export default Empty;
