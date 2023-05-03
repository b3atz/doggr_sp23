import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { Match } from "./db/entities/Match.js";
import {User} from "./db/entities/User.js";
import {Message} from "./db/entities/Message.js";
import {ICreateUsersBody} from "./types.js";
import Filter from "./badWordFilter.js";
import dotenv from "dotenv";

async function DoggrRoutes(app: FastifyInstance, _options = {}) {
	if (!app) {
		throw new Error("Fastify instance has no value during routes construction");
	}
	
	app.get('/hello', async (request: FastifyRequest, reply: FastifyReply) => {
		return 'hello';
	});
	
	app.get("/dbTest", async (request: FastifyRequest, reply: FastifyReply) => {
		return request.em.find(User, {});
	});
	

	
	// Core method for adding generic SEARCH http method
	// app.route<{Body: { email: string}}>({
	// 	method: "SEARCH",
	// 	url: "/users",
	//
	// 	handler: async(req, reply) => {
	// 		const { email } = req.body;
	//
	// 		try {
	// 			const theUser = await req.em.findOne(User, { email });
	// 			console.log(theUser);
	// 			reply.send(theUser);
	// 		} catch (err) {
	// 			console.error(err);
	// 			reply.status(500).send(err);
	// 		}
	// 	}
	// });
	
	// CRUD
	// C
	app.post<{Body: ICreateUsersBody}>("/users", async (req, reply) => {
		const { name, email, petType} = req.body;
		
		try {
			const newUser = await req.em.create(User, {
				name,
				email,
				petType
			});

			await req.em.flush();
			
			console.log("Created new user:", newUser);
			return reply.send(newUser);
		} catch (err) {
			console.log("Failed to create new user", err.message);
			return reply.status(500).send({message: err.message});
		}
	});
	
	//READ
	app.search("/users", async (req, reply) => {
		const { email } = req.body;
		
		try {
			const theUser = await req.em.findOne(User, { email });
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});
	
	// UPDATE
	app.put<{Body: ICreateUsersBody}>("/users", async(req, reply) => {
		const { name, email, petType} = req.body;
		
		const userToChange = await req.em.findOne(User, {email});
		userToChange.name = name;
		userToChange.petType = petType;
		
		// Reminder -- this is how we persist our JS object changes to the database itself
		await req.em.flush();
		console.log(userToChange);
		reply.send(userToChange);
		
	});
	
	// DELETE
	app.delete<{ Body: {email}}>("/users", async(req, reply) => {
		const { email } = req.body;
		
		try {
			const theUser = await req.em.findOne(User, { email });
			
			await req.em.remove(theUser).flush();
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});

	// CREATE MATCH ROUTE
	app.post<{Body: { email: string, matchee_email: string }}>("/match", async (req, reply) => {
		const { email, matchee_email } = req.body;

		try {
			// make sure that the matchee exists & get their user account
			const matchee = await req.em.findOne(User, { email: matchee_email });
			// do the same for the matcher/owner
			const owner = await req.em.findOne(User, { email });

			//create a new match between them
			const newMatch = await req.em.create(Match, {
				owner,
				matchee
			});

			//persist it to the database
			await req.em.flush();
			// send the match back to the user
			return reply.send(newMatch);
		} catch (err) {
			console.error(err);
			return reply.status(500).send(err);
		}
	});

	//Routs of messages 
	//READ all msgs sewnt to me
	app.search("/messages", async(req,reply) => {
		const {receiver} = req.body;
		try{
			const rec = await req.em.findOne(User, { email:receiver },
				{populate: [
					"matched_by",
					"matches",
					"sender",
					"receiver"
				]})
			console.log(rec.receiver);
			return reply.send(rec.receiver);
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);

		}
	});
	//READ recived
	app.search("/messages/sent", async(req,reply) => {
		const {sender} = req.body;
		try{
			const rec = await req.em.findOne(User, { email:sender },
				{populate: [
					"matched_by",
					"matches",
					"sender",
					"receiver"
				]})
			console.log(rec.sender);
			return reply.send(rec.sender);	
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);

		}
	});
		//POST
	app.post<{Body: { sender: string, receiver: string, message: string }}>("/messages", async (req, reply) => {
		const {sender, receiver, message} = req.body;
		try{
			const sen = await req.em.findOne(User, { email: sender },
				{populate: [
					"matched_by",
					"matches",
					"sender",
					"receiver"
				]})
			const rec = await req.em.findOne(User, { email: receiver },
				{populate: [
					"matched_by",
					"matches",
					"sender",
					"receiver"
				
				]});

			const newMsg = await req.em.create(Message, {
				sender: sen,
				receiver: rec,
				message: message
			});
			if(Filter(newMsg.message) != false){
				throw({statusCode:"500",error:"badword"})
			}
			await req.em.flush();
			console.log(newMsg);
			return reply.send(newMsg);

		}catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}
	});
		//PUT
	app.put<{Body: { messageId: number, message: string }}>("/messages", async (req, reply) => {
		const {messageId, message} = req.body;
		try{
			const toChange = await req.em.findOne(Message, {messageId})
			toChange.message = message;

			await req.em.flush();
			console.log(toChange);
			return reply.send(toChange);
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}

	});
	//DEL
	app.delete<{Body: { messageId: number,password: string}}>("/messages", async (req, reply) => {
		const {messageId, password} = req.body;
		try{
			if(password != process.env.ADMIN){
				throw({statusCode:"401",error:"Not admin"})
			}
			const msg = await req.em.findOne(Message, { messageId })
			await req.em.remove(msg).flush();
			console.log(msg);
			reply.send(msg);
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}	
	});		
	//DEL
	app.delete<{Body: { sender: string,password:string }}>("/messages/all", async (req, reply) => {
		const {sender,password} = req.body;
		try{
			const theUser = await req.em.findOne(User, { email:sender },
				{populate: [
					"matched_by",
					"matches",
					"sender",
					"receiver"
				]});
			if(password != process.env.ADMIN){
				throw({statusCode:"401",error:"Not admin"})
			}
			
			for (const i of theUser.sender){
				await req.em.remove(i).flush();
			}
			console.log(theUser);
			reply.send(theUser);
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}
	
	});
}

export default DoggrRoutes;
