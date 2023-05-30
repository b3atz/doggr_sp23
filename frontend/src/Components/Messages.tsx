import { useState, useCallback } from "react";

export const Messages = (props) => {
    const [msg, setMsg] = useState("");

    const onSendMsg = useCallback(async () => {
        
    },[msg]);//Create msg and send to back end"

   return (
        	<div>
			<div>Message</div>

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