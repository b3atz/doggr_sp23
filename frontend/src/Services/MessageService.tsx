import { httpClient } from "@/Services/HttpClient.tsx";

export const MessageService= {
	async send(sender_id: number, receiver_id: number, message:string) {
		return httpClient.post("/message", { sender_id, receiver_id, message});
	}
};