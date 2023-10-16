import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ status }) {
	return (
		<>
			{status === "Sent" && <BsCheck className="text-lg" />}
			{status === "Delivered" && <BsCheckAll className="text-lg" />}
			{status === "Read" && (
				<BsCheckAll className="text-lg text-icon-ack" />
			)}
		</>
	);
}

export default MessageStatus;
