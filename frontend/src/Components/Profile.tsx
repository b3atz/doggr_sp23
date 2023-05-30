import { ProfileType } from "@/DoggrTypes.ts";
import { useEffect } from "react";
import "@css/DoggrStyles.css";
import { Link } from "react-router-dom";
import { useAuth } from "@/Services/Auth.tsx";

export type ProfileProps = ProfileType & {
	onLikeButtonClick: () => void;
	onPassButtonClick: () => void;
};

export function Profile(props: ProfileProps) {
	const {id,imgUri, name, petType, onLikeButtonClick, onPassButtonClick} = props;
	const auth = useAuth();

	const minioUrl = "http://localhost:9000/doggr/" + imgUri;

	return (
		<div className={"flex flex-col items-center rounded-box bg-slate-700 w-4/5 mx-auto"}>
			<img className="rounded w-128 h-128" src={minioUrl} alt="Profile of pet" />
			<h2 className={"text-4xl text-blue-600"}>{name}</h2>
			<div className={"text-2xl text-blue-300"}>Pet Type: {petType}</div>
			<div className={"space-x-8 my-1"}>
				<button className="btn btn-circle" onClick={onPassButtonClick}>Pass</button>
				<button className="btn btn-circle" onClick={onLikeButtonClick}>Like</button>
				<Link to="/messages" state={{ sender_id: auth.userId,recevier_id: id, imgUri}}><button className="btn">Message</button></Link>
			</div>
		</div>
	);
}
