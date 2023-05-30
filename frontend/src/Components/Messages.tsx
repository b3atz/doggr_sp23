import { MessageService } from "@/Services/MessageService";
import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

export const Messages = () => {
    const [msg, setMsg] = useState("");

	const location = useLocation()
	const { sender_id,recevier_id,imgUri} = location.state;
	const minioUrl = "http://localhost:9000/doggr/" + imgUri;

    const onSendMsg = () => {
       MessageService.send(sender_id,recevier_id,msg)
	   .catch(err => {
		console.error(err);
	   });
    };//Create msg and send to back end"

   return (
        	<div>
			<div>Message</div>
				<img className="rounded w-128 h-128" src={minioUrl} alt="Profile of pet" />

			<div>
				<label htmlFor={"msg"}>msg:</label>
				<input
					type="text"
					id="msg"
					required
					value={msg}
					onChange={(e) => setMsg(e.target.value)}
					name={"msg"}
				/>
			</div>
			<div>
				<button onClick={onSendMsg}>Send</button>
			</div>
		</div>
    )
};