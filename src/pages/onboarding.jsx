import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStateProvider } from "@/context/StateContext.jsx";
import Input from "@/components/common/Input";
import Avatar from "@/components/common/Avatar";
import axios from "axios";
import { ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";

function onboarding() {
	const router = useRouter();
	const [{ userInfo, newUser }, dispatch] = useStateProvider();
	const [name, setName] = useState(userInfo?.name || "");
	const [about, setAbout] = useState("Hey there! I am using ZApp.");
	const [image, setImage] = useState(
		userInfo?.profileImage || "/default_avatar.png"
	);

	useEffect(() => {
		if (!newUser && !userInfo?.email) {
			router.push("/login");
		} else if (!newUser && userInfo?.email) {
			router.push("/");
		}
	}, [userInfo, newUser, router]);

	const handleOnboardUser = async () => {
		if (validateDetails()) {
			const email = userInfo.email;
			try {
				const { data } = await axios.post(ONBOARD_USER_ROUTE, {
					email,
					name,
					about: about || "Hey there! I am using ZApp.",
					image,
				});
				if (data.status) {
					dispatch({
						type: reducerCases.SET_NEW_USER,
						newUser: false,
					});
					dispatch({
						type: reducerCases.SET_USER_INFO,
						userInfo: {
							id: data.user.id,
							name,
							email,
							profileImage: image,
							status: about,
						},
					});
					router.push("/");
				}
			} catch (error) {
				console.log(error);
			}
		} else {
			alert("Name should be less than 4 words.");
		}
	};

	const validateDetails = () => {
		if (name.split(" ").length <= 4) {
			return true;
		}
		return false;
	};

	return (
		<div className="flex items-center justify-center bg-panel-header-background h-screen w-screen flex-col text-white">
			<div className="flex items-center justify-center gap-2">
				<Image
					src="/whatsapp.gif"
					alt="ZApp"
					height={300}
					width={300}
				/>
				<span className="text-7xl">ZApp</span>
			</div>
			<h2 className="text-2xl">Create your profile</h2>
			<div className="flex gap-6 mt-6">
				<div className="flex flex-col items-center justify-center gap-6 mt-5">
					<Input
						name="Display Name"
						state={name}
						setState={setName}
						label
					/>
					<Input
						name="About"
						state={about}
						setState={setAbout}
						label
					/>
					<div className="flex items-center justify-center">
						<button
							className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg"
							onClick={handleOnboardUser}
						>
							Create Profile
						</button>
					</div>
				</div>
				<div>
					<Avatar
						type="xl"
						image={image}
						googleProfilePic={userInfo?.profileImage}
						setImage={setImage}
					/>
				</div>
			</div>
		</div>
	);
}

export default onboarding;
