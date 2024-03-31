import Confirmation from "@/my-components/Confirmation";
import axiosApi from "@/utils/axios";

export const VehicleEntry = ({ vehicle, stsList }) => {
	return (
		<div key={vehicle.reg_num} className="flex items-center gap-4 bg-white px-4 py-4 text-sm shadow">
			<div className="w-28 text-center">{vehicle.reg_num}</div>
			<div className="w-[1px] self-stretch bg-gray-400"></div>
			<div className="w-28 text-center">
				<div>{vehicle.type}</div>
				<div>{vehicle.capacity} Ton</div>
			</div>
			<div className="w-[1px] self-stretch bg-gray-400"></div>
			<div className="grid grid-cols-2 justify-items-center gap-x-1">
				<div className="col-span-2">Fuel Cost</div>
				<div>Unloaded</div>
				<div>Loaded</div>
				<div>{vehicle.fuel_cost_unloaded}</div>
				<div>{vehicle.fuel_cost_loaded}</div>
			</div>
			{!!stsList && (
				<select
					className="input"
					defaultValue={"none"}
					onChange={(e) => {
						if (e.target.value === "none") return;
						setStsPrompt(
							<Confirmation
								message={`Are you sure you want to set this vehicle to ward ${e.target.selectedOptions[0].getAttribute("ward_no")}?`}
								confirm={async () => {
									try {
										const res = await axiosApi.post(`/assign/vehicle`, {
											reg_num: vehicle.reg_num,
											sts_id: e.target.value,
										});
										setStsPrompt(null);
										getVehicles();
									} catch (error) {
										console.error(error);
									}
								}}
								cancel={() => {
									setStsPrompt(null);
								}}
							/>
						);
					}}
				>
					<option value="none">Select STS</option>
					{stsList.map((sts) => (
						<option key={sts.id} value={sts.id} ward_no={sts.ward_number}>
							{sts.id}: Ward {sts.ward_number}
						</option>
					))}
				</select>
			)}
		</div>
	);
};
