import React from "react";

type ConfirmationProps = {
	message: string;
	confirm: () => void;
	cancel: () => void;
};

const Confirmation: React.FC<ConfirmationProps> = ({ message, confirm, cancel }) => {
	return (
		<div className="fixed inset-0 left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black bg-opacity-70">
			<div className="mx-4 w-full max-w-[400px] rounded-md bg-white p-16 shadow max-sm:p-12 max-sm:text-sm">
				<p className="mb-6 text-center text-xl max-sm:mb-4 max-sm:text-lg">{message}</p>
				<div className=" flex w-full items-center justify-center gap-4">
					<button className="btn bg-green-600 font-medium hover:bg-green-700 active:bg-green-800" onClick={confirm}>
						Confirm
					</button>
					<button className="btn bg-red-500 font-medium hover:bg-red-700 active:bg-red-800" onClick={cancel}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default Confirmation;
