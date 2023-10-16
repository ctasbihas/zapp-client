import { GET_ALL_CONTACTS } from "@/utils/ApiRoutes";
import axios, { all } from "axios";
import React, { useEffect, useState } from "react";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatListItem from "./ChatListItem";

function ContactsList() {
	const [{ userInfo, contactSearch }, dispatch] = useStateProvider();
	const [allContacts, setAllContacts] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchContacts, setSearchContacts] = useState([]);
	useEffect(() => {
		if (searchTerm) {
			const filteredData = {};
			Object.keys(allContacts).forEach((key) => {
				filteredData[key] = allContacts[key].filter((obj) =>
					obj.name
						.toLowerCase()
						.includes(searchTerm.toLocaleLowerCase())
				);
			});
			setSearchContacts(filteredData);
		} else {
			setSearchContacts(allContacts);
		}
	}, [searchTerm]);
	useEffect(() => {
		const getContacts = async () => {
			try {
				const {
					data: { users },
				} = await axios.get(GET_ALL_CONTACTS);
				setAllContacts(users);
				setSearchContacts(users);
			} catch (err) {
				console.log(err);
			}
		};
		getContacts();
	}, []);
	return (
		<div className="h-full flex flex-col">
			<div className="h-28 flex items-end px-6 py-4">
				<div className="flex items-center gap-8 text-white">
					<BiArrowBack
						className="cursor-pointer text-2xl"
						onClick={() =>
							dispatch({
								type: reducerCases.SET_ALL_CONTACTS_PAGE,
							})
						}
					/>
					<span className="text-xl">New Chat</span>
				</div>
			</div>

			<div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
				<div className="flex items-center gap-3 py-3 h-14">
					<div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow mx-4">
						<div>
							<BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" />
						</div>
						<div>
							<input
								type="text"
								placeholder="Search name or email"
								className="bg-transparent text-sm focus:outline-none text-white w-full"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
				</div>
				{Object.entries(searchContacts).map(
					([initialLetter, userList]) => {
						return (
							userList.length > 0 && (
								<div key={Date.now() + initialLetter}>
									{userList.length > 0 && (
										<div className="text-teal-light pl-10 py-5">
											{initialLetter}
										</div>
									)}
									{userList.map((contact) => {
										if (contact.email === userInfo.email) {
											return;
										}
										return (
											<ChatListItem
												key={contact.id}
												data={contact}
												isContactsPage={true}
											/>
										);
									})}
								</div>
							)
						);
					}
				)}
				{allContacts.length === 0 && (
					<div className="flex justify-center items-center">
						<div className="animate-spin rounded-full h-6 w-6 border-t-4 br4 border-b-4 border-teal-light"></div>
					</div>
				)}
			</div>
		</div>
	);
}

export default ContactsList;
