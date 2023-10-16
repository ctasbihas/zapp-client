import React from "react";

function Input({ name, state, setState, label = false }) {
	return (
		<div className="flex gap-1 flex-col">
			{label && (
				<label className="text-teal-light text-lg px-1" htmlFor={name}>
					{name}
				</label>
			)}
			<input
				className="bg-input-background text-start rounded-lg px-5 py-4 outline-none h-10 w-full text-white"
				type="text"
				placeholder={name}
				value={state}
				name={name}
				onChange={(e) => setState(e.target.value)}
			/>
		</div>
	);
}

export default Input;
