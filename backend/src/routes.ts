import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { Match } from "./db/entities/Match.js";
import {User} from "./db/entities/User.js";
import {Message} from "./db/entities/Message.js";
import {ICreateUsersBody} from "./types.js";

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
			const rec = await req.em.findOne(User, { receiver })
			console.log(rec.receviedMsgs);
			return reply.send(rec.receviedMsgs)
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);

		}
	});
	//READ recived
	app.search("/messages/sent", async(req,reply) => {
		const {sender} = req.body;
		try{
			const rec = await req.em.findOne(User, { sender })
			console.log(rec.sentMsgs);
			return reply.send(rec.sentMsgs)
		}catch(err){
			console.error(err);
			return reply.status(500).send(err);

		}
	});
		//POST
	app.post<{Body: { sender: string, receiver: string, message: string }}>("/messages", async (req, reply) => {
		const {sender, receiver, message} = req.body;
		try{
			const sen = await req.em.findOne(User, { email: sender })
			const rec = await req.em.findOne(User, { email: receiver })

			const newMsg = await req.em.create(Message, {
				sender: sen,
				receiver: rec,
				message: message
			});
			console.log(newMsg);
			await req.em.flush();
			reply.send(newMsg);

		}catch(err){
			console.error(err);
			return reply.status(500).send(err);
		}
	});
		//PUT
		//DEL
		//DEL
}

export default DoggrRoutes;
